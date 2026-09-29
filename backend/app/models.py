import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import enum
import json

class LanguagePreference(enum.Enum):
    ENGLISH = "English"
    HINDI = "Hindi"
    MARATHI = "Marathi"
    TELUGU = "Telugu"

class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    agristack_id = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, index=True)
    phone_number = Column(String, unique=True, index=True)
    language_preference = Column(Enum(LanguagePreference), default=LanguagePreference.HINDI)
    created_at = Column(DateTime, default=datetime.utcnow)

class Plot(Base):
    __tablename__ = "plots"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id = Column(String, ForeignKey("farmers.id"))
    geom = Column(String)  # Stored as JSON string
    area_hectares = Column(Float)
    crop_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
