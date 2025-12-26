from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from typing import List
import os, uuid

import pdfplumber  # ✅ BETTER PDF TEXT EXTRACTION

from app.database import get_db
from app.models import Resume

router = APIRouter()

UPLOAD_DIR = "uploaded_resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ✅ FIXED: STRONG & ACCURATE TEXT EXTRACTION
def extract_pdf_text(path: str) -> str:
    text = ""
    try:
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + " "
    except Exception as e:
        print("PDF extract error:", e)

    return text.lower()  # normalize here


@router.post("/upload/")
async def upload_resume(
    upload_type: str = Form(...),
    user_id: int = Form(...),
    file: UploadFile = File(None),
    files: List[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    saved = []

    # ✅ NEW BATCH ID PER UPLOAD
    upload_batch_id = str(uuid.uuid4())

    def save_resume(file_name: str, path: str):
        text = extract_pdf_text(path)

        resume = Resume(
            user_id=user_id,
            file_name=file_name,
            file_path=path.replace("\\", "/"),
            resume_text=text,
            upload_batch_id=upload_batch_id
        )

        db.add(resume)
        db.commit()

    # ✅ SINGLE FILE
    if upload_type == "single" and file:
        name = f"{uuid.uuid4()}_{file.filename}"
        path = os.path.join(UPLOAD_DIR, name).replace("\\", "/")

        with open(path, "wb") as f:
            f.write(await file.read())

        save_resume(name, path)
        saved.append(name)

    # ✅ MULTIPLE FILES
    elif upload_type == "multiple" and files:
        for f in files:
            name = f"{uuid.uuid4()}_{f.filename}"
            path = os.path.join(UPLOAD_DIR, name).replace("\\", "/")

            with open(path, "wb") as out:
                out.write(await f.read())

            save_resume(name, path)
            saved.append(name)

    return {
        "message": "Upload successful",
        "files": saved,
        "upload_batch_id": upload_batch_id
    }
