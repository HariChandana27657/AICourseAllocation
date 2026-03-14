"""
Database configuration and models
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from config import settings

# Database engine
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    department = Column(String, nullable=False)
    gpa = Column(Float, default=0.0)
    semester = Column(Integer, default=1)
    completed_courses = Column(JSON, default=[])  # List of completed course IDs
    created_at = Column(DateTime, default=datetime.utcnow)
    
    preferences = relationship("Preference", back_populates="student")
    allocations = relationship("Allocation", back_populates="student")

class Admin(Base):
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    course_code = Column(String, unique=True, nullable=False, index=True)
    course_name = Column(String, nullable=False)
    department = Column(String, nullable=False, index=True)
    instructor = Column(String)
    seat_capacity = Column(Integer, nullable=False)
    enrolled_count = Column(Integer, default=0)
    credits = Column(Integer, default=3)
    time_slot = Column(String, nullable=False)
    description = Column(Text)
    prerequisites = Column(JSON, default=[])  # List of prerequisite course IDs
    difficulty_level = Column(Integer, default=1)  # 1-5 scale
    popularity_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    preferences = relationship("Preference", back_populates="course")
    allocations = relationship("Allocation", back_populates="course")

class Preference(Base):
    __tablename__ = "preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    preference_rank = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    student = relationship("Student", back_populates="preferences")
    course = relationship("Course", back_populates="preferences")

class Allocation(Base):
    __tablename__ = "allocations"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    allocation_status = Column(String, default="allocated")  # allocated, waitlist, dropped
    ml_confidence = Column(Float, default=0.0)  # ML model confidence score
    allocated_at = Column(DateTime, default=datetime.utcnow)
    
    student = relationship("Student", back_populates="allocations")
    course = relationship("Course", back_populates="allocations")

class MLModel(Base):
    __tablename__ = "ml_models"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, nullable=False)
    model_type = Column(String, nullable=False)  # random_forest, neural_network, etc.
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    training_samples = Column(Integer)
    is_active = Column(Boolean, default=False)
    model_path = Column(String)
    hyperparameters = Column(JSON)
    trained_at = Column(DateTime, default=datetime.utcnow)

class TrainingData(Base):
    __tablename__ = "training_data"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer)
    course_id = Column(Integer)
    gpa = Column(Float)
    semester = Column(Integer)
    department_match = Column(Boolean)
    prerequisites_met = Column(Boolean)
    preference_rank = Column(Integer)
    seat_availability = Column(Float)
    course_popularity = Column(Float)
    allocated = Column(Boolean)  # Target variable
    created_at = Column(DateTime, default=datetime.utcnow)

class SystemSettings(Base):
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String, unique=True, nullable=False)
    setting_value = Column(String, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
