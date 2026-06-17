from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ReportCreate(BaseModel):
    incident_type: str
    description: str
    location: str
    incident_date: Optional[str] = None
    incident_time: Optional[str] = None

class ReportNoteResponse(BaseModel):
    id: str
    report_id: str
    admin_id: str
    admin_email: Optional[str] = None
    note_text: str
    created_at: datetime
    
    class Config:
        from_attributes = True

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
    status: Optional[str] = "New"
    created_at: datetime
    updated_at: Optional[datetime] = None
    notes: Optional[List[ReportNoteResponse]] = None

    class Config:
        from_attributes = True

class ReportStatusUpdate(BaseModel):
    status: str

class ReportNoteCreate(BaseModel):
    note_text: str
