import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.database.db import Base

class Admin(Base):
    __tablename__ = "admins"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)  # Stored as bcrypt hashed password
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to notes
    notes = relationship("ReportNote", back_populates="admin", cascade="all, delete-orphan")
