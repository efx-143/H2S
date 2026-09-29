from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.core.database import engine, Base

# Create tables in sqlite
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Digital Public Good - Agriculture API",
    description="Backend for the Interoperable Digital Agriculture Network",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Digital Public Good Agriculture API"}
