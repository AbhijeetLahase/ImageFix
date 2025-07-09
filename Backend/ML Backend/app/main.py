from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
import shutil
import uuid
import os
from app.enhancer import enhance_image  # Assuming the enhance_image function is in enhancer.py

app = FastAPI()

@app.post("/enhance")
async def enhance(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1]
    if ext.lower() not in [".jpg", ".jpeg", ".png"]:
        return {"error": "Unsupported file type"}

    temp_filename = f"temp_{uuid.uuid4()}{ext}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    output_path = enhance_image(temp_filename)
    os.remove(temp_filename)

    return FileResponse(path=output_path, media_type="image/png", filename="enhanced.png")