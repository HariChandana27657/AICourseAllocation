"""
Admin router
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter()

@router.get("/dashboard")
async def admin_dashboard(db: Session = Depends(get_db)):
    return {"message": "Admin dashboard"}
