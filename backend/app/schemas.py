from pydantic import BaseModel
from typing import Optional, Any
from uuid import UUID
from datetime import datetime
from app.models import LanguagePreference

class FarmerBase(BaseModel):
    agristack_id: Optional[str] = None
    name: str
    phone_number: str
    language_preference: Optional[LanguagePreference] = LanguagePreference.HINDI

class FarmerCreate(FarmerBase):
    pass

class Farmer(FarmerBase):
    id: UUID
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

class PlotBase(BaseModel):
    farmer_id: UUID
    area_hectares: float
    crop_type: str
    geom: Any  # Accept GeoJSON dictionary

class PlotCreate(PlotBase):
    pass

class Plot(PlotBase):
    id: UUID
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

class DiagnosticRequest(BaseModel):
    image_base64: str
    crop_type: Optional[str] = "Unknown"
    language: Optional[str] = "English"

class DiagnosticResponse(BaseModel):
    disease_name: str
    confidence: float
    treatment_advisory: str

class AdvisoryRequest(BaseModel):
    crop_type: str
    coordinates: Optional[Any] = None
    language: Optional[str] = "English"

class AdvisoryResponse(BaseModel):
    title: str
    message: str
    icon: str
