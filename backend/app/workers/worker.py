import os
from celery import Celery
import time
import logging

logger = logging.getLogger(__name__)

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

if os.getenv("DOCKER_ENV"):
    CELERY_BROKER_URL = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND = "redis://redis:6379/0"

celery_app = Celery(
    "agro_dpg_worker",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(name="fetch_satellite_data")
def fetch_satellite_data(plot_id: str):
    """
    Mock task to fetch Sentinel-2 satellite data for a newly created plot.
    """
    logger.info(f"Starting satellite data fetch for plot: {plot_id}")
    
    # Mock processing delay
    time.sleep(5)
    
    logger.info(f"Successfully processed satellite imagery for plot: {plot_id}. "
                f"Calculated NDVI, NDWI, and NDRE.")
    
    # In a real scenario, we would save these metrics to the SatellitePasses table
    
    return {"status": "success", "plot_id": plot_id, "mock_ndvi": 0.65}
