from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReportCreate(BaseModel):
    incident_type: str
    description: str
    location: str
    incident_date: Optional[str] = None
    incident_time: Optional[str] = None

class ReportResponse(BaseModel):
    id: str
    reference_id: str
    incident_type: str
    description: str
    location: str
    evidence_url: Optional[str] = None
    evidence_hash: Optional[str] = None
    previous_hash: Optional[str] = None
    block_hash: Optional[str] = None
    risk_level: Optional[str] = None
    risk_score: Optional[str] = None
    sentiment: Optional[str] = None
    summary: Optional[str] = None
    priority: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
