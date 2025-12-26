from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import os, re

from rank_bm25 import BM25Okapi
from app.database import get_db
from app.models import Resume

router = APIRouter(prefix="/shortlist", tags=["Shortlist"])


class ShortlistRequest(BaseModel):
    user_id: int
    skills: List[str]
    upload_batch_id: str


def tokenize(text: str):
    return re.findall(r"\b\w+\b", text.lower())


@router.post("")
def shortlist_resumes(data: ShortlistRequest, db: Session = Depends(get_db)):

    resumes = db.query(Resume).filter(
        Resume.user_id == data.user_id,
        Resume.upload_batch_id == data.upload_batch_id
    ).all()

    if not resumes:
        return {"results": []}

    # ✅ Clean skills
    skills = []
    for s in data.skills:
        skills.extend(
            skill.strip().lower()
            for skill in s.split(",")
            if skill.strip()
        )

    results = []

    # ✅ Prepare corpus (FILTER EMPTY TEXTS)
    corpus = []
    resume_map = []  # keeps index mapping

    for r in resumes:
        tokens = tokenize(r.resume_text or "")
        if tokens:
            corpus.append(tokens)
            resume_map.append(r)

    bm25 = None
    bm25_scores = []

    # ✅ SAFE BM25 INITIALIZATION
    if corpus:
        bm25 = BM25Okapi(corpus)
        bm25_scores = bm25.get_scores(skills)

    for idx, r in enumerate(resumes):
        text = (r.resume_text or "").lower()

        matched = []
        missing = []

        for skill in skills:
            if re.search(rf"\b{re.escape(skill)}\b", text):
                matched.append(skill)
            else:
                missing.append(skill)

        # ✅ FINAL SCORE = SKILL MATCH %
        match_score = int((len(matched) / len(skills)) * 100) if skills else 0

        clean_name = r.file_name.split("_", 1)[1] if "_" in r.file_name else r.file_name
        file_url = f"http://127.0.0.1:8000/uploaded_resumes/{os.path.basename(r.file_path)}"

        # Save DB
        r.match_score = match_score
        r.matched_skills = ", ".join(matched)
        r.missing_skills = ", ".join(missing)

        results.append({
            "file_name": clean_name,
            "match_score": match_score,
            "matched_skills": matched,
            "missing_skills": missing,
            "file_url": file_url
        })

    db.commit()

    # ✅ SORT ONLY BY MATCH SCORE (STABLE & ACCURATE)
    results.sort(key=lambda x: x["match_score"], reverse=True)

    if results:
        results[0]["best_match"] = True

    return {"results": results}
