import os
import json
import logging
import httpx

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

def analyze_incident_description(description: str) -> dict:
    """
    Analyze incident description using Groq API and return category, risk_level, and priority.
    """
    default_result = {
        "category": "General Incident",
        "risk_level": "Medium",
        "risk_score": "5",
        "sentiment": "Neutral",
        "summary": "No summary available.",
        "priority": "Routine"
    }

    if not GROQ_API_KEY:
        logger.warning("GROQ_API_KEY not found in environment. Using rule-based fallback analysis.")
        return fallback_analysis(description)

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    system_prompt = (
        "You are an AI assistant specialized in risk assessment and public safety. Analyze the incident report description "
        "and classify it. You MUST return ONLY a valid JSON object with the keys: "
        "'category' (e.g. Harassment, Domestic Violence, Cyber Abuse, Stalking, Theft, Other), "
        "'risk_level' (Low, Medium, High), "
        "'risk_score' (A numeric string 1-10 where 10 is most dangerous), "
        "'sentiment' (Positive, Neutral, Negative), "
        "'summary' (A concise 1-sentence summary of the incident), and "
        "'priority' (Low, Routine, Urgent). "
        "Output ONLY the JSON object. Do not include markdown formatting or extra text."
    )

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Description to analyze: {description}"}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.1
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post(GROQ_API_URL, headers=headers, json=payload)
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                parsed_data = json.loads(content)
                
                # Validate required keys are present
                validated_data = {
                    "category": str(parsed_data.get("category", default_result["category"])),
                    "risk_level": str(parsed_data.get("risk_level", default_result["risk_level"])),
                    "risk_score": str(parsed_data.get("risk_score", default_result["risk_score"])),
                    "sentiment": str(parsed_data.get("sentiment", default_result["sentiment"])),
                    "summary": str(parsed_data.get("summary", default_result["summary"])),
                    "priority": str(parsed_data.get("priority", default_result["priority"]))
                }
                return validated_data
            else:
                logger.error(f"Groq API error: Status {response.status_code}, Body: {response.text}")
    except Exception as e:
        logger.error(f"Failed to call Groq API: {str(e)}")

    # Fall back to heuristic rule-based analysis if API fails
    return fallback_analysis(description)

def fallback_analysis(description: str) -> dict:
    """
    A simple rule-based fallback when Groq API key is missing or fails.
    """
    desc_lower = description.lower()
    
    category = "General Incident"
    risk_level = "Medium"
    priority = "Routine"

    # Rule-based classification
    if any(k in desc_lower for k in ["harass", "threat", "abuse", "bully", "stalk"]):
        category = "Harassment"
        risk_level = "High"
        priority = "Urgent"
    elif any(k in desc_lower for k in ["cyber", "hack", "online", "scam", "phish", "spam"]):
        category = "Cyber Abuse"
        risk_level = "Medium"
        priority = "Routine"
    elif any(k in desc_lower for k in ["kill", "weapon", "gun", "knife", "stab", "shoot", "violence", "beat"]):
        category = "Violence"
        risk_level = "High"
        priority = "Urgent"
    elif any(k in desc_lower for k in ["steal", "theft", "rob", "burglar"]):
        category = "Theft"
        risk_level = "Medium"
        priority = "Routine"

    return {
        "category": category,
        "risk_level": risk_level,
        "risk_score": "8" if risk_level == "High" else "5" if risk_level == "Medium" else "3",
        "sentiment": "Negative",
        "summary": description[:100] + "...",
        "priority": priority
    }
