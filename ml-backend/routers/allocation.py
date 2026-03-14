"""
Allocation router
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter()

@router.post("/run")
async def run_allocation(db: Session = Depends(get_db)):
    return {"message": "Allocation endpoint"}
