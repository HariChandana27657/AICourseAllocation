from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from config import settings

engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    department = Column(String, nullable=False)
    gpa = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    preferences = relationship("Preference", back_populates="student", cascade="all, delete")
    enrollments = relationship("Enrollment", back_populates="student", cascade="all, delete")
    notifications = relationship("Notification", back_populates="user_student", cascade="all, delete")


class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    notifications = relationship("Notification", back_populates="user_admin", cascade="all, delete")


class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    course_code = Column(String, unique=True, nullable=False, index=True)
    course_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    instructor = Column(String)
    seat_capacity = Column(Integer, nullable=False)
    enrolled_count = Column(Integer, default=0)
    time_slot = Column(String, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    preferences = relationship("Preference", back_populates="course", cascade="all, delete")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete")


class Preference(Base):
    __tablename__ = "preferences"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    preference_rank = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    student = relationship("Student", back_populates="preferences")
    course = relationship("Course", back_populates="preferences")


class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    allocation_status = Column(String, default="allocated")
    allocated_at = Column(DateTime, default=datetime.utcnow)
    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    user_role = Column(String, nullable=False)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    # Relationships (optional FK for convenience)
    student_fk = Column(Integer, ForeignKey("students.id"), nullable=True)
    admin_fk = Column(Integer, ForeignKey("admins.id"), nullable=True)
    user_student = relationship("Student", back_populates="notifications", foreign_keys=[student_fk])
    user_admin = relationship("Admin", back_populates="notifications", foreign_keys=[admin_fk])


class SystemSettings(Base):
    __tablename__ = "system_settings"
    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String, unique=True, nullable=False)
    setting_value = Column(String, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
