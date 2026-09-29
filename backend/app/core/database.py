from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# Default to a local connection if not provided (e.g. for testing outside docker)
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./agro_dpg.db"
)

# For docker-compose, the host is usually 'db'
if os.getenv("DOCKER_ENV"):
    DATABASE_URL = "postgresql://postgres:password@db:5432/agro_dpg"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
