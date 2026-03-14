"""
Reports router
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter()

@router.get("/analytics")
async def get_analytics(db: Session = Depends(get_db)):
    return {"message": "Analytics endpoint"}
