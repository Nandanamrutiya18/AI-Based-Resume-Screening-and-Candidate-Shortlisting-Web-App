from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import os

from app.database import get_db
from app.models import Resume

router = APIRouter(prefix="/shortlist", tags=["Shortlist"])


class ShortlistRequest(BaseModel):
    user_id: int
    skills: List[str]
    


@router.post("")
def shortlist_resumes(data: ShortlistRequest, db: Session = Depends(get_db)):
    resumes = db.query(Resume).filter(Resume.user_id == data.user_id).all()
    results = []

    required_skills = [s.lower() for s in data.skills]

    for r in resumes:
        text = (r.resume_text or "").lower()

        matched = [s for s in required_skills if s in text]
        missing = [s for s in required_skills if s not in text]

        score = int((len(matched) / len(required_skills)) * 100) if required_skills else 0

        clean_name = r.file_name.split("_", 1)[1] if "_" in r.file_name else r.file_name

        file_url = f"http://127.0.0.1:8000/{r.file_path.replace('\\', '/')}"

        results.append({
            "file_name": clean_name,
            "match_score": score,
            "matched_skills": matched,
            "missing_skills": missing,
            "file_url": file_url
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)

    if results:
        results[0]["best_match"] = True

    return {"results": results}
