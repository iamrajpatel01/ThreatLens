from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, BackgroundTasks, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from prisma import Prisma
import json
import os
import google.generativeai as genai
from recon import run_discovery_pipeline
from idor_tester import test_idor_logic

# Initialize Prisma Client
db = Prisma()

# Configure Google Gemini AI
# You will need to export GEMINI_API_KEY in your environment
try:
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    # Use the flash model for speed during hackathons/prototypes
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    print(f"Warning: Failed to configure GenAI: {e}")
    model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to the database on startup
    await db.connect()
    yield
    # Disconnect on shutdown
    await db.disconnect()

app = FastAPI(lifespan=lifespan, title="ThreatLens Core API")

# Allow Next.js frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# Pydantic Schemas for Requests
# -------------------------------------------------------------------

class ScopeCreate(BaseModel):
    domain: str

class ScanRequest(BaseModel):
    scopeId: str

class IdorRequest(BaseModel):
    endpoint: str
    userAToken: str
    userBToken: str
    targetId: str

class RemediationRequest(BaseModel):
    vulnerabilityId: str

# -------------------------------------------------------------------
# LOCAL VULNERABLE-BY-DESIGN API (For Logic Validation Testing)
# -------------------------------------------------------------------

# In a real scenario, this would be the client's staging API.
# Here, we simulate a flawed endpoint that has Broken Object Level Authorization (IDOR).
mock_database = {
    "admin-uuid-1234": {"email": "admin@corporate-cloud.io", "tax_records": "CONFIDENTIAL_2024"},
    "user-uuid-5678": {"email": "guest@corporate-cloud.io", "tax_records": "NONE"}
}

@app.get("/api/v1/user/{user_id}")
async def get_user_profile(user_id: str, authorization: str = Header(default="")):
    # VULNERABILITY: It checks IF a token is present, but doesn't verify if the token OWNS the user_id!
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    if user_id in mock_database:
        return mock_database[user_id]
    raise HTTPException(status_code=404, detail="Not Found")

# -------------------------------------------------------------------
# KNOWLEDGE GRAPH ROUTES
# -------------------------------------------------------------------

@app.post("/api/scopes", status_code=201)
async def create_scope(scope: ScopeCreate):
    """Adds a new authorized validation domain."""
    clean_domain = scope.domain.strip().lower()
    
    # Check if exists
    existing = await db.scope.find_unique(where={"domain": clean_domain})
    if existing:
        return {"success": True, "scope": existing}
        
    # Create the scope
    new_scope = await db.scope.create(
        data={
            "domain": clean_domain
        }
    )
    return {"success": True, "scope": new_scope}

@app.get("/api/state")
async def get_knowledge_graph_state():
    """Returns the unified Knowledge Graph for the Next.js Threat Map visualization."""
    assets = await db.asset.find_many(include={"services": True, "linkedTo": True})
    vulnerabilities = await db.vulnerability.find_many(include={"remediations": True, "assets": True})
    identities = await db.identity.find_many()
    
    return {
        "assets": assets,
        "vulnerabilities": vulnerabilities,
        "identities": identities
    }

# -------------------------------------------------------------------
# WORKER EXECUTION ROUTES
# -------------------------------------------------------------------

@app.post("/api/scan/recon")
async def trigger_recon(req: ScanRequest):
    """Triggers the Deep Recon & JS Analysis pipeline in the background."""
    # Note: In production use Celery/BackgroundTasks. Awaiting directly for prototype visibility.
    await run_discovery_pipeline(req.scopeId)
    return {"success": True, "message": "Recon completed"}

@app.post("/api/scan/idor")
async def trigger_idor_test(req: IdorRequest):
    """Triggers the State-Comparison Logic Testing module."""
    is_vuln = await test_idor_logic(req.endpoint, req.userAToken, req.userBToken, req.targetId)
    return {"success": True, "vulnerable": is_vuln}

# -------------------------------------------------------------------
# REMEDIATION & LLM ENGINE
# -------------------------------------------------------------------

@app.post("/api/remediate")
async def generate_remediation(req: RemediationRequest):
    """Uses LLM to ingest a vulnerability from the DB and generate a PR and code snippet."""
    if not model:
        raise HTTPException(status_code=500, detail="Gemini AI model is not configured.")

    vuln = await db.vulnerability.find_unique(
        where={"id": req.vulnerabilityId},
        include={"assets": True}
    )
    
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")

    affected_assets = ", ".join([a.name for a in vuln.assets]) if vuln.assets else "Unknown"

    prompt = f"""
    Act as a Senior Principal Security Architect.
    Generate a production-ready code patch and a GitHub Pull Request description for this vulnerability.

    Vulnerability Title: {vuln.title}
    Severity: {vuln.severity}
    Type: {vuln.type}
    Description: {vuln.description}
    Attack Path Context (So What?): {vuln.context}
    Asset(s) Affected: {affected_assets}

    Rules:
    - If the type is IDOR, generate Node/Express middleware code.
    - If the type is missing headers or SSL, generate an Nginx config snippet.
    - If the type is EXPOSED_API_KEY, generate code showing how to read from environment variables.
    - Ensure your output is purely a JSON object matching this schema EXACTLY:
    {{
        "type": "MiddlewareCode" | "PatchCode" | "NginxConfig",
        "snippet": "The pure code to fix the issue (no markdown wrapping in the string)",
        "prBody": "A highly professional, dark-mode friendly markdown description of the Pull Request explaining the fix."
    }}
    Do not wrap the JSON in markdown blocks like ```json. Return ONLY valid JSON.
    """

    try:
        response = model.generate_content(prompt)
        # Clean the response to ensure it's just JSON
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        ai_data = json.loads(text.strip())

        # Save to Knowledge Graph
        rem = await db.remediation.create(
            data={
                "title": f"Dynamic AI Patch for {vuln.type}",
                "type": ai_data.get("type", "PatchCode"),
                "snippet": ai_data.get("snippet", ""),
                "description": "Autonomously generated AI mitigation shield.",
                "prBody": ai_data.get("prBody", ""),
                "vulnerabilityId": vuln.id
            }
        )

        return {"success": True, "remediation": rem}
    except Exception as e:
        print(f"LLM Generation Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to synthesize remediation.")
