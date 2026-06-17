import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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

# Configure CORS for local frontend integration (Vite dev server usually runs on port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure database tables are created (SQLite / PostgreSQL auto migration)
Base.metadata.create_all(bind=engine)

# Ensure uploads directory is created and mounted statically
parent_dir = os.path.dirname(os.path.abspath(__file__))
uploads_dir = os.path.join(parent_dir, "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

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
            print(f"[*] Default admin seeded successfully: {default_email} / {default_password}")
    except Exception as e:
        db.rollback()
        print(f"[!] Error seeding admin: {str(e)}")
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
