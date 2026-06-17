import os
import sys

# Add the project root and backend directories to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.join(project_root, 'backend'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Database imports
from app.database.db import engine, Base, SessionLocal
from app.models.admin import Admin
from app.models.report import Report
from app.services.auth_service import get_password_hash

# Routes imports
from app.routes import report_routes, admin_routes, analytics_routes

# Initialize FastAPI application
app = FastAPI(
    title="Secure Anonymous Incident Reporting System API",
    description="API backend using AI (Groq) and SHA256 Evidence integrity mechanisms",
    version="1.0.0"
)

# Configure CORS for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure database tables are created
Base.metadata.create_all(bind=engine)

# Seed a default administrator if the database is empty
def seed_default_admin():
    db: Session = SessionLocal()
    try:
        admin_exists = db.query(Admin).first()
        if not admin_exists:
            default_email = "admin@report.com"
            default_password = "admin123"
            hashed_pwd = get_password_hash(default_password)
            
            new_admin = Admin(
                email=default_email,
                password=hashed_pwd
            )
            db.add(new_admin)
            db.commit()
    except Exception as e:
        db.rollback()
    finally:
        db.close()

seed_default_admin()

# Register Routers
app.include_router(report_routes.router, prefix="/api")
app.include_router(admin_routes.router, prefix="/api")
app.include_router(analytics_routes.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "Secure Anonymous Incident Reporting System",
        "docs_url": "/docs"
    }

# Handler for Vercel
from mangum import Mangum
handler = Mangum(app)
