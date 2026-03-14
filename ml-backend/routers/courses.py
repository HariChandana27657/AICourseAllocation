"""
Courses router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from database import get_db, Course

router = APIRouter()

class CourseCreate(BaseModel):
    course_code: str
    course_name: str
    department: str
    instructor: str
    seat_capacity: int
    time_slot: str
    description: str = ""
    prerequisites: List[int] = []

@router.get("/")
async def get_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    return courses

@router.post("/")
async def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    new_course = Course(**course.dict())
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course
