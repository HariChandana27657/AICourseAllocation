from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from database import get_db, Preference, Course, Student, Admin, Notification
from auth_utils import require_student

router = APIRouter()


class PrefItem(BaseModel):
    course_id: int
    preference_rank: int


class PrefsSubmit(BaseModel):
    preferences: List[PrefItem]


def _create_notification(db, user_id, user_role, ntype, title, message, student_fk=None, admin_fk=None):
    n = Notification(user_id=user_id, user_role=user_role, type=ntype,
                     title=title, message=message, student_fk=student_fk, admin_fk=admin_fk)
    db.add(n)


@router.get("/")
def get_preferences(db: Session = Depends(get_db), user=Depends(require_student)):
    prefs = (db.query(Preference, Course)
             .join(Course, Preference.course_id == Course.id)
             .filter(Preference.student_id == user["id"])
             .order_by(Preference.preference_rank)
             .all())
    return [
        {
            "id": p.id, "course_id": p.course_id, "preference_rank": p.preference_rank,
            "course_code": c.course_code, "course_name": c.course_name,
            "department": c.department, "instructor": c.instructor,
            "time_slot": c.time_slot,
            "available_seats": c.seat_capacity - c.enrolled_count
        }
        for p, c in prefs
    ]


@router.post("/")
def submit_preferences(body: PrefsSubmit, db: Session = Depends(get_db), user=Depends(require_student)):
    if not body.preferences:
        raise HTTPException(status_code=400, detail="Preferences array required")

    course_ids = [p.course_id for p in body.preferences]
    if len(set(course_ids)) != len(course_ids):
        raise HTTPException(status_code=400, detail="Duplicate courses in preferences")

    existing = db.query(Course).filter(Course.id.in_(course_ids)).count()
    if existing != len(course_ids):
        raise HTTPException(status_code=400, detail="One or more invalid course IDs")

    # Delete old preferences
    db.query(Preference).filter(Preference.student_id == user["id"]).delete()

    # Insert new
    for pref in body.preferences:
        db.add(Preference(student_id=user["id"], course_id=pref.course_id,
                          preference_rank=pref.preference_rank))

    # Notify student
    student = db.query(Student).filter(Student.id == user["id"]).first()
    _create_notification(db, user["id"], "student", "preference_submitted",
                         "✅ Preferences Submitted",
                         f"Your {len(body.preferences)} course preference(s) submitted successfully.",
                         student_fk=user["id"])

    # Notify all admins
    admins = db.query(Admin).all()
    for admin in admins:
        _create_notification(db, admin.id, "admin", "new_preference",
                             "📝 New Preference Submission",
                             f"{student.name} submitted {len(body.preferences)} preference(s).",
                             admin_fk=admin.id)

    db.commit()

    return {"message": "Preferences submitted successfully",
            "preferences": [{"course_id": p.course_id, "preference_rank": p.preference_rank}
                             for p in body.preferences]}


@router.delete("/")
def delete_preferences(db: Session = Depends(get_db), user=Depends(require_student)):
    db.query(Preference).filter(Preference.student_id == user["id"]).delete()
    db.commit()
    return {"message": "Preferences deleted"}
