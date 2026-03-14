"""
Preferences router
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, Preference

router = APIRouter()

@router.get("/")
async def get_preferences(db: Session = Depends(get_db)):
    return {"message": "Preferences endpoint"}
