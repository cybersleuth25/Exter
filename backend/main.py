"""
ProjectDefense AI — FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.mongodb import connect_to_mongo, close_mongo_connection
from routes.auth_routes import router as auth_router
from routes.project_routes import router as project_router
from routes.analysis_routes import router as analysis_router
from routes.viva_routes import router as viva_router
from routes.report_routes import router as report_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title="ProjectDefense AI",
    description=(
        "AI-powered platform to prepare for hackathons, project defenses, "
        "viva exams, and startup pitch evaluations."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(project_router)
app.include_router(analysis_router)
app.include_router(viva_router)
app.include_router(report_router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "ProjectDefense AI API is running",
        "docs": "/docs",
        "version": "1.0.0",
    }
