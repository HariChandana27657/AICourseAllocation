from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db, Course
from auth_utils import require_auth, require_admin

router = APIRouter()


class CourseCreate(BaseModel):
    course_code: str
    course_name: str
    department: str
    instructor: str
    seat_capacity: int
    time_slot: str
    description: Optional[str] = ""


@router.get("/")
def get_courses(db: Session = Depends(get_db), _=Depends(require_auth)):
    courses = db.query(Course).all()
    return [
        {
            "id": c.id, "course_code": c.course_code, "course_name": c.course_name,
            "department": c.department, "instructor": c.instructor,
            "seat_capacity": c.seat_capacity, "enrolled_count": c.enrolled_count,
            "time_slot": c.time_slot, "description": c.description,
            "available_seats": c.seat_capacity - c.enrolled_count
        }
        for c in courses
    ]


@router.get("/{course_id}")
def get_course(course_id: int, db: Session = Depends(get_db), _=Depends(require_auth)):
    c = db.query(Course).filter(Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"id": c.id, "course_code": c.course_code, "course_name": c.course_name,
            "department": c.department, "instructor": c.instructor,
            "seat_capacity": c.seat_capacity, "enrolled_count": c.enrolled_count,
            "time_slot": c.time_slot, "description": c.description,
            "available_seats": c.seat_capacity - c.enrolled_count}


@router.post("/")
def create_course(body: CourseCreate, db: Session = Depends(get_db), user=Depends(require_admin)):
    if db.query(Course).filter(Course.course_code == body.course_code).first():
        raise HTTPException(status_code=400, detail="Course code already exists")
    course = Course(**body.dict())
    db.add(course)
    db.commit()
    db.refresh(course)
    return {"id": course.id, **body.dict(), "enrolled_count": 0,
            "available_seats": course.seat_capacity}


@router.put("/{course_id}")
def update_course(course_id: int, body: CourseCreate, db: Session = Depends(get_db), user=Depends(require_admin)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    for k, v in body.dict().items():
        setattr(course, k, v)
    db.commit()
    db.refresh(course)
    return {"id": course.id, "course_code": course.course_code, "course_name": course.course_name,
            "department": course.department, "instructor": course.instructor,
            "seat_capacity": course.seat_capacity, "enrolled_count": course.enrolled_count,
            "time_slot": course.time_slot, "description": course.description}


@router.delete("/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db), user=Depends(require_admin)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
    return {"message": "Course deleted"}
