import os
import uuid
import torch
import cv2
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
from PIL import Image
from ultralytics import YOLO

# ==========================================
# CONFIGURATION
# ==========================================
UPLOAD_DIR = Path("uploads")
MODEL_DIR = Path("models")
YOLO_MODEL_PATH = MODEL_DIR / "best.pt"
ZOE_REPO = "isl-org/ZoeDepth"
ZOE_MODEL_TYPE = "ZoeD_N" 

UPLOAD_DIR.mkdir(exist_ok=True)
MODEL_DIR.mkdir(exist_ok=True)

damage_model = None
depth_model = None
device = "cuda" if torch.cuda.is_available() else "cpu"

# ==========================================
# NEW DATA MODELS (List Support)
# ==========================================
class SingleDetection(BaseModel):
    partDetected: str
    damageType: str
    severityScore: float
    confidenceScore: float
    depthEstimate: float
    boundingBox: dict

class MultiDamageResponse(BaseModel):
    detections: List[SingleDetection]
    annotatedImageUrl: Optional[str] = None
    heatmapUrl: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    yolo_loaded: bool
    zoe_loaded: bool
    device: str

# ==========================================
# MODEL LOADING
# ==========================================
def load_yolo():
    global damage_model
    try:
        if YOLO_MODEL_PATH.exists():
            print(f"📦 Loading Custom YOLO Model from {YOLO_MODEL_PATH}...")
            damage_model = YOLO(str(YOLO_MODEL_PATH))
            print("✅ YOLO Loaded Successfully")
        else:
            print("⚠️ Custom model not found. Using generic YOLOv8n...")
            damage_model = YOLO("yolov8n.pt")
    except Exception as e:
        print(f"❌ Failed to load YOLO: {e}")

def load_zoedepth():
    global depth_model
    try:
        print(f"🌊 Loading ZoeDepth ({ZOE_MODEL_TYPE}) on {device}...")
        model = torch.hub.load(ZOE_REPO, ZOE_MODEL_TYPE, pretrained=True)
        depth_model = model.to(device).eval()
        print("✅ ZoeDepth Loaded Successfully")
    except Exception as e:
        print(f"❌ Failed to load ZoeDepth: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting AI Server...")
    load_yolo()
    load_zoedepth()
    yield
    print("🛑 Shutting down...")

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# ==========================================
# HELPER FUNCTIONS
# ==========================================
def get_severity_from_depth(depth_map, bbox):
    x, y, w, h = int(bbox['x']), int(bbox['y']), int(bbox['width']), int(bbox['height'])
    if w <= 0 or h <= 0: return 0.0
    roi = depth_map[y:y+h, x:x+w]
    if roi.size == 0: return 0.0
    depth_variance = np.std(roi)
    return float(round(min(100, (depth_variance * 500)), 2))

def create_heatmap(image_path, depth_map, file_id):
    plt.figure(figsize=(10, 10))
    plt.imshow(depth_map, cmap='magma')
    plt.axis('off')
    heatmap_filename = f"{file_id}_heatmap.jpg"
    plt.savefig(UPLOAD_DIR / heatmap_filename, bbox_inches='tight', pad_inches=0)
    plt.close()
    return f"/uploads/{heatmap_filename}"

# ==========================================
# ROUTES
# ==========================================
@app.get("/health", response_model=HealthResponse)
def health():
    return {
        "status": "active",
        "yolo_loaded": damage_model is not None,
        "zoe_loaded": depth_model is not None,
        "device": device
    }

@app.post("/analyze", response_model=MultiDamageResponse)
async def analyze(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}{Path(file.filename).suffix}"
    
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    if not damage_model:
        raise HTTPException(500, "YOLO model not loaded")
    
    # 1. RUN YOLO
    results = damage_model(str(file_path), conf=0.15) # Lower confidence to find more damages
    
    detections = []
    annotated_url = None
    heatmap_url = None
    
    # 2. RUN ZOEDEPTH (Once for the whole image)
    depth_numpy = None
    if depth_model:
        pil_img = Image.open(file_path).convert("RGB")
        depth_tensor = depth_model.infer_pil(pil_img)
        depth_numpy = depth_tensor
        heatmap_url = create_heatmap(str(file_path), depth_numpy, file_id)

    # 3. PROCESS EACH BOX (The Loop)
    if results and len(results[0].boxes) > 0:
        r = results[0]
        
        # Save Annotated Image with ALL boxes
        annotated_name = f"{file_id}_annotated.jpg"
        r.save(filename=str(UPLOAD_DIR / annotated_name))
        annotated_url = f"/uploads/{annotated_name}"

        for box in r.boxes:
            c = box.xyxy[0].tolist()
            detected_class = r.names[int(box.cls)]
            confidence = float(box.conf)
            bbox = {
                "x": c[0], "y": c[1], 
                "width": c[2] - c[0], "height": c[3] - c[1]
            }

            # Calculate specific severity for THIS box
            severity = 0.0
            depth_val = 0.0
            
            if depth_numpy is not None:
                severity = get_severity_from_depth(depth_numpy, bbox)
                # Estimate depth
                x, y, w, h = int(bbox['x']), int(bbox['y']), int(bbox['width']), int(bbox['height'])
                if w > 0 and h > 0:
                    roi = depth_numpy[y:y+h, x:x+w]
                    if roi.size > 0:
                        depth_val = float(np.max(roi) - np.min(roi))

            detections.append({
                "partDetected": "Vehicle Part",
                "damageType": detected_class,
                "severityScore": severity,
                "confidenceScore": confidence,
                "depthEstimate": depth_val,
                "boundingBox": bbox
            })

    return {
        "detections": detections,
        "annotatedImageUrl": annotated_url,
        "heatmapUrl": heatmap_url
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)