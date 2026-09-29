from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from app.core.database import get_db
from app.models import Farmer, Plot
from app.schemas import FarmerCreate, Farmer as FarmerSchema
from app.schemas import PlotCreate, Plot as PlotSchema

router = APIRouter()

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
