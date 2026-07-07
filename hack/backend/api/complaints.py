"""
Smart Bharat – Complaints API Routes
"""
import os, uuid, logging
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from backend.config import settings
from backend.database.connection import get_db
from backend.database.models import Complaint, ComplaintStatus, User
from backend.api.auth import get_current_user_optional, require_admin
from backend.chatbot.gemini_chat import chatbot

logger = logging.getLogger(__name__)
router = APIRouter()


class ComplaintCreate(BaseModel):
    description: str
    state: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    category: Optional[str] = None
    contact_name: Optional[str] = None
    contact_info: Optional[str] = None

class ComplaintStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None


def gen_complaint_id() -> str:
    import random, string
    chars = string.ascii_uppercase + string.digits
    rand = ''.join(random.choices(chars, k=6))
    return f"SB{datetime.now().year}{rand}"


@router.post("/submit")
async def submit_complaint(
    description: str = Form(...),
    state: str = Form(None),
    city: str = Form(None),
    address: str = Form(None),
    category: str = Form(None),
    contact_name: str = Form(None),
    contact_info: str = Form(None),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Submit a civic complaint with optional image upload."""
    # AI categorization
    ai_result = await chatbot.categorize_complaint(description)

    # Handle image upload
    image_url = None
    if image and image.filename:
        ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(settings.upload_dir, filename)
        os.makedirs(settings.upload_dir, exist_ok=True)
        content = await image.read()
        with open(filepath, "wb") as f:
            f.write(content)
        image_url = f"/uploads/{filename}"

    complaint = Complaint(
        id=gen_complaint_id(),
        user_id=current_user.id if current_user else None,
        category=category or ai_result.get("category", "Other"),
        description=description,
        formal_complaint=ai_result.get("formal_complaint"),
        state=state,
        city=city,
        address=address,
        image_url=image_url,
        department=ai_result.get("department", "Municipal Corporation"),
        contact_name=contact_name,
        contact_info=contact_info,
        timeline=[{"status": "Submitted", "time": datetime.now().isoformat(), "note": "Complaint registered successfully"}],
    )
    db.add(complaint)
    await db.flush()

    return {
        "complaint_id": complaint.id,
        "category": complaint.category,
        "department": complaint.department,
        "formal_complaint": complaint.formal_complaint,
        "priority": ai_result.get("priority", "Medium"),
        "suggested_portals": ai_result.get("suggested_portals", []),
        "status": "pending",
        "message": "Complaint submitted successfully",
    }


@router.get("/my")
async def get_my_complaints(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    if not current_user:
        return []
    result = await db.execute(
        select(Complaint)
        .where(Complaint.user_id == current_user.id)
        .order_by(Complaint.created_at.desc())
    )
    complaints = result.scalars().all()
    return [_serialize(c) for c in complaints]


@router.get("/{complaint_id}")
async def get_complaint(complaint_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(404, "Complaint not found")
    return _serialize(c)


@router.patch("/{complaint_id}/status")
async def update_status(
    complaint_id: str,
    body: ComplaintStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(404, "Complaint not found")
    valid = [s.value for s in ComplaintStatus]
    if body.status not in valid:
        raise HTTPException(400, f"Invalid status. Must be one of: {valid}")
    c.status = body.status
    timeline = list(c.timeline or [])
    timeline.append({"status": body.status.capitalize(), "time": datetime.now().isoformat(), "note": body.note or f"Status updated to {body.status}"})
    c.timeline = timeline
    return {"message": "Status updated", "complaint_id": complaint_id, "status": body.status}


@router.get("/admin/all")
async def get_all_complaints(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
):
    q = select(Complaint).order_by(Complaint.created_at.desc()).limit(limit).offset(offset)
    if status:
        q = q.where(Complaint.status == status)
    result = await db.execute(q)
    complaints = result.scalars().all()
    count_result = await db.execute(select(func.count(Complaint.id)))
    total = count_result.scalar()
    return {"total": total, "complaints": [_serialize(c) for c in complaints]}


def _serialize(c: Complaint) -> dict:
    return {
        "id": c.id, "category": c.category, "description": c.description,
        "formal_complaint": c.formal_complaint, "state": c.state, "city": c.city,
        "department": c.department, "status": c.status, "timeline": c.timeline,
        "image_url": c.image_url, "created_at": str(c.created_at),
    }
