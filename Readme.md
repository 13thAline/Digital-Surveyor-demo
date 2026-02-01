# 🚗 Digital Surveyor: AI-Powered Vehicle Damage Assessment

Digital Surveyor is an intelligent mobile-first solution that automates vehicle damage detection and cost estimation. By combining edge computing (React Native) with advanced computer vision (YOLOv8 & ZoeDepth), it eliminates the subjectivity and delay in insurance claims, providing instant, transparent repair estimates.

---

## 🏗️ System Architecture

The project follows a **3-tier architecture** designed for speed and reliability.

### 1. The "Edge" Layer (Mobile App)

- **Tech Stack:** React Native (Expo), Expo Camera
- **Role:** The first line of defense. It guides the user to capture high-quality evidence.
- **Key Features:**
  - **Smart Capture:** Real-time camera overlay ("Green Box") ensures the user frames the damage correctly.
  - **Glare Guard:** Analyzes pixel histograms to block photos with excessive reflection or poor lighting.
  - **Secure Upload:** Compresses and encrypts image data for fast transmission to the backend.

### 2. The "Brain" Layer (AI Inference Server)

- **Tech Stack:** Python, FastAPI, PyTorch, YOLOv8, ZoeDepth
- **Role:** The core intelligence that "sees" the damage.
- **Pipeline:**
  - **Part Detection (YOLOv8):** Identifies which car part is visible (e.g., "Bumper," "Door," "Fender").
  - **Damage Segmentation (YOLOv8-Seg):** Pinpoints the exact pixels where scratches or dents exist.
  - **Severity Analysis (ZoeDepth):** Generates a metric depth map to estimate the depth of the dent.
  - **IoU Calculation:** Calculates damage severity score (0-100%) based on damage vs. total part area.

### 3. The "Logic" Layer (Backend API)

- **Tech Stack:** Node.js, Express, PostgreSQL
- **Role:** The business logic that turns AI data into actionable estimates.
- **Key Features:**
  - **Pricing Engine:** Queries a dynamic price matrix database.
    - Formula: `(Base Part Price + Labor Cost) × Damage Severity × Location Multiplier`
  - **PDF Generation:** Auto-generates a professional repair estimate/receipt.
  - **API Gateway:** Orchestrates communication between the App and the Python AI server.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **Python** (v3.10+)
- **PostgreSQL**
- **Expo Go** app on your phone

---

## 🏃 Running the Project

### 1. AI Server (Python)

```bash
cd ai-server
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
> Server runs at: http://localhost:8000

### 2. Backend (Node.js)

```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```
> Server runs at: http://localhost:3000

### 3. Mobile App (Expo)

```bash
cd mobile-app
npm install
npx expo start
```
> Scan the QR code with Expo Go app on your phone

---

## 📸 Usage Workflow

1. **Open the app** and align the vehicle damage within the Green Box.
2. **Capture the photo** — the app validates quality instantly.
3. **Image processing** — sent to Node.js server, forwarded to Python AI.
4. **YOLO detection** — identifies the part (e.g., "Front Bumper") and damage type (e.g., "Dent").
5. **ZoeDepth analysis** — calculates severity via Depth Map.
6. **Cost calculation** — backend computes repair cost and generates PDF.
7. **Final Estimate** — delivered to your phone in under 5 seconds.

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React Native + Expo | Cross-platform, fast iteration, easy camera access |
| Backend | Node.js + Express | Non-blocking I/O for concurrent uploads |
| Database | PostgreSQL | Relational integrity for pricing and claims |
| AI Model | YOLOv8 (Ultralytics) | State-of-the-art object detection |
| Depth Est. | ZoeDepth | Metric depth estimation for dent measurement |

---

## 👥 Contributors

- **Member 1:** Edge Engineering (React Native, Camera Logic)
- **Member 2:** Backend Architecture (Node.js, DB, Pricing Algorithms)
- **Member 3:** AI Specialist (Model Training, Computer Vision Pipeline)

---

## 🔮 Future Improvements

- **Video Analysis:** Walk around the car for full 3D reconstruction
- **Fraud Detection:** AI analysis of metadata to prevent re-uploading old photos
- **AR Overlay:** Augmented Reality markers to guide users to damage points

---

## 📄 License

MIT License