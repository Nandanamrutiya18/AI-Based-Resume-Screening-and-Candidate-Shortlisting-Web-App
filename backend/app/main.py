from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes import auth_routes, upload_routes, shortlist_routes
from app.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Serve uploaded PDFs
app.mount(
    "/uploaded_resumes",
    StaticFiles(directory="uploaded_resumes"),
    name="uploaded_resumes"
)

# ✅ Register routes
app.include_router(auth_routes.router)
app.include_router(upload_routes.router)
app.include_router(shortlist_routes.router)
