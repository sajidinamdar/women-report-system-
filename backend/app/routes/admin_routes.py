from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.db import get_db
from app.models.admin import Admin
from app.models.report import Report
from app.schemas.admin_schema import Token, AdminLogin, AdminResponse
from app.schemas.report_schema import ReportResponse
from app.services.auth_service import (
    create_access_token,
    get_current_admin,
    verify_password
)
from app.services.hash_service import verify_hash, calculate_block_hash

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/login", response_model=Token)
def login(admin_credentials: AdminLogin, db: Session = Depends(get_db)):
    """
    Authenticate admin credentials and return a JWT access token.
    """
    admin = db.query(Admin).filter(Admin.email == admin_credentials.email).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(admin_credentials.password, admin.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": admin.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=AdminResponse)
def get_me(current_admin: Admin = Depends(get_current_admin)):
    """
    Get current logged in admin details.
    """
    return current_admin

@router.get("/reports", response_model=List[ReportResponse])
def get_all_reports(
    incident_type: Optional[str] = None,
    risk_level: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Retrieve all reports, filtered by incident type, risk level, and location (case-insensitive partial match).
    Sorted by created_at in descending order.
    """
    query = db.query(Report)
    
    if incident_type:
        query = query.filter(Report.incident_type == incident_type)
    if risk_level:
        query = query.filter(Report.risk_level == risk_level)
    if location:
        query = query.filter(Report.location.ilike(f"%{location}%"))
        
    return query.order_by(Report.created_at.desc()).all()

@router.get("/reports/{report_id}", response_model=ReportResponse)
def get_report_by_id(
    report_id: str,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Retrieve details for a specific report.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    return report

@router.post("/verify-evidence")
async def verify_evidence(
    report_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Recompute hash of the uploaded file and verify it against the stored evidence hash.
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    if not report.evidence_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This report does not contain any evidence file to verify"
        )

    file_bytes = await file.read()
    is_valid = verify_hash(file_bytes, report.evidence_hash)
    
    if is_valid:
        return {
            "status": "valid",
            "message": "Evidence Valid",
            "stored_hash": report.evidence_hash,
            "calculated_hash": report.evidence_hash
        }
    else:
        from app.services.hash_service import calculate_hash
        recalculated = calculate_hash(file_bytes)
        return {
            "status": "modified",
            "message": "Evidence Modified",
            "stored_hash": report.evidence_hash,
            "calculated_hash": recalculated
        }

@router.get("/verify-ledger")
def verify_ledger_integrity(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Verify the integrity of the entire blockchain-inspired report ledger.
    It iterates through all reports and validates that each block_hash matches 
    the recalculated value based on the previous_hash and current data.
    """
    reports = db.query(Report).order_by(Report.created_at.asc()).all()
    
    if not reports:
        return {"status": "empty", "message": "No reports to verify"}

    verification_results = []
    is_entire_chain_valid = True
    
    expected_prev_hash = "0" * 64
    
    for report in reports:
        # Recalculate block hash
        current_data = f"{report.reference_id}|{report.incident_type}|{report.evidence_hash or 'no_evidence'}"
        recalculated_hash = calculate_block_hash(current_data, report.previous_hash)
        
        # Check if stored previous_hash matches our expected one
        prev_hash_match = report.previous_hash == expected_prev_hash
        block_hash_match = report.block_hash == recalculated_hash
        
        is_valid = prev_hash_match and block_hash_match
        
        if not is_valid:
            is_entire_chain_valid = False
            
        verification_results.append({
            "reference_id": report.reference_id,
            "is_valid": is_valid,
            "stored_block_hash": report.block_hash,
            "recalculated_block_hash": recalculated_hash,
            "prev_hash_match": prev_hash_match
        })
        
        # Next block's previous hash should be current block's stored block_hash
        expected_prev_hash = report.block_hash

    return {
        "status": "success" if is_entire_chain_valid else "failure",
        "is_chain_valid": is_entire_chain_valid,
        "results": verification_results
    }
