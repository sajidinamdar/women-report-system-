import os
import sys

# Add the project root to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Database imports
from backend.app.database.db import engine, Base, SessionLocal
from backend.app.models.admin import Admin
from backend.app.models.report import Report
from backend.app.services.auth_service import get_password_hash

# Routes imports
from backend.app.routes import report_routes, admin_routes, analytics_routes

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
