# Project Handoff Context: Interoperable Digital Agriculture Network (DPG)

**Note to the new AI AI Assistant:** 
Read this entire document carefully. It contains the project specification, the agreed-upon architectural blueprint, and the exact state of the codebase that was built prior to transitioning to this new machine.

---

## 1. Current State & Immediate Next Steps
**What is already built (Phase 1 Completed):**
- **Backend:** Python virtual environment with heavy geospatial packages (`geopandas`, `rasterio`, `shapely`) and `celery`/`redis`. 
- **Database:** FastAPI server with `app/core/database.py` and `app/models.py` (defining `Farmers` and `Plots` with PostGIS Geometry columns). `alembic` is configured. Docker setup (`docker-compose.yml`, `Dockerfile`) is ready for PostGIS and Redis.
- **Frontend:** React Native app (Expo) initialized in `mobile_app/`. `App.tsx` has a MapBox/Google Map view rendering dummy GeoJSON polygons, and successfully initializes an offline `expo-sqlite` database mapping the `plots` table.

**Immediate Next Steps for you:**
1. **FastAPI Endpoints:** Create CRUD REST API endpoints in the backend to allow the React Native app to sync the `plots` and `farmers` data from its offline SQLite DB to the remote PostGIS DB.
2. **Background Tasks:** Scaffold the Celery worker (`worker.py`) that will mock fetching Sentinel-2 satellite data for newly created plots.

---

## 2. Complete Architecture Blueprint

### End-to-End System Architecture
The system employs a microservices architecture centered around FastAPI, with a robust async processing layer for heavy data ingestion and machine learning inference. It supports a dual-channel client strategy: a low-bandwidth WhatsApp/Telegram interface and a rich offline-first Native Mobile App.

*   **Client Tier:** Farmer Companion App (React Native, Offline-First), WhatsApp/Telegram Bot, SMS Fallback.
*   **API Gateway & Auth:** FastAPI Gateway, AgriStack Auth / DPI.
*   **Core Microservices:** Geospatial Service, Data Fusion Service, Advisory Engine (RAG), Computer Vision Diagnostic, Communication Service, Federation API.
*   **Async Processing Layer:** Redis/Celery Queue, Satellite Data Worker, ML Inference Worker.
*   **Data Storage:** PostgreSQL + PostGIS, ChromaDB/Qdrant (Vector DB), Redis Cache.

### Database & Entity Schema (PostGIS)
*   **`Farmers`**: `id`, `agristack_id`, `name`, `phone_number`, `language_preference`, `created_at`
*   **`Plots`**: `id`, `farmer_id`, `geom` (Polygon, EPSG:4326), `area_hectares`, `crop_type`, `created_at`
*   **`SatellitePasses`**: `id`, `plot_id`, `pass_date`, `ndvi`, `ndwi`, `ndre`, `source`, `raster_tile_url`
*   **`SoilProfiles`**: `id`, `plot_id`, `sample_date`, `ph`, `nitrogen`, `phosphorus`, `potassium`, `organic_carbon`, `electrical_conductivity`
*   **`WeatherLogs`**: `id`, `plot_id`, `date`, `max_temp`, `min_temp`, `precipitation`, `humidity`, `wind_speed`
*   **`Alerts`**: `id`, `farmer_id`, `plot_id`, `alert_type`, `message`, `sent_via`, `status`, `created_at`
*   **`DiseaseScans`**: `id`, `farmer_id`, `plot_id`, `image_url`, `detection_result`, `confidence_score`, `pathogen_type`, `recommended_action`, `scanned_at`, `synced`

### Phased Implementation Roadmap
**Phase 1: Core DB, Geo-Ingestion, & Mobile App Foundation (Currently Completed)**
*   Setup PostgreSQL + PostGIS, Alembic migrations, FastAPI foundation.
*   Initialize React Native app, local DB (SQLite), map integration, and plot drawing UI.

**Phase 2: Live Sentinel-2 STAC Pipeline & Soil/Weather Fusion Logic (Next Phase)**
*   Connect Celery workers to Copernicus/STAC APIs for Sentinel-2 imagery. Calculate NDVI, NDWI, NDRE.
*   Integrate Open-Meteo/IMD APIs. Synthesize weather, soil parameters, and satellite indices.
*   Implement map overlays for farmers to view satellite heatmaps over digitized plots.

**Phase 3: Crop Disease Diagnostic Model Pipeline**
*   Fine-tune YOLOv8/MobileNetV3 on crop disease datasets. Deploy as FastAPI inference service.
*   Build offline queuing mechanism in Mobile App for background disease photo syncing.

**Phase 4: Advisory Engine (RAG) + Vernacular Bot Integration**
*   Ingest agronomic advisory manuals into ChromaDB/Qdrant. Create RAG pipeline.
*   Integrate Bhashini API for translation. Build WhatsApp/Telegram webhook interfaces.
*   Develop Geotagged Directory utilizing GPS in Mobile App.

**Phase 5: DPG Interoperability APIs & State Federation Endpoints**
*   Expose RESTful/gRPC Federated Registry APIs. Finalize AgriStack DPI integration.
*   Containerize all services (Docker/Kubernetes).
