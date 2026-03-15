from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import Optional
from database import get_db, Student, Admin
from config import settings

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_token(data: dict):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    department: str
    gpa: Optional[float] = 0.0


@router.post("/student/login")
def student_login(body: LoginRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.email == body.email).first()
    if not student or not pwd_context.verify(body.password, student.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": str(student.id), "role": "student"})
    return {
        "token": token,
        "user": {"id": student.id, "name": student.name, "email": student.email,
                 "role": "student", "department": student.department, "gpa": student.gpa}
    }


@router.post("/admin/login")
def admin_login(body: LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == body.email).first()
    if not admin or not pwd_context.verify(body.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": str(admin.id), "role": "admin"})
    return {
        "token": token,
        "user": {"id": admin.id, "name": admin.name, "email": admin.email, "role": "admin"}
    }


@router.post("/student/register")
def register_student(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(Student).filter(Student.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    student = Student(
        name=body.name, email=body.email,
        password_hash=pwd_context.hash(body.password),
        department=body.department, gpa=body.gpa
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    token = create_token({"sub": str(student.id), "role": "student"})
    return {
        "token": token,
        "user": {"id": student.id, "name": student.name, "email": student.email,
                 "role": "student", "department": student.department, "gpa": student.gpa}
    }
