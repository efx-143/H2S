from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
import os
import google.generativeai as genai
from dotenv import load_dotenv

from app.core.database import get_db
from app.models import Farmer, Plot
from app.schemas import FarmerCreate, Farmer as FarmerSchema
from app.schemas import PlotCreate, Plot as PlotSchema
from app.schemas import DiagnosticRequest, DiagnosticResponse
from app.schemas import AdvisoryRequest, AdvisoryResponse

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

router = APIRouter()

@router.post("/diagnostics/", response_model=DiagnosticResponse)
def analyze_disease(req: DiagnosticRequest):
    if not GEMINI_API_KEY:
        # Mock response if no key is provided
        return DiagnosticResponse(
            disease_name="Mock Leaf Blight",
            confidence=0.85,
            treatment_advisory="Apply Fungicide X and reduce irrigation. (Set GEMINI_API_KEY in .env for real AI)"
        )
    
    try:
        model = genai.GenerativeModel('gemini-3.8-flash')
        prompt = f"Analyze this image of a {req.crop_type} crop. Identify any diseases and suggest treatments. Respond strictly in JSON format with keys: 'disease_name', 'confidence' (float), and 'treatment_advisory'. Provide ALL textual responses in {req.language}."
        
        response = model.generate_content([
            {'mime_type': 'image/jpeg', 'data': req.image_base64},
            prompt
        ])
        
        resp_text = response.text
        if "```json" in resp_text:
            resp_text = resp_text.split("```json")[1].split("```")[0].strip()
        elif "```" in resp_text:
            resp_text = resp_text.split("```")[1].strip()
            
        data = json.loads(resp_text)
        return DiagnosticResponse(
            disease_name=data.get('disease_name', 'Unknown Disease'),
            confidence=float(data.get('confidence', 0.0)),
            treatment_advisory=data.get('treatment_advisory', 'No advisory available.')
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        if "429" in str(e) or "ResourceExhausted" in str(e):
            return DiagnosticResponse(
                disease_name="Rate Limit Exceeded",
                confidence=0.0,
                treatment_advisory="Please wait 20 seconds before scanning again."
            )
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")

@router.post("/advisory/", response_model=AdvisoryResponse)
def generate_advisory(req: AdvisoryRequest):
    if not GEMINI_API_KEY:
        return AdvisoryResponse(
            title="Mock: Light rain expected",
            message="Good time to delay irrigation. (Provide Gemini Key for real advisory)",
            icon="⛅"
        )
    
    try:
        model = genai.GenerativeModel('gemini-3.8-flash')
        prompt = f"""
        Act as an expert agricultural AI. Provide a highly contextual daily advisory for a farmer.
        Crop: {req.crop_type}
        Coordinates: {req.coordinates}
        
        Respond ONLY with a JSON object containing:
        - "title": a short 3-5 word headline in {req.language} (e.g. "Pest Alert", "Ideal Sowing Time", "Heatwave Expected")
        - "message": a 1-2 sentence actionable advice for the farmer based on the crop in {req.language}.
        - "icon": a single relevant emoji (e.g. 🐛, ☀️, 🌧️, 🚜).
        """
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        
        resp_text = response.text
        if "```json" in resp_text:
            resp_text = resp_text.split("```json")[1].split("```")[0].strip()
        elif "```" in resp_text:
            resp_text = resp_text.split("```")[1].strip()
            
        data = json.loads(resp_text)
        return AdvisoryResponse(
            title=data.get('title', 'AI Advisory Ready'),
            message=data.get('message', 'Keep an eye on your crops today.'),
            icon=data.get('icon', '💡')
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        if "429" in str(e) or "ResourceExhausted" in str(e):
            return AdvisoryResponse(
                title="AI Quota Exceeded",
                message="The free AI model can only handle 5 requests per minute. Wait 20s.",
                icon="⏳"
            )
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")

@router.post("/farmers/", response_model=FarmerSchema)
def create_farmer(farmer: FarmerCreate, db: Session = Depends(get_db)):
    db_farmer = db.query(Farmer).filter(Farmer.phone_number == farmer.phone_number).first()
    if db_farmer:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    new_farmer = Farmer(**farmer.model_dump() if hasattr(farmer, 'model_dump') else farmer.dict())
    db.add(new_farmer)
    db.commit()
    db.refresh(new_farmer)
    return new_farmer

@router.get("/farmers/", response_model=List[FarmerSchema])
def get_farmers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Farmer).offset(skip).limit(limit).all()

@router.post("/plots/", response_model=PlotSchema)
def create_plot(plot: PlotCreate, db: Session = Depends(get_db)):
    farmer = db.query(Farmer).filter(Farmer.id == str(plot.farmer_id)).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    # Store geom as JSON string
    geom_str = json.dumps(plot.geom)

    new_plot = Plot(
        farmer_id=str(plot.farmer_id),
        area_hectares=plot.area_hectares,
        crop_type=plot.crop_type,
        geom=geom_str
    )
    db.add(new_plot)
    db.commit()
    db.refresh(new_plot)
    
    try:
        from app.workers.worker import fetch_satellite_data
        fetch_satellite_data.delay(str(new_plot.id))
    except ImportError:
        pass # Worker might not be fully configured yet in tests

    response_plot = PlotSchema(
        id=new_plot.id,
        farmer_id=new_plot.farmer_id,
        area_hectares=new_plot.area_hectares,
        crop_type=new_plot.crop_type,
        geom=plot.geom,
        created_at=new_plot.created_at
    )
    return response_plot

@router.get("/plots/", response_model=List[PlotSchema])
def get_plots(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    plots = db.query(Plot).offset(skip).limit(limit).all()
    
    res = []
    for p in plots:
        geom_dict = None
        if p.geom:
            geom_dict = json.loads(p.geom)
        
        res.append(PlotSchema(
            id=p.id,
            farmer_id=p.farmer_id,
            area_hectares=p.area_hectares,
            crop_type=p.crop_type,
            geom=geom_dict,
            created_at=p.created_at
        ))
    return res
