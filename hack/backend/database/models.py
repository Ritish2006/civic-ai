"""
Smart Bharat – Database Models (SQLAlchemy)
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

Base = declarative_base()

def gen_uuid():
    return str(uuid.uuid4())

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"

class ComplaintStatus(str, enum.Enum):
    pending = "pending"
    progress = "progress"
    resolved = "resolved"
    rejected = "rejected"

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String(120), nullable=False)
    email = Column(String(200), unique=True, nullable=False, index=True)
    hashed_password = Column(String(200), nullable=True)
    firebase_uid = Column(String(200), nullable=True, unique=True)
    role = Column(Enum(UserRole), default=UserRole.user)
    avatar_url = Column(String(500), nullable=True)
    language = Column(String(10), default="en")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    complaints = relationship("Complaint", back_populates="user")
    chat_sessions = relationship("ChatSession", back_populates="user")

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(String(20), primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    formal_complaint = Column(Text, nullable=True)
    state = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    department = Column(String(200), nullable=True)
    contact_name = Column(String(120), nullable=True)
    contact_info = Column(String(200), nullable=True)
    status = Column(Enum(ComplaintStatus), default=ComplaintStatus.pending)
    timeline = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    user = relationship("User", back_populates="complaints")

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    title = Column(String(200), nullable=True)
    language = Column(String(10), default="en")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", order_by="ChatMessage.created_at")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(String, primary_key=True, default=gen_uuid)
    session_id = Column(String, ForeignKey("chat_sessions.id"))
    role = Column(String(10), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    sources = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    session = relationship("ChatSession", back_populates="messages")

class GovtScheme(Base):
    __tablename__ = "govt_schemes"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    ministry = Column(String(200), nullable=True)
    category = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    benefits = Column(JSON, default=list)
    eligibility = Column(Text, nullable=True)
    documents = Column(JSON, default=list)
    apply_url = Column(String(500), nullable=True)
    tags = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
