from fastapi import APIRouter, UploadFile, Form, File
import hashlib
import os
import shutil
from datetime import datetime
from services.common.utils.response_utils import ResponseUtils

router = APIRouter()

@router.post("/image")
async def upload(
    img: UploadFile = File(None),
    sha256: str = Form(None),
    ):
    # 1. 获取上传文件的名称
    if not img:
        return ResponseUtils.error(message="未提供文件", code=400)
    
    filename = img.filename
    if not filename:
        return ResponseUtils.error(message="未提供文件名称", code=400)
    
    # 2. 计算上传文件的sha256值
    contents = await img.read()
    file_hash = hashlib.sha256(contents).hexdigest()
    
    # 重置文件指针，以便后续保存文件
    await img.seek(0)
    
    # 检查sha256是否一致
    if sha256 and file_hash != sha256:
        return ResponseUtils.error(message="文件SHA256校验失败", code=400)
    
    # 3. 根据当前日期创建目录
    today = datetime.now()
    date_dir = today.strftime("%Y%m%d")
    
    # 创建上传目录
    upload_dir = os.path.join("uploads","images")
    upload_dir = os.path.join(upload_dir, date_dir)
    os.makedirs(upload_dir, exist_ok=True)
    # 保存文件
    file_path = os.path.join(upload_dir, filename)
    
    with open(file_path, "wb") as f:
        shutil.copyfileobj(img.file, f)
    
    return ResponseUtils.success(data={
        "file_path": f"/{file_path}",
    })