from fastapi import APIRouter, UploadFile, Form, File
import hashlib
import os
import shutil
from datetime import datetime
from services.common.utils.response_utils import ResponseUtils

router = APIRouter()

"""Admin image upload controller.

Provides an endpoint to upload images, verify optional SHA256 checksum,
and store files under date-based directories.
"""
@router.post("/image")
async def upload(
    img: UploadFile = File(None),
    sha256: str = Form(None),
    ):
    """Upload an image file.

    - Validates presence of file and filename
    - Optionally verifies uploaded content against provided SHA256
    - Saves the file under `uploads/images/<YYYYMMDD>/`
    - Returns the relative `file_path`
    """
    # 1. Get uploaded file name
    if not img:
        return ResponseUtils.error(message="No file provided", code=400)
    
    filename = img.filename
    if not filename:
        return ResponseUtils.error(message="No filename provided", code=400)
    # sanitize filename to prevent path traversal
    filename = os.path.basename(filename)
    
    # enforce content type and size limits
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}
    if img.content_type not in allowed_types:
        return ResponseUtils.error(message="Unsupported file type", code=400)
    
    contents = await img.read()
    max_size = 5 * 1024 * 1024
    if len(contents) > max_size:
        return ResponseUtils.error(message="File too large (max 5MB)", code=413)
    file_hash = hashlib.sha256(contents).hexdigest()
    await img.seek(0)
    
    if sha256 and file_hash != sha256:
        return ResponseUtils.error(message="File SHA256 checksum mismatch", code=400)
    
    today = datetime.now()
    date_dir = today.strftime("%Y%m%d")
    upload_dir = os.path.join("uploads","images", date_dir)
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)
    
    with open(file_path, "wb") as f:
        shutil.copyfileobj(img.file, f)
    
    return ResponseUtils.success(data={
        "file_path": f"/{file_path}",
    })