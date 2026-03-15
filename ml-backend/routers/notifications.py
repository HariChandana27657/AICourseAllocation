from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, Notification
from auth_utils import require_auth

router = APIRouter()


@router.get("/")
def get_notifications(db: Session = Depends(get_db), user=Depends(require_auth)):
    notifs = (db.query(Notification)
              .filter(Notification.user_id == user["id"], Notification.user_role == user["role"])
              .order_by(Notification.created_at.desc())
              .limit(50).all())
    unread = sum(1 for n in notifs if not n.is_read)
    return {
        "notifications": [{"id": n.id, "type": n.type, "title": n.title, "message": n.message,
                           "is_read": n.is_read,
                           "created_at": n.created_at.isoformat()} for n in notifs],
        "unread": unread
    }


@router.patch("/{notif_id}/read")
def mark_read(notif_id: int, db: Session = Depends(get_db), user=Depends(require_auth)):
    n = db.query(Notification).filter(
        Notification.id == notif_id, Notification.user_id == user["id"]).first()
    if n:
        n.is_read = True
        db.commit()
    return {"success": True}


@router.patch("/read-all")
def mark_all_read(db: Session = Depends(get_db), user=Depends(require_auth)):
    db.query(Notification).filter(
        Notification.user_id == user["id"], Notification.user_role == user["role"]
    ).update({"is_read": True})
    db.commit()
    return {"success": True}


@router.delete("/{notif_id}")
def delete_notification(notif_id: int, db: Session = Depends(get_db), user=Depends(require_auth)):
    db.query(Notification).filter(
        Notification.id == notif_id, Notification.user_id == user["id"]).delete()
    db.commit()
    return {"success": True}
