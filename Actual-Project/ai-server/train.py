from ultralytics import YOLO

if __name__ == '__main__':
    # 1. Load the model
    model = YOLO("yolov8n.pt")

    # 2. Train the model
    model.train(
        data="datasets/data.yaml",
        epochs=50,
        imgsz=640,
        name="damage_model",
        device=0
    )