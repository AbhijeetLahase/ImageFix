import os
from uuid import uuid4
from fastapi import UploadFile

TEMP_DIR = "temp/"
os.makedirs(TEMP_DIR, exist_ok=True)

async def save_temp_image(file: UploadFile) -> str:
    file_id = str(uuid4())
    file_path = os.path.join(TEMP_DIR, f"{file_id}.jpg")
    with open(file_path, "wb") as f:
        f.write(await file.read())
    return file_path

def cleanup_temp_files(paths):
    for path in paths:
        try:
            os.remove(path)
        except FileNotFoundError:
            pass
