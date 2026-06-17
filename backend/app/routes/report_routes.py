import os
import uuid
import string
import random
from typing import Optional
from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.db import get_db
from backend.app.models.report import Report
from backend.app.schemas.report_schema import ReportResponse
from backend.app.services.groq_service import analyze_incident_description
from backend.app.services.hash_service import calculate_hash, calculate_block_hash

router = APIRouter(prefix="/reports", tags=["Reports"])

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def generate_reference_id() -> str:
    """
    Generate a unique incident reference ID: INC-XXXXXXXX
    """
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(random.choices(chars, k=8))
    return f"INC-{suffix}"

@router.post("/submit", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def submit_report(
    incident_type: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    incident_date: Optional[str] = Form(None),
    incident_time: Optional[str] = Form(None),
    evidence: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    try:
        # 1. Generate unique reference ID
        ref_id = generate_reference_id()
        # Ensure it is unique in the database
        while db.query(Report).filter(Report.reference_id == ref_id).first() is not None:
            ref_id = generate_reference_id()

        evidence_url = None
        evidence_hash = None

        # 2. Handle Evidence File Upload and Hash Generation
        if evidence and evidence.filename:
            file_bytes = await evidence.read()
            if len(file_bytes) > 0:
                # Generate SHA256 hash
                evidence_hash = calculate_hash(file_bytes)

                # Save file to uploads folder with unique name
                file_ext = os.path.splitext(evidence.filename)[1]
                unique_filename = f"{uuid.uuid4()}{file_ext}"
                file_path = os.path.join(UPLOAD_DIR, unique_filename)
                
                with open(file_path, "wb") as buffer:
                    buffer.write(file_bytes)

                # We save the relative URL/path for mounting
                evidence_url = f"uploads/{unique_filename}"

        # 3. AI Risk Analysis
        # Combine date, time and description for AI context
        date_str = f"Date: {incident_date}" if incident_date else "Date: Not specified"
        time_str = f"Time: {incident_time}" if incident_time else "Time: Not specified"
        full_text_for_ai = f"{date_str}\n{time_str}\nDescription: {description}"
        
        ai_analysis = analyze_incident_description(full_text_for_ai)

        # 4. Handle Blockchain Ledger (Hash Chain)
        # Fetch the latest report to get its block_hash
        last_report = db.query(Report).order_by(Report.created_at.desc()).first()
        prev_hash = last_report.block_hash if last_report else "0" * 64
        
        # Current data to hash (Reference ID + Type + Evidence Hash)
        current_data = f"{ref_id}|{incident_type}|{evidence_hash or 'no_evidence'}"
        block_hash = calculate_block_hash(current_data, prev_hash)

        # 5. Create and Save Report
        new_report = Report(
            reference_id=ref_id,
            incident_type=incident_type,
            description=description,
            location=location,
            evidence_url=evidence_url,
            evidence_hash=evidence_hash,
            previous_hash=prev_hash,
            block_hash=block_hash,
            risk_level=ai_analysis.get("risk_level", "Medium"),
            risk_score=ai_analysis.get("risk_score", "5"),
            sentiment=ai_analysis.get("sentiment", "Neutral"),
            summary=ai_analysis.get("summary", "No summary."),
            priority=ai_analysis.get("priority", "Routine")
        )

        db.add(new_report)
        db.commit()
        db.refresh(new_report)

        return new_report

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while submitting the report: {str(e)}"
        )
