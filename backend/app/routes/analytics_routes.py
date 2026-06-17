import random
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from collections import Counter
from app.database.db import get_db
from app.models.report import Report
from app.models.admin import Admin
from app.services.auth_service import get_current_admin

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary")
def get_summary(db: Session = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    """
    Get incident report metrics (Total, High Risk, Medium Risk, Low Risk).
    """
    total = db.query(Report).count()
    high = db.query(Report).filter(Report.risk_level == "High").count()
    medium = db.query(Report).filter(Report.risk_level == "Medium").count()
    low = db.query(Report).filter(Report.risk_level == "Low").count()
    
    # Handle fallback/pending cases as Low risk
    pending = db.query(Report).filter(Report.risk_level.in_(["Pending", "low", "medium", "high"])).all()
    for p in pending:
        if p.risk_level.lower() == "high":
            high += 1
        elif p.risk_level.lower() == "medium":
            medium += 1
        else:
            low += 1
            
    # Re-calculate clean values
    total_db = db.query(Report).all()
    c_high = 0
    c_medium = 0
    c_low = 0
    for r in total_db:
        rl = (r.risk_level or "low").lower()
        if rl == "high":
            c_high += 1
        elif rl == "medium":
            c_medium += 1
        else:
            c_low += 1

    return {
        "total": len(total_db),
        "high": c_high,
        "medium": c_medium,
        "low": c_low
    }

@router.get("/charts")
def get_charts_data(db: Session = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    """
    Get aggregated data for incident categories, risk levels, and monthly distributions.
    """
    reports = db.query(Report).all()
    
    # 1. Categories
    categories = [r.incident_type for r in reports]
    category_counts = Counter(categories)
    category_data = [{"category": cat, "count": count} for cat, count in category_counts.items()]
    
    # 2. Risk Levels
    risk_levels = []
    for r in reports:
        rl = (r.risk_level or "Low").capitalize()
        if rl not in ["Low", "Medium", "High"]:
            rl = "Low"
        risk_levels.append(rl)
    risk_counts = Counter(risk_levels)
    risk_data = [{"risk_level": rl, "count": count} for rl, count in risk_counts.items()]
    
    # Ensure all three levels are present in risk_data for consistent frontend chart rendering
    for level in ["Low", "Medium", "High"]:
        if not any(d["risk_level"] == level for d in risk_data):
            risk_data.append({"risk_level": level, "count": 0})
            
    # 3. Monthly Reports (e.g. "Jun 2026")
    months = [r.created_at.strftime("%b %Y") for r in reports]
    month_counts = Counter(months)
    month_data = [{"month": m, "count": count} for m, count in month_counts.items()]
    # Sort monthly list to order it chronologically if possible, or keep original order
    month_data = sorted(month_data, key=lambda x: datetime_parser(x["month"]), reverse=False)
    
    return {
        "categories": category_data,
        "risk_levels": risk_data,
        "monthly": month_data
    }

def datetime_parser(month_str: str):
    from datetime import datetime
    try:
        return datetime.strptime(month_str, "%b %Y")
    except Exception:
        return datetime.min

@router.get("/hotspots")
def get_hotspots(db: Session = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    """
    Generate coordinates for incidents to plot on a Leaflet map.
    """
    reports = db.query(Report).all()
    hotspots = []
    
    # Coordinate registry for text-based locations in India (where local time suggests location)
    location_coords = {
        "mumbai": (19.0760, 72.8777),
        "pune": (18.5204, 73.8567),
        "delhi": (28.7041, 77.1025),
        "bangalore": (12.9716, 77.5946),
        "chennai": (13.0827, 80.2707),
        "kolkata": (22.5726, 88.3639),
        "hyderabad": (17.3850, 78.4867),
        "nagpur": (21.1458, 79.0882),
        "nashik": (19.9975, 73.7898),
        "aurangabad": (19.8762, 75.3433),
        "thane": (19.2183, 72.9781),
    }

    for r in reports:
        lat, lng = None, None
        
        # Case A: User entered coordinates directly as "lat, lng" (e.g. "18.52, 73.85")
        if r.location and "," in r.location:
            try:
                parts = r.location.split(",")
                if len(parts) == 2:
                    lat = float(parts[0].strip())
                    lng = float(parts[1].strip())
            except ValueError:
                pass
                
        # Case B: Text matching to city names with small random jitter
        if (lat is None or lng is None) and r.location:
            loc_lower = r.location.lower()
            for city, coords in location_coords.items():
                if city in loc_lower:
                    lat, lng = coords
                    lat += random.uniform(-0.02, 0.02)
                    lng += random.uniform(-0.02, 0.02)
                    break
                    
        # Case C: Fallback to Mumbai coordinates with random offset
        if lat is None or lng is None:
            lat = 19.0760 + random.uniform(-0.15, 0.15)
            lng = 72.8777 + random.uniform(-0.15, 0.15)

        hotspots.append({
            "id": r.id,
            "reference_id": r.reference_id,
            "incident_type": r.incident_type,
            "location_name": r.location,
            "risk_level": (r.risk_level or "Low").capitalize(),
            "risk_score": r.risk_score or "5",
            "sentiment": r.sentiment or "Neutral",
            "summary": r.summary or "",
            "priority": (r.priority or "Routine").capitalize(),
            "latitude": lat,
            "longitude": lng,
            "created_at": r.created_at
        })
        
    return hotspots

@router.get("/hotspot-clusters")
def get_hotspot_clusters(db: Session = Depends(get_db), current_admin: Admin = Depends(get_current_admin)):
    """
    Groups incidents by location to identify clusters (hotspots).
    Returns a list of clusters with count and average risk score.
    """
    reports = db.query(Report).all()
    clusters = {}
    
    # Simple city-based clustering for this demonstration
    # In a real app, this could use DBSCAN or K-Means on lat/lng
    for r in reports:
        loc = r.location.lower().strip()
        # Clean location to get main city name
        city = loc.split(",")[0].strip()
        
        if city not in clusters:
            clusters[city] = {
                "location": city,
                "count": 0,
                "risk_sum": 0,
                "incidents": []
            }
        
        clusters[city]["count"] += 1
        try:
            risk_val = int(r.risk_score or 5)
        except ValueError:
            risk_val = 5
        clusters[city]["risk_sum"] += risk_val
        clusters[city]["incidents"].append(r.reference_id)
        
    result = []
    for city, data in clusters.items():
        avg_risk = data["risk_sum"] / data["count"]
        result.append({
            "location": city.capitalize(),
            "incident_count": data["count"],
            "average_risk_score": round(avg_risk, 1),
            "severity": "High" if avg_risk >= 7 else "Medium" if avg_risk >= 4 else "Low"
        })
        
    # Sort by count descending
    result = sorted(result, key=lambda x: x["incident_count"], reverse=True)
    return result
