"""
Authentication router
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
from typing import Optional

from database import get_db, Student, Admin
from config import settings

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class StudentRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: str
    gpa: Optional[float] = 0.0

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

@router.post("/student/login", response_model=Token)
async def student_login(user: UserLogin, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.email == user.email).first()
    if not student or not pwd_context.verify(user.password, student.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": str(student.id), "role": "student"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": student.id,
            "name": student.name,
            "email": student.email,
            "role": "student",
            "department": student.department,
            "gpa": student.gpa
        }
    }

@router.post("/admin/login", response_model=Token)
async def admin_login(user: UserLogin, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == user.email).first()
    if not admin or not pwd_context.verify(user.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": str(admin.id), "role": "admin"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": admin.id,
            "name": admin.name,
            "email": admin.email,
            "role": "admin"
        }
    }

@router.post("/student/register")
async def register_student(user: StudentRegister, db: Session = Depends(get_db)):
    if db.query(Student).filter(Student.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user.password)
    student = Student(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        department=user.department,
        gpa=user.gpa
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    
    return {"message": "Student registered successfully", "id": student.id}
