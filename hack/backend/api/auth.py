"""
Smart Bharat – Auth API (JWT + Firebase stub)
"""
import logging
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.config import settings
from backend.database.connection import get_db
from backend.database.models import User, UserRole

logger = logging.getLogger(__name__)
router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)


# ─────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str


# ─────────────────────────────────────────
# JWT helpers
# ─────────────────────────────────────────
def create_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {**data, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def verify_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None


# ─────────────────────────────────────────
# Auth dependencies
# ─────────────────────────────────────────
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    result = await db.execute(select(User).where(User.id == payload.get("sub")))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    if not credentials:
        return None
    try:
        return await get_current_user(credentials, db)
    except Exception:
        return None


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin access required")
    return current_user


# ─────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────
@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    if result.scalar_one_or_none():
        raise HTTPException(400, "Email already registered")
    user = User(
        name=req.name,
        email=req.email,
        hashed_password=pwd_context.hash(req.password),
        role=UserRole.admin if req.email == "admin@smartbharat.in" else UserRole.user,
    )
    db.add(user)
    await db.flush()
    token = create_token({"sub": user.id, "email": user.email, "role": user.role.value})
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "name": user.name, "email": user.email, "role": user.role.value}
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user or not pwd_context.verify(req.password, user.hashed_password or ""):
        raise HTTPException(401, "Invalid email or password")
    token = create_token({"sub": user.id, "email": user.email, "role": user.role.value})
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "name": user.name, "email": user.email, "role": user.role.value}
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut(id=current_user.id, name=current_user.name, email=current_user.email, role=current_user.role.value)


@router.post("/firebase")
async def firebase_login(body: dict, db: AsyncSession = Depends(get_db)):
    """Exchange a Firebase ID token for a Smart Bharat JWT."""
    firebase_uid = body.get("uid")
    email = body.get("email")
    name = body.get("name", "User")
    if not firebase_uid or not email:
        raise HTTPException(400, "uid and email required")
    result = await db.execute(select(User).where(User.firebase_uid == firebase_uid))
    user = result.scalar_one_or_none()
    if not user:
        user = User(name=name, email=email, firebase_uid=firebase_uid)
        db.add(user)
        await db.flush()
    token = create_token({"sub": user.id, "email": user.email, "role": user.role.value})
    return TokenResponse(
        access_token=token,
        user={"id": user.id, "name": user.name, "email": user.email, "role": user.role.value}
    )
