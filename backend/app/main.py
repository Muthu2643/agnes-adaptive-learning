import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed_data import seed_database
from app.routers import agent_tools, educator, learner, analytics

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agnes.main")

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Seed grounded knowledge base and demo data
with SessionLocal() as db:
    seed_database(db)

app = FastAPI(
    title="Agnes 3.0 Flash Educational Platform",
    description="Agentic Adaptive Learning System Powered by Agnes 3.0 Flash",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(agent_tools.router, prefix=settings.API_V1_STR)
app.include_router(educator.router, prefix=settings.API_V1_STR)
app.include_router(learner.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Agnes 3.0 Flash Adaptive Learning Platform",
        "model": settings.AGNES_MODEL,
        "database": str(engine.url).split("@")[-1] if "@" in str(engine.url) else str(engine.url),
        "docs_url": "/docs"
    }

# Mount React frontend static files
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Don't intercept API routes or docs
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
