"""
Smart Bharat – FastAPI Application Entry Point
"""
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from backend.config import settings
from backend.database.connection import create_tables
from backend.rag.knowledge_base import knowledge_base
from backend.api.chat import router as chat_router
from backend.api.complaints import router as complaints_router
from backend.api.schemes import router as schemes_router
from backend.api.auth import router as auth_router
from backend.api.documents import router as documents_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("🚀 Smart Bharat API starting up...")

    # Create database tables
    try:
        await create_tables()
        logger.info("✅ Database tables ready.")
    except Exception as e:
        logger.warning(f"⚠️ Database connection failed (running without DB): {e}")

    # Initialize RAG knowledge base
    try:
        knowledge_base.initialize()
        logger.info("✅ RAG knowledge base initialized.")
    except Exception as e:
        logger.warning(f"⚠️ RAG initialization failed (running without RAG): {e}")

    # Create upload directory
    os.makedirs(settings.upload_dir, exist_ok=True)

    yield

    logger.info("👋 Smart Bharat API shutting down.")


# ─────────────────────────────────────────
# FastAPI App
# ─────────────────────────────────────────
app = FastAPI(
    title="Smart Bharat API",
    description="AI-powered Indian Civic Companion – Backend API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# API Routers
# ─────────────────────────────────────────
app.include_router(auth_router,       prefix="/api/auth",       tags=["Authentication"])
app.include_router(chat_router,       prefix="/api/chat",       tags=["AI Chat"])
app.include_router(complaints_router, prefix="/api/complaints", tags=["Complaints"])
app.include_router(schemes_router,    prefix="/api/schemes",    tags=["Schemes"])
app.include_router(documents_router,  prefix="/api/documents",  tags=["Documents"])

# Serve uploaded files
if os.path.exists(settings.upload_dir):
    app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

# Serve frontend (production)
if os.path.exists("./index.html"):
    app.mount("/", StaticFiles(directory=".", html=True), name="frontend")


@app.get("/api/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Smart Bharat API",
        "version": "1.0.0",
        "rag_enabled": knowledge_base._initialized,
        "gemini_configured": bool(settings.gemini_api_key),
    }


@app.exception_handler(404)
async def not_found(request, exc):
    return JSONResponse({"error": "Endpoint not found"}, status_code=404)


@app.exception_handler(500)
async def server_error(request, exc):
    logger.error(f"Internal error: {exc}")
    return JSONResponse({"error": "Internal server error"}, status_code=500)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.host if hasattr(settings,'host') else "0.0.0.0", port=8000, reload=True)
