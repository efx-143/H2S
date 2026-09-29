# AgriLink DPG - Digital Public Good for Agriculture 🌱

AgriLink DPG is an interoperable Digital Agriculture Network aimed at empowering farmers with a modern, offline-first mobile companion and a robust centralized backend.

The platform allows farmers to:
- **Map their farms** by drawing polygon boundaries or selecting coordinates.
- **Set up profiles** locally without requiring a constant internet connection.
- **Sync data to the cloud** when connectivity is available.
- **Access localized advisories** and weather updates.

---

## 📱 Mobile App (React Native + Expo)

The frontend is a gorgeous, offline-first React Native mobile app built using Expo, styled with Tailwind CSS, and optimized for both Android/iOS and Web.

### Key Features
- **Offline-First Capabilities**: Uses `AsyncStorage` and `expo-sqlite` to keep the app fully functional without an internet connection.
- **Tailwind Styling**: Uses `twrnc` to provide a premium, modern design with sleek UI components.
- **Interactive Map Setup**: Farmers can visualize their farm locations using `react-native-maps` (with fallback iFrame support for Web).
- **One-Time Onboarding**: Persistent farmer profile setup flow.
- **Cloud Sync**: A dedicated "Sync Data" button in the dashboard that pushes offline plots to the backend API.

### How to run the Mobile App
1. Navigate to the `mobile_app` directory: `cd mobile_app`
2. Install dependencies: `npm install`
3. Start the Expo bundler: `npm run start`
4. Press `w` to open it in a web browser, or use the Expo Go app on your phone.

---

## ⚙️ Backend API (FastAPI + SQLite)

The backend is built using Python's FastAPI framework for high performance and rapid development. It is designed to receive synced offline data from the mobile app and process it.

### Key Features
- **FastAPI Endpoints**: Fully documented API endpoints for Farmers (`/api/v1/farmers/`) and Plots (`/api/v1/plots/`).
- **Local Database**: Adapted to use a lightweight SQLite database (`agro_dpg.db`) for easy testing without Docker or PostGIS overhead.
- **SQLAlchemy ORM**: robust database schemas to model Farmers, language preferences, and GeoJSON plot locations.

### How to run the Backend API
1. Navigate to the `backend` directory: `cd backend`
2. Install dependencies: `python -m pip install -r requirements.txt`
3. Start the server: `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
4. Open the API Documentation (Swagger UI) at: `http://localhost:8000/docs`

---

## 🤝 Next Steps & Future Work
- Connect the **Disease Diagnostic ML Model Pipeline**.
- Build out the **Scanner Tab** functionality.
- Extend backend workers (Celery/Redis) to fetch real-time satellite data for plotted farm boundaries.
