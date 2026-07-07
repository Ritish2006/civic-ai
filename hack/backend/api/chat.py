"""
Smart Bharat – AI Chat API Routes
Endpoints for chat, streaming, and scheme recommendations
"""
import json
import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.chatbot.gemini_chat import chatbot
from backend.database.connection import get_db
from backend.database.models import ChatSession, ChatMessage, User
from backend.api.auth import get_current_user_optional

logger = logging.getLogger(__name__)
router = APIRouter()


# ─────────────────────────────────────────
# Pydantic Schemas
# ─────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    language: str = "en"
    use_pro: bool = False

class MessageOut(BaseModel):
    role: str
    content: str
    sources: List[dict] = []

class ChatResponse(BaseModel):
    content: str
    session_id: str
    sources: List[dict] = []
    model: str = ""

class SchemeRecommendRequest(BaseModel):
    age: int
    gender: str
    state: str
    occupation: str
    income: int
    category: str = "General"
    language: str = "en"

class ComplaintCategorizeRequest(BaseModel):
    description: str


# ─────────────────────────────────────────
# Chat Endpoints
# ─────────────────────────────────────────
@router.post("/message", response_model=ChatResponse)
async def send_message(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Send a message and get an AI response with RAG."""
    if not req.message.strip():
        raise HTTPException(400, "Message cannot be empty")

    # Get or create session
    session_id = req.session_id
    history = []

    if session_id:
        result = await db.execute(
            select(ChatMessage)
            .join(ChatSession)
            .where(ChatSession.id == session_id)
            .order_by(ChatMessage.created_at)
        )
        history = [{"role": m.role, "content": m.content} for m in result.scalars().all()]
    else:
        # Create new session
        session = ChatSession(
            user_id=current_user.id if current_user else None,
            title=req.message[:60],
            language=req.language,
        )
        db.add(session)
        await db.flush()
        session_id = session.id

    # Save user message
    user_msg = ChatMessage(session_id=session_id, role="user", content=req.message)
    db.add(user_msg)

    # Get AI response
    result = await chatbot.chat(
        user_message=req.message,
        conversation_history=history,
        language=req.language,
        use_pro=req.use_pro,
    )

    # Save AI response
    ai_msg = ChatMessage(
        session_id=session_id,
        role="assistant",
        content=result["content"],
        sources=result.get("sources", []),
    )
    db.add(ai_msg)

    return ChatResponse(
        content=result["content"],
        session_id=session_id,
        sources=result.get("sources", []),
        model=result.get("model", ""),
    )


@router.post("/stream")
async def stream_message(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Stream AI response token by token (Server-Sent Events)."""
    if not req.message.strip():
        raise HTTPException(400, "Message cannot be empty")

    # Get history
    history = []
    if req.session_id:
        result = await db.execute(
            select(ChatMessage)
            .join(ChatSession)
            .where(ChatSession.id == req.session_id)
            .order_by(ChatMessage.created_at)
        )
        history = [{"role": m.role, "content": m.content} for m in result.scalars().all()]

    async def event_stream():
        full_response = []
        try:
            async for token in chatbot.stream_chat(
                user_message=req.message,
                conversation_history=history,
                language=req.language,
            ):
                full_response.append(token)
                yield f"data: {json.dumps({'token': token})}\n\n"

            yield f"data: {json.dumps({'done': True, 'full': ''.join(full_response)})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/history/{session_id}", response_model=List[MessageOut])
async def get_chat_history(session_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch full chat history for a session."""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    msgs = result.scalars().all()
    return [MessageOut(role=m.role, content=m.content, sources=m.sources or []) for m in msgs]


@router.get("/sessions")
async def get_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Get all chat sessions for the current user."""
    if not current_user:
        return []
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.created_at.desc())
        .limit(20)
    )
    sessions = result.scalars().all()
    return [{"id": s.id, "title": s.title, "created_at": str(s.created_at)} for s in sessions]


@router.post("/recommend-schemes")
async def recommend_schemes(req: SchemeRecommendRequest):
    """AI-powered government scheme recommendations based on user profile."""
    result = await chatbot.recommend_schemes(
        profile=req.model_dump(),
        language=req.language,
    )
    return {"recommendations": result}


@router.post("/categorize-complaint")
async def categorize_complaint(req: ComplaintCategorizeRequest):
    """AI categorizes a complaint and generates formal letter."""
    result = await chatbot.categorize_complaint(req.description)
    return result


@router.post("/rebuild-knowledge-base")
async def rebuild_kb():
    """Admin: Rebuild the RAG knowledge base."""
    from backend.rag.knowledge_base import knowledge_base
    knowledge_base.initialize(force_rebuild=True)
    return {"message": "Knowledge base rebuilt successfully"}
