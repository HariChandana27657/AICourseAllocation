"""
AI-Powered Course Allocation System - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import uvicorn

from database import engine, Base, get_db
from routers import auth, courses, preferences, allocation, ml, reports, admin
from config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="AI Course Allocation System",
    description="Machine Learning powered course allocation platform",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(courses.router, prefix="/api/courses", tags=["Courses"])
app.include_router(preferences.router, prefix="/api/preferences", tags=["Preferences"])
app.include_router(allocation.router, prefix="/api/allocation", tags=["Allocation"])
app.include_router(ml.router, prefix="/api/ml", tags=["Machine Learning"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {
        "message": "AI-Powered Course Allocation System",
        "version": "2.0.0",
        "status": "operational",
        "ml_enabled": True
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ml_models": "loaded"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
