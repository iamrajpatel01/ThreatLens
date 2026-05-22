import httpx
import json
from prisma import Prisma

db = Prisma()

async def test_idor_logic(endpoint: str, token_a: str, token_b: str, target_id: str):
    """
    The Pentester Module: State-Comparison Logic Testing.
    Instead of simulated text, it actually uses httpx to test the local vulnerable API.
    """
    print(f"[*] Starting Logic Validation on {endpoint}")
    await db.connect()
    
    is_vulnerable = False
    
    # We will test the local Vulnerable-by-Design API in main.py
    base_url = "http://localhost:8000"
    target_url = f"{base_url}{endpoint}/{target_id}"

    async with httpx.AsyncClient() as client:
        # Request 1: Legitimate access by User A
        res_a = await client.get(target_url, headers={"Authorization": f"Bearer {token_a}"})
        res_a_body = res_a.text
        status_a = res_a.status_code
        
        # Request 2: Attack access by User B requesting User A's data
        res_b = await client.get(target_url, headers={"Authorization": f"Bearer {token_b}"})
        res_b_body = res_b.text
        status_b = res_b.status_code

    # Detection Logic:
    if status_b == 200 and res_b_body == res_a_body:
        print("[!] HIGH SEVERITY: IDOR Detected. User B accessed User A's data.")
        is_vulnerable = True
        
        # Get an asset to link to (mocking the API asset for this demo)
        asset = await db.asset.find_first(where={"name": "api.corporate-cloud.io"})
        asset_id = asset.id if asset else None

        if asset_id:
            vuln_title = f"Broken Object Level Authorization (IDOR) at {endpoint}"
            
            # Deduplication
            existing_vuln = await db.vulnerability.find_first(where={"title": vuln_title})
            
            if existing_vuln:
                print(f"[*] Deduplicating IDOR vulnerability, attaching asset {asset_id}")
                await db.vulnerability.update(
                    where={"id": existing_vuln.id},
                    data={"assets": {"connect": [{"id": asset_id}]}}
                )
            else:
                vuln = await db.vulnerability.create(
                    data={
                        "title": vuln_title,
                        "type": "IDOR",
                        "severity": "High",
                        "description": "Logic validation engine successfully swapped JWTs and retrieved another user's restricted objects.",
                        "context": "Attackers can enumerate 'target_id' UUIDs and download confidential user tax records.",
                        "attackPathSequence": json.dumps([asset_id, "backend-logic-flaw", "user-database"]),
                        "assets": {"connect": [{"id": asset_id}]}
                    }
                )
                
                # Create Evidence payload
                await db.evidence.create(
                    data={
                        "requestA": f"GET {target_url} HTTP/1.1\nAuthorization: Bearer {token_a}",
                        "requestB": f"GET {target_url} HTTP/1.1\nAuthorization: Bearer {token_b}",
                        "responseA": f"HTTP 200 OK\n\n{res_a_body}",
                        "responseB": f"HTTP 200 OK\n\n{res_b_body}",
                        "vulnerabilityId": vuln.id
                    }
                )
    else:
        print("[*] Secure: Endpoint correctly rejected unauthorized token.")
        
    await db.disconnect()
    return is_vulnerable

if __name__ == "__main__":
    pass
