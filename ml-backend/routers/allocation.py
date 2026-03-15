from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, Student, Course, Preference, Enrollment, Notification
from auth_utils import require_admin, require_student

router = APIRouter()


def _time_conflict(slot1: str, slot2: str) -> bool:
    days1 = slot1.split(" ")[0].split("/")
    days2 = slot2.split(" ")[0].split("/")
    return any(d in days2 for d in days1)


def _create_notification(db, user_id, user_role, ntype, title, message, student_fk=None, admin_fk=None):
    n = Notification(user_id=user_id, user_role=user_role, type=ntype,
                     title=title, message=message, student_fk=student_fk, admin_fk=admin_fk)
    db.add(n)


@router.post("/run")
def run_allocation(db: Session = Depends(get_db), user=Depends(require_admin)):
    # Clear existing allocations
    db.query(Enrollment).delete()
    db.query(Course).update({"enrolled_count": 0})
    db.commit()

    # Sort students by GPA descending
    students = db.query(Student).order_by(Student.gpa.desc(), Student.id.asc()).all()
    results = []

    for student in students:
        prefs = (db.query(Preference, Course)
                 .join(Course, Preference.course_id == Course.id)
                 .filter(Preference.student_id == student.id)
                 .order_by(Preference.preference_rank)
                 .all())

        allocated = []
        failed = []

        for pref, course in prefs:
            available = course.seat_capacity - course.enrolled_count
            if available <= 0:
                failed.append({"course_code": course.course_code, "reason": "No seats"})
                continue

            # Check time conflict with already allocated courses
            conflict = False
            enrolled_courses = (db.query(Course)
                                .join(Enrollment, Enrollment.course_id == Course.id)
                                .filter(Enrollment.student_id == student.id)
                                .all())
            for ec in enrolled_courses:
                if _time_conflict(ec.time_slot, course.time_slot):
                    failed.append({"course_code": course.course_code, "reason": "Time conflict"})
                    conflict = True
                    break
            if conflict:
                continue

            # Allocate
            db.add(Enrollment(student_id=student.id, course_id=course.id))
            course.enrolled_count += 1
            db.flush()
            allocated.append({"course_code": course.course_code, "course_name": course.course_name})

        # Notify student
        if allocated:
            course_list = ", ".join(c["course_code"] for c in allocated)
            _create_notification(db, student.id, "student", "allocation_result",
                                 "🎯 Course Allocation Complete!",
                                 f"You have been allocated {len(allocated)} course(s): {course_list}.",
                                 student_fk=student.id)
        else:
            _create_notification(db, student.id, "student", "allocation_result",
                                 "⚠️ No Courses Allocated",
                                 "No courses were assigned. Please contact your admin.",
                                 student_fk=student.id)

        results.append({"studentId": student.id, "studentName": student.name,
                        "gpa": student.gpa, "allocatedCourses": allocated, "failedAllocations": failed})

    db.commit()
    return {"success": True, "message": "Allocation completed successfully",
            "totalStudents": len(students), "results": results}


@router.get("/results")
def get_results(db: Session = Depends(get_db), user=Depends(require_student)):
    enrollments = (db.query(Enrollment, Course)
                   .join(Course, Enrollment.course_id == Course.id)
                   .filter(Enrollment.student_id == user["id"],
                           Enrollment.allocation_status == "allocated")
                   .all())
    return {
        "studentId": user["id"],
        "allocatedCourses": [
            {"id": e.id, "course_id": c.id, "course_code": c.course_code,
             "course_name": c.course_name, "department": c.department,
             "instructor": c.instructor, "time_slot": c.time_slot,
             "seat_capacity": c.seat_capacity, "allocation_status": e.allocation_status}
            for e, c in enrollments
        ]
    }
