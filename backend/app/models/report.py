import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime
from app.database.db import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reference_id = Column(String(50), unique=True, index=True, nullable=False)
    incident_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(255), nullable=False)
    evidence_url = Column(String(255), nullable=True)
    evidence_hash = Column(String(64), nullable=True)  # SHA-256 hash length is 64 hex characters
    previous_hash = Column(String(64), nullable=True)  # Hash of the previous report in the chain
    block_hash = Column(String(64), nullable=True)     # Combined hash of current report and previous_hash
    risk_level = Column(String(50), nullable=True, default="Pending")
    risk_score = Column(String(10), nullable=True)     # Numeric risk score 1-10 as string
    sentiment = Column(String(50), nullable=True)      # Positive, Neutral, Negative
    summary = Column(Text, nullable=True)              # AI-generated summary
    priority = Column(String(50), nullable=True, default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)
