from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db, Student, Course, Preference, Enrollment
from auth_utils import require_admin

router = APIRouter()


@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db), user=Depends(require_admin)):
    total_students = db.query(Student).count()
    total_courses = db.query(Course).count()
    students_with_prefs = db.query(Preference.student_id).distinct().count()
    students_allocated = db.query(Enrollment.student_id).filter(
        Enrollment.allocation_status == "allocated").distinct().count()
    total_enrollments = db.query(func.sum(Course.enrolled_count)).scalar() or 0
    total_capacity = db.query(func.sum(Course.seat_capacity)).scalar() or 1
    avg_util = round((total_enrollments / total_capacity) * 100, 2)

    popular = (db.query(Course.course_code, Course.course_name,
                        func.count(Preference.id).label("preference_count"))
               .outerjoin(Preference, Preference.course_id == Course.id)
               .group_by(Course.id)
               .order_by(func.count(Preference.id).desc())
               .limit(5).all())

    dept_stats = (db.query(Course.department,
                           func.count(Course.id).label("course_count"),
                           func.sum(Course.enrolled_count).label("total_enrolled"))
                  .group_by(Course.department)
                  .order_by(func.sum(Course.enrolled_count).desc())
                  .all())

    return {
        "overview": {
            "total_students": total_students,
            "total_courses": total_courses,
            "students_with_preferences": students_with_prefs,
            "students_allocated": students_allocated,
            "total_enrollments": total_enrollments,
            "total_capacity": total_capacity,
            "avg_utilization": avg_util
        },
        "popularCourses": [{"course_code": p.course_code, "course_name": p.course_name,
                            "preference_count": p.preference_count} for p in popular],
        "departmentStats": [{"department": d.department, "course_count": d.course_count,
                             "total_enrolled": d.total_enrolled or 0} for d in dept_stats]
    }


@router.get("/enrollment")
def enrollment_report(db: Session = Depends(get_db), user=Depends(require_admin)):
    courses = db.query(Course).order_by(Course.enrolled_count.desc()).all()
    return [{"id": c.id, "course_code": c.course_code, "course_name": c.course_name,
             "department": c.department, "instructor": c.instructor,
             "seat_capacity": c.seat_capacity, "enrolled_count": c.enrolled_count,
             "available_seats": c.seat_capacity - c.enrolled_count,
             "utilization_percentage": round(c.enrolled_count / c.seat_capacity * 100, 2)
             if c.seat_capacity > 0 else 0} for c in courses]


@router.get("/demand")
def demand_report(db: Session = Depends(get_db), user=Depends(require_admin)):
    courses = db.query(Course).all()
    result = []
    for c in courses:
        total_prefs = db.query(Preference).filter(Preference.course_id == c.id).count()
        first_choice = db.query(Preference).filter(
            Preference.course_id == c.id, Preference.preference_rank == 1).count()
        demand_ratio = round(total_prefs / c.seat_capacity, 2) if c.seat_capacity > 0 else 0
        result.append({"id": c.id, "course_code": c.course_code, "course_name": c.course_name,
                       "department": c.department, "seat_capacity": c.seat_capacity,
                       "enrolled_count": c.enrolled_count, "total_preferences": total_prefs,
                       "first_choice_count": first_choice, "demand_ratio": demand_ratio})
    return sorted(result, key=lambda x: x["demand_ratio"], reverse=True)


@router.get("/unallocated")
def unallocated_students(db: Session = Depends(get_db), user=Depends(require_admin)):
    students = db.query(Student).all()
    result = []
    for s in students:
        pref_count = db.query(Preference).filter(Preference.student_id == s.id).count()
        alloc_count = db.query(Enrollment).filter(
            Enrollment.student_id == s.id, Enrollment.allocation_status == "allocated").count()
        if pref_count > 0 and alloc_count == 0:
            result.append({"id": s.id, "name": s.name, "email": s.email,
                           "department": s.department, "gpa": s.gpa,
                           "preferences_submitted": pref_count, "courses_allocated": 0})
    return result


@router.get("/preferences")
def all_preferences(db: Session = Depends(get_db), user=Depends(require_admin)):
    students = db.query(Student).all()
    result = []
    for s in students:
        prefs = (db.query(Preference, Course)
                 .join(Course, Preference.course_id == Course.id)
                 .filter(Preference.student_id == s.id)
                 .order_by(Preference.preference_rank).all())
        if prefs:
            result.append({
                "student_id": s.id, "student_name": s.name, "email": s.email,
                "department": s.department, "gpa": s.gpa,
                "preferences": [{"rank": p.preference_rank, "course_code": c.course_code,
                                  "course_name": c.course_name, "course_department": c.department,
                                  "time_slot": c.time_slot, "seat_capacity": c.seat_capacity,
                                  "enrolled_count": c.enrolled_count} for p, c in prefs]
            })
    return result
