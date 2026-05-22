# ThreatLens: Architecture & Code Deep Dive

This document explains exactly how the ThreatLens platform was built, the tools used, the codebase structure, and how the magic behind the Topology & Attack Path Visualizer works.

---

## 1. The Tech Stack & Tools Used

We built a full-stack, decoupled architecture to ensure the security engine can scale independently from the frontend dashboard.

### **Frontend (The Interface & Visualizer)**
- **Framework:** **Next.js 16** utilizing Turbopack for ultra-fast compilation.
- **Styling:** **Tailwind CSS** for the high-contrast, dark-mode "hacker" aesthetic.
- **Visualization:** **`react-force-graph-2d`**, a React wrapper around the powerful `d3-force` physics engine. It uses HTML5 Canvas to render massive node graphs at 60 FPS.
- **Icons:** **Lucide React** for crisp, scalable dashboard icons.

### **Backend (The Brain & Workers)**
- **Framework:** **FastAPI (Python)**. Chosen for its native asynchronous (`async/await`) capabilities, which are absolutely critical when performing thousands of network requests concurrently.
- **Database ORM:** **Prisma for Python**. We use Prisma to map out a highly relational SQLite database.
- **Network Engine:** **`httpx`**. Used for high-speed, asynchronous HTTP requests (unlike the synchronous `requests` library).
- **Deep Recon Engine:** **Playwright (async)**. A headless browser that allows us to load web pages, execute their JavaScript, and intercept the compiled bundles to read source code.
- **AI Engine:** **Google Gemini API** (`gemini-1.5-flash`). Used to ingest vulnerabilities and autonomously synthesize production-ready code patches (Node.js middlewares, Nginx configs).

---

## 2. Core Features & Code Breakdown

The codebase is split into specific "Engines" that act as our Virtual Security Engineer.

### A. The Knowledge Graph (Database Schema)
Traditional scanners output flat lists (e.g., a 500-page CSV of bugs). ThreatLens uses a **Knowledge Graph** (`schema.prisma`). 
- **Assets** (IPs, Subdomains, Cloud Buckets) have a Many-to-Many (`M:N`) relationship with **Vulnerabilities**.
- **Deduplication:** If 10 subdomains have the same SSL flaw, the backend doesn't create 10 alerts. It creates **one** Vulnerability and links it to 10 Assets. This drastically reduces alert fatigue.

### B. Deep Recon Engine (`recon.py`)
This script handles the "Discovery" phase.
1. **Subprocess Orchestration:** It fires off a `subfinder` terminal process to find active subdomains.
2. **Liveness Checking:** It uses an `httpx` loop to ping those subdomains. If they return a 500 or don't exist, they are dropped. Only "Live" assets are added to the Graph.
3. **JS Analysis:** It acts like a real hacker. It pulls down the `.js` chunk files and runs strict Regular Expressions (`Regex`) to find AWS API keys (`AKIA...`) and developer comments containing passwords or "TODOs". 

### C. Logic Validation / Pentester Engine (`idor_tester.py`)
Scanners can't find complex logic flaws. This engine does.
1. It is given a target endpoint (`/api/v1/user/{id}`) and two sets of credentials (User A and User B).
2. It intercepts User A's token and injects User B's token while trying to access User A's data.
3. **Evidence Generator:** If the attack succeeds (Broken Object Level Authorization / IDOR), it saves the exact raw HTTP Request and Response payloads to an `Evidence` database table so engineers have cryptographic proof of the flaw.

---

## 3. How the Topology & Attack Path Visualizer Actually Works

The crown jewel of the frontend is the **Topology & Attack Path Visualizer** (`ThreatForceGraph.tsx`). Here is exactly how it functions under the hood:

### **The Physics Engine**
The visualizer is not a static image. It is a living, breathing physics simulation powered by `d3-force`. 
Nodes repel each other (like magnets) while Links pull them together (like springs). This allows the graph to naturally untangle itself no matter how complex the architecture gets.

### **The Data Mapping Logic**
The backend sends the frontend three main arrays: `Assets`, `Identities` (leaked keys/users), and `Vulnerabilities`.
In `ThreatForceGraph.tsx`, we loop through these and push them into a single `nodes` array:
```javascript
// Example: Creating nodes
nodes.push({ id: asset.id, name: asset.name, group: 'Asset' });
nodes.push({ id: vuln.id, name: vuln.title, group: 'Vulnerability' });
```

Then, we create the `links` (the lines connecting the dots):
```javascript
// Example: Linking a Subdomain to an IP
links.push({ source: subdomain.id, target: ip.id });
```

### **The "Attack Path" Magic**
When `recon.py` finds an exposed AWS Key in a JavaScript file, it doesn't just create an alert. It builds a literal sequence of events:
1. It creates the **Subdomain Asset**.
2. It creates the **Leaked API Key Identity**.
3. It dynamically generates a **Cloud Bucket Asset**.
4. It saves an `attackPathSequence` to the database: `["subdomain_id", "identity_id", "bucket_id"]`.

When the React frontend reads this array, it loops through the IDs and draws special **Attack Path Links**:
```javascript
// Drawing the Attack Path
links.push({ 
    source: sequence[0], 
    target: sequence[1], 
    isAttackPath: true 
});
```
The canvas renderer then looks at `isAttackPath`. If it is true, it changes the line from a dull gray connection into a glowing, directional red arrow (`#fb7185`), visually proving to the user exactly how an attacker traverses from the public internet, through the leaked key, straight into the sensitive database!
