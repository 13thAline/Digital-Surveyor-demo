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

if UPLOAD_DIR.exists():
    import shutil
    shutil.rmtree(UPLOAD_DIR)
UPLOAD_DIR.mkdir(exist_ok=True)
MODEL_DIR.mkdir(exist_ok=True)

damage_model = None
depth_model = None
device = "cuda" if torch.cuda.is_available() else "cpu"

# ==========================================
# DATA MODELS
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
    heatmapUrl: Optional[str] = None  # This is now the "AR" Composite Image

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
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# ==========================================
# HELPER FUNCTIONS
# ==========================================
def get_severity_from_depth(depth_crop):
    """Calculates severity from a specific depth crop."""
    if depth_crop.size == 0: return 0.0
    
    # Measure variance (roughness) and range (depth difference)
    variance = np.std(depth_crop)
    amplitude = np.max(depth_crop) - np.min(depth_crop)
    
    # Combined score
    raw_score = (variance * 100) + (amplitude * 50)
    return float(round(min(100, raw_score), 2))

def create_composite_heatmap(original_path, depth_map, boxes, file_id):
    """
    Creates a single image where ONLY the bounding boxes are replaced 
    with their heatmap versions.
    """
    # 1. Read Original Image
    original_img = cv2.imread(str(original_path))
    if original_img is None: return None

    # 2. Resize Depth Map to match Original Image exactly
    # ZoeDepth outputs different sizes, so we must align them
    h, w = original_img.shape[:2]
    depth_resized = cv2.resize(depth_map, (w, h))

    # 3. Create a canvas (copy of original)
    composite_img = original_img.copy()

    # 4. Iterate over boxes and "paint" the heatmap
    for box in boxes:
        x, y, bw, bh = int(box['x']), int(box['y']), int(box['width']), int(box['height'])
        
        # Clamp coordinates
        x = max(0, x); y = max(0, y)
        bw = min(bw, w - x); bh = min(bh, h - y)
        if bw <= 0 or bh <= 0: continue

        # Extract Depth ROI
        depth_roi = depth_resized[y:y+bh, x:x+bw]

        # Normalize ROI to 0-255 for color mapping
        # We normalize *locally* to maximize contrast for this specific dent
        norm_roi = cv2.normalize(depth_roi, None, 0, 255, cv2.NORM_MINMAX)
        norm_roi = norm_roi.astype(np.uint8)

        # Apply Colormap (Magma is great for depth)
        heatmap_patch = cv2.applyColorMap(norm_roi, cv2.COLORMAP_MAGMA)

        # Paste it back into the composite image
        composite_img[y:y+bh, x:x+bw] = heatmap_patch

        # Optional: Draw a white border around the patch to make it pop
        cv2.rectangle(composite_img, (x, y), (x+bw, y+bh), (255, 255, 255), 2)

    # 5. Save the final result
    filename = f"{file_id}_composite.jpg"
    save_path = UPLOAD_DIR / filename
    cv2.imwrite(str(save_path), composite_img)
    
    return f"/uploads/{filename}"

# ==========================================
# MAIN ROUTE
# ==========================================
@app.post("/analyze", response_model=MultiDamageResponse)
async def analyze(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}{Path(file.filename).suffix}"
    
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    if not damage_model: raise HTTPException(500, "YOLO model not loaded")
    
    # 1. RUN YOLO - Only show detections with >25% confidence
    results = damage_model(str(file_path), conf=0.25, iou=0.50)
    
    detections = []
    annotated_url = None
    composite_url = None
    
    # 2. RUN ZOEDEPTH (Full Image)
    depth_numpy = None
    if depth_model:
        pil_img = Image.open(file_path).convert("RGB")
        depth_numpy = depth_model.infer_pil(pil_img)

    if results and len(results[0].boxes) > 0:
        r = results[0]
        
        # Save Annotated (Bounding Boxes Only)
        annotated_name = f"{file_id}_annotated.jpg"
        r.save(filename=str(UPLOAD_DIR / annotated_name))
        annotated_url = f"/uploads/{annotated_name}"

        # Collect boxes for the composite image
        boxes_for_heatmap = []

        for box in r.boxes:
            c = box.xyxy[0].tolist()
            bbox = {
                "x": c[0], "y": c[1], 
                "width": c[2] - c[0], "height": c[3] - c[1]
            }
            boxes_for_heatmap.append(bbox)

            severity = 0.0
            depth_val = 0.0

            if depth_numpy is not None:
                # Resize depth to match image for accurate calculations
                pil_w, pil_h = pil_img.size
                depth_resized = cv2.resize(depth_numpy, (pil_w, pil_h))
                
                # Extract Crop
                x, y, w, h = int(bbox['x']), int(bbox['y']), int(bbox['width']), int(bbox['height'])
                x = max(0, x); y = max(0, y) # safety
                depth_crop = depth_resized[y:y+h, x:x+w]

                if depth_crop.size > 0:
                    severity = get_severity_from_depth(depth_crop)
                    depth_val = float(np.max(depth_crop) - np.min(depth_crop))

            detections.append({
                "partDetected": "Vehicle Part",
                "damageType": r.names[int(box.cls)],
                "severityScore": severity,
                "confidenceScore": float(box.conf),
                "depthEstimate": depth_val,
                "boundingBox": bbox
            })

        # 3. GENERATE COMPOSITE HEATMAP (The AR View)
        if depth_numpy is not None:
            composite_url = create_composite_heatmap(file_path, depth_numpy, boxes_for_heatmap, file_id)

    return {
        "detections": detections,
        "annotatedImageUrl": annotated_url,
        "heatmapUrl": composite_url  # <-- This is your new "Hybrid" image
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)