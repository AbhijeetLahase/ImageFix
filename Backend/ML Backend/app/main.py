from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse
from app.enhancer import enhance_image
from app.utils import save_temp_image, cleanup_temp_files

app = FastAPI()

@app.post("/enhance")
async def enhance(file: UploadFile = File(...)):
    temp_path = await save_temp_image(file)
    enhanced_path = enhance_image(temp_path)
    cleanup_temp_files([temp_path])
    return FileResponse(enhanced_path, media_type="image/jpeg", filename="enhanced.jpg")
