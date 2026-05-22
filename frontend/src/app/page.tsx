"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from 'next/dynamic';
import { 
  ShieldAlert, 
  Crosshair, 
  Cpu, 
  Box, 
  Database, 
  Radar, 
  Activity, 
  Search, 
  Bell, 
  User, 
  Terminal, 
  Settings, 
  Layers, 
  Wifi, 
  Clock, 
  Sparkles, 
  Code, 
  GitPullRequest, 
  TrendingUp, 
  TrendingDown, 
  Server, 
  CheckCircle, 
  Play, 
  Flame, 
  ShieldCheck, 
  AlertOctagon, 
  ArrowRight,
  Shield,
  RefreshCw,
  Globe
} from "lucide-react";

import RemediationDashboard from "@/components/RemediationDashboard";
import TerminalLogs from "@/components/TerminalLogs";
import AIChatWidget from "@/components/AIChatWidget";

// Dynamic imports to prevent SSR hydration mismatches on canvas components
const ThreatFlowGraph = dynamic(() => import('@/components/ThreatFlowGraph'), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/ParticleBackground'), { ssr: false });

export default function Home() {
  const [scopes, setScopes] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [identities, setIdentities] = useState<any[]>([]);
  
  // Scans & API progress states
  const [newScope, setNewScope] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanType, setScanType] = useState<string | null>(null);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  
  // Interactive UI Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [selectedNav, setSelectedNav] = useState("Dashboard");
  const [manuallyMitigatedIds, setManuallyMitigatedIds] = useState<string[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");

  // System status metrics (uptime, active workers)
  const systemUptime = "14d 6h 32m";
  const apiLatency = "14ms";

  // Fetch target database state
  const fetchState = () => {
    fetch("http://localhost:8000/api/state")
      .then((res) => res.json())
      .then((data) => {
        setAssets(data.assets || []);
        setVulnerabilities(data.vulnerabilities || []);
        setIdentities(data.identities || []);
      })
      .catch((err) => {
        console.error("Failed to fetch state:", err);
        addSystemLog("Failed to sync knowledge graph from API server.");
      });
  };

  // Fetch scopes from the backend
  const fetchScopes = () => {
    // For convenience, since scopes are associated with assets, 
    // we can retrieve them or deduce them, but let's query the database.
    // The backend doesn't have an explicit GET /api/scopes, but it lists state.
    // Let's gather the scopes from assets if needed, or query if endpoint exists.
    fetch("http://localhost:8000/api/state")
      .then((res) => res.json())
      .then((data) => {
        // Collect unique scopes from assets or initialize with defaults
        const uniqueDomains = Array.from(new Set(data.assets?.filter((a: any) => a.scopeId).map((a: any) => a.scope?.domain || "corporate-cloud.io")));
        if (uniqueDomains.length > 0) {
          setScopes(uniqueDomains.map(d => ({ domain: d, id: "scope-id" })));
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchState();
    fetchScopes();
    addSystemLog("Cybersecurity Operations Console loaded. Engine v2.0 initialized.");
  }, []);

  const addSystemLog = (msg: string) => {
    setSystemLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const handleAddScope = async () => {
    if (!newScope.trim()) return;
    
    addSystemLog(`Adding domain boundary scope: ${newScope}`);
    try {
      const res = await fetch("http://localhost:8000/api/scopes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newScope }),
      });
      const data = await res.json();
      if (data.success) {
        setScopes((prev) => [...prev, data.scope]);
        setNewScope("");
        addSystemLog(`Scope domain successfully authorized: ${data.scope.domain}`);
        triggerNotification(`New scope added: ${data.scope.domain}`);
        fetchState();
      }
    } catch (err) {
      console.error(err);
      addSystemLog("Failed to record scope validation.");
    }
  };

  // Trigger floating notifications
  const triggerNotification = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  // Simulate progress loading bars for engines
  const simulateScanProgress = (type: string, durationMs: number, onComplete: () => void) => {
    setScanType(type);
    setScanProgress(0);
    const intervalTime = 100;
    const step = 100 / (durationMs / intervalTime);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setScanType(null);
            setScanProgress(0);
            onComplete();
          }, 600);
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);
  };

  const handleRunRecon = async () => {
    if (scopes.length === 0) {
      addSystemLog("ERROR: Cannot trigger scanner. Active scope list is empty.");
      triggerNotification("Define boundary scope first.");
      return;
    }
    
    setLoadingAction('recon');
    addSystemLog("Launching Autonomous Recon Engine. Spawning Chromium crawler...");
    
    simulateScanProgress('recon', 4000, () => {
      addSystemLog("Subfinder and Active JS compilation scans complete. Knowledge graph updated.");
      triggerNotification("Discovery scan complete: 3 subdomains mapped.");
    });

    try {
      await fetch("http://localhost:8000/api/scan/recon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scopeId: scopes[0].id || "scope-id" }),
      });
      fetchState();
    } catch (e) {
      console.error(e);
    }
    setLoadingAction(null);
  };

  const handleRunIdor = async () => {
    setLoadingAction('idor');
    addSystemLog("Starting State-Comparison logic validator on /api/v1/user...");
    
    simulateScanProgress('idor', 3000, () => {
      addSystemLog("IDOR Logic validation complete. Swapped token signatures mapped.");
      triggerNotification("Logic testing complete. Access leaks identified.");
    });

    try {
      await fetch("http://localhost:8000/api/scan/idor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          endpoint: "/api/v1/user", 
          userAToken: "TOKEN_A", 
          userBToken: "TOKEN_B", 
          targetId: "admin-uuid-1234" 
        }),
      });
      fetchState();
    } catch (e) {
      console.error(e);
    }
    setLoadingAction(null);
  };

  const handleMitigationChange = (vulnId: string, isMitigated: boolean) => {
    if (isMitigated) {
      setManuallyMitigatedIds(prev => [...prev, vulnId]);
      addSystemLog(`Shield Patch deployed successfully for vulnerability ID: ${vulnId.slice(0, 8)}`);
      triggerNotification("Security Shield enforced on runtime.");
    }
  };

  // Compile active mitigated IDs from DB + manual overrides
  const activeMitigatedIds = useMemo(() => {
    const dbMitigated = vulnerabilities.filter(v => v.remediations && v.remediations.length > 0).map(v => v.id);
    return Array.from(new Set([...dbMitigated, ...manuallyMitigatedIds]));
  }, [vulnerabilities, manuallyMitigatedIds]);

  // Derived metrics calculations
  const totalAssetsCount = assets.length;
  const activeThreatsCount = vulnerabilities.filter(v => !activeMitigatedIds.includes(v.id)).length;
  const criticalVulnsCount = vulnerabilities.filter(v => v.severity === 'Critical' && !activeMitigatedIds.includes(v.id)).length;
  const attackPathsCount = vulnerabilities.filter(v => v.attackPathSequence && !activeMitigatedIds.includes(v.id)).length;
  
  const exposureScore = useMemo(() => {
    let score = 15; // Base exposure score
    vulnerabilities.forEach(v => {
      if (activeMitigatedIds.includes(v.id)) return;
      if (v.severity === 'Critical') score += 25;
      else if (v.severity === 'High') score += 15;
      else if (v.severity === 'Medium') score += 8;
      else score += 3;
    });
    return Math.min(score, 99);
  }, [vulnerabilities, activeMitigatedIds]);

  const aiConfidenceScore = useMemo(() => {
    if (vulnerabilities.length === 0) return 99;
    const mitigatedRatio = activeMitigatedIds.length / vulnerabilities.length;
    return Math.round(92 + (mitigatedRatio * 7));
  }, [vulnerabilities, activeMitigatedIds]);

  // Filter vulnerabilities in table
  const filteredVulnerabilities = useMemo(() => {
    return vulnerabilities.filter(v => {
      const matchesSearch = 
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        v.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSeverity = severityFilter === "All" || v.severity === severityFilter;
      
      return matchesSearch && matchesSeverity;
    });
  }, [vulnerabilities, searchQuery, severityFilter]);

  // Sparklines trend drawings
  const getSparklinePath = (type: string) => {
    switch (type) {
      case 'assets':
        return "M 0 25 L 15 22 L 30 18 L 45 20 L 60 12 L 75 15 L 90 5 L 100 2";
      case 'threats':
        return activeThreatsCount > 0 
          ? "M 0 20 L 15 10 L 30 25 L 45 8 L 60 18 L 75 22 L 90 10 L 100 12"
          : "M 0 20 L 15 10 L 30 25 L 45 8 L 60 18 L 75 22 L 90 28 L 100 30";
      case 'critical':
        return criticalVulnsCount > 0
          ? "M 0 25 L 20 22 L 40 10 L 60 8 L 80 15 L 100 5"
          : "M 0 25 L 20 22 L 40 10 L 60 22 L 80 28 L 100 30";
      case 'paths':
        return attackPathsCount > 0
          ? "M 0 25 L 15 15 L 30 22 L 45 10 L 60 15 L 75 5 L 90 12 L 100 8"
          : "M 0 25 L 15 15 L 30 22 L 45 10 L 60 15 L 75 24 L 90 28 L 100 30";
      case 'confidence':
        return "M 0 15 L 20 16 L 40 14 L 60 15 L 80 13 L 100 12";
      case 'exposure':
        return exposureScore > 30
          ? "M 0 25 L 20 18 L 40 10 L 60 5 L 80 8 L 100 3"
          : "M 0 10 L 20 15 L 40 22 L 60 25 L 80 28 L 100 27";
      default:
        return "M 0 15 L 100 15";
    }
  };

  // Convert state elements to feed logs for Terminal
  const backendDerivedLogs = useMemo(() => {
    const logs: any[] = [];
    if (assets.length > 0) {
      logs.push({
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: 'info',
        message: `Validation Node Synced: ${assets.length} assets retrieved from boundary mapping.`
      });
    }
    assets.forEach((a, i) => {
      logs.push({
        timestamp: new Date(Date.now() - 50000 + i * 2000).toISOString(),
        level: 'success',
        message: `Asset validated: ${a.name} [Type: ${a.type}] - Status: ${a.status.toUpperCase()}`
      });
    });
    identities.forEach((id, i) => {
      logs.push({
        timestamp: new Date(Date.now() - 40000 + i * 2000).toISOString(),
        level: 'warn',
        message: `Credentials Intercepted: parsed leaked keys in source ${id.source}`
      });
    });
    vulnerabilities.forEach((v, i) => {
      const isMit = activeMitigatedIds.includes(v.id);
      logs.push({
        timestamp: new Date(Date.now() - 30000 + i * 2000).toISOString(),
        level: isMit ? 'success' : 'error',
        message: isMit 
          ? `SHIELD VERIFIED: Attack vector blocked on ${v.title}`
          : `ALERT [${v.severity.toUpperCase()}]: Vulnerable flow detected -> ${v.title}`
      });
    });
    return logs.reverse();
  }, [assets, vulnerabilities, identities, activeMitigatedIds]);

  return (
    <div className="min-h-screen flex flex-col bg-[#050816] text-[#e2e8f0] relative overflow-hidden font-sans">
      {/* Sparkles Particle Canvas Background */}
      <ParticleBackground />

      {/* Floating Notifications */}
      {showNotification && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-lg bg-cyber-sec/90 border border-cyber-blue/50 shadow-[0_0_15px_rgba(0,217,255,0.2)] text-xs font-mono flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="w-2 h-2 rounded-full bg-cyber-blue animate-ping"></span>
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="w-full h-16 border-b border-cyber-border/40 bg-cyber-sec/30 backdrop-blur-md flex items-center justify-between px-6 z-30 relative shrink-0">
        {/* Logo & Platform Info */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 rounded bg-cyber-blue/20 blur group-hover:blur-md transition-all duration-300"></div>
            <div className="relative p-2 rounded bg-cyber-bg border border-cyber-blue/30 text-cyber-blue">
              <Radar className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-md font-display font-bold tracking-wider text-white uppercase">ThreatLens Platform</h1>
              <span className="text-[9px] font-mono bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/40 px-1.5 py-0.2 rounded font-bold">
                EVAL v2.0
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">Autonomous Security Validation Engine</p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center w-80 relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search assets, flows, or CVEs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#030612]/60 border border-cyber-border/80 focus:border-cyber-blue/50 rounded-md py-1.5 pl-9 pr-4 text-xs font-mono text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Status Indicators & Profile */}
        <div className="flex items-center gap-5">
          {/* Uptime Indicator */}
          <div className="hidden lg:flex flex-col text-right font-mono text-[10px]">
            <span className="text-slate-500">UPTIME</span>
            <span className="text-slate-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyber-blue" /> {systemUptime}
            </span>
          </div>

          {/* AI Status */}
          <div className="flex items-center gap-2 bg-[#02050e] border border-cyber-border/40 px-3 py-1.5 rounded-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green"></span>
            </span>
            <span className="text-[9px] font-mono text-cyber-green font-bold tracking-widest">
              AI ENGINE: ACTIVE
            </span>
          </div>

          {/* Bell Alerts */}
          <button 
            onClick={() => triggerNotification("Security validation channels active. Zero leaks discovered in queue.")}
            className="p-2 rounded bg-slate-900/50 border border-cyber-border/60 text-slate-400 hover:text-cyber-blue hover:border-cyber-blue/30 transition-all cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyber-red rounded-full"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-cyber-purple/50 overflow-hidden bg-slate-900 flex items-center justify-center relative cursor-pointer group">
              <div className="absolute inset-0 bg-cyber-purple/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <User className="w-4 h-4 text-cyber-purple" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidebar */}
        <aside className="w-72 border-r border-cyber-border/30 bg-cyber-sec/10 backdrop-blur-md hidden xl:flex flex-col justify-between p-5 z-20 shrink-0">
          <div className="space-y-6">
            
            {/* Navigation Menu */}
            <div>
              <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-3">
                Core Operations
              </label>
              <div className="space-y-1">
                {[
                  { name: "Dashboard", icon: Layers },
                  { name: "Target Scope", icon: Crosshair },
                  { name: "Threat Map", icon: Box },
                  { name: "Remediation", icon: Sparkles },
                  { name: "Terminal", icon: Terminal },
                  { name: "Settings", icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = selectedNav === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setSelectedNav(item.name);
                        addSystemLog(`Navigating to ${item.name} modules`);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded font-mono text-xs cursor-pointer transition-all ${
                        isActive 
                          ? 'bg-cyber-blue/10 border border-cyber-blue/20 text-white font-bold' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyber-blue' : 'text-slate-500'}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Boundary Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                  Validated Boundaries
                </label>
                <Globe className="w-3.5 h-3.5 text-cyber-blue/60" />
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="scope domain..."
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddScope()}
                    className="flex-1 bg-cyber-bg border border-cyber-border focus:border-cyber-blue/40 rounded px-2.5 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none"
                  />
                  <button 
                    onClick={handleAddScope}
                    className="bg-cyber-blue/20 hover:bg-cyber-blue/35 text-cyber-blue border border-cyber-blue/40 px-2.5 rounded text-xs font-mono font-bold cursor-pointer"
                  >
                    ADD
                  </button>
                </div>
                
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {scopes.map((s, i) => (
                    <div key={i} className="px-3 py-2 bg-slate-950/80 border border-cyber-border/60 rounded text-[11px] font-mono flex justify-between items-center group hover:border-cyber-blue/30 transition-all">
                      <span className="text-slate-300 truncate" title={s.domain}>{s.domain}</span>
                      <span className="text-[8px] text-cyber-green bg-cyber-green/10 border border-cyber-green/30 px-1 rounded shrink-0">
                        AUTH
                      </span>
                    </div>
                  ))}
                  {scopes.length === 0 && (
                    <div className="text-[10px] text-slate-500 text-center py-4 border border-dashed border-cyber-border/40 rounded">
                      Define validation boundary
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Autonomous Engines deck */}
            <div className="space-y-3 border-t border-cyber-border/20 pt-4">
              <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                Validation Control Deck
              </label>
              
              <div className="space-y-2">
                <button
                  onClick={handleRunRecon}
                  disabled={loadingAction !== null || scopes.length === 0}
                  className="w-full bg-[#02050f] border border-cyber-blue/30 hover:border-cyber-blue/60 text-cyber-blue hover:text-white disabled:opacity-40 disabled:border-slate-800 disabled:text-slate-600 text-[10px] font-mono py-2 rounded flex items-center justify-center gap-2 cursor-pointer transition-all tracking-wider uppercase"
                >
                  <Cpu className="w-3.5 h-3.5 animate-pulse" />
                  {loadingAction === 'recon' ? 'Recon Running...' : 'Init Discovery Worker'}
                </button>

                <button
                  onClick={handleRunIdor}
                  disabled={loadingAction !== null}
                  className="w-full bg-[#02050f] border border-cyber-purple/30 hover:border-cyber-purple/60 text-cyber-purple hover:text-white disabled:opacity-40 disabled:border-slate-800 disabled:text-slate-600 text-[10px] font-mono py-2 rounded flex items-center justify-center gap-2 cursor-pointer transition-all tracking-wider uppercase"
                >
                  <Activity className="w-3.5 h-3.5" />
                  {loadingAction === 'idor' ? 'Testing Logic...' : 'Validate IDOR Flaws'}
                </button>
              </div>
            </div>

            {/* Active scan progress indicator */}
            {scanType && (
              <div className="p-3 bg-cyber-sec/20 border border-cyber-border/60 rounded-lg space-y-2 animate-pulse">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-400 font-bold">
                    {scanType === 'recon' ? 'DISCOVERY PIPELINE' : 'LOGIC TESTING'}
                  </span>
                  <span className={scanType === 'recon' ? 'text-cyber-blue' : 'text-cyber-purple'}>
                    {Math.round(scanProgress)}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                  <div 
                    className={`h-full transition-all duration-100 ${
                      scanType === 'recon' ? 'bg-cyber-blue' : 'bg-cyber-purple'
                    }`}
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
                <p className="text-[8px] font-mono text-slate-500">
                  {scanType === 'recon' ? 'Parsing JavaScript bundle elements...' : 'Validating token authorization states...'}
                </p>
              </div>
            )}

          </div>

          {/* Sidebar Status Footer */}
          <div className="border-t border-cyber-border/20 pt-4 space-y-2 font-mono text-[9px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">API LATENCY:</span>
              <span className="text-cyber-green font-bold">{apiLatency}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">ENGINE STATUS:</span>
              <span className="text-cyber-blue flex items-center gap-1 font-bold">
                <Wifi className="w-2.5 h-2.5" /> ONLINE
              </span>
            </div>
          </div>
        </aside>

        {/* Middle & Right Dashboard Panels Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 z-10">
          
          {/* Top Metric Cards (6-Column Grid) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            {[
              {
                title: "Total Assets",
                value: totalAssetsCount,
                trend: "+12%",
                isUp: true,
                color: "border-cyber-blue/30 shadow-[0_0_10px_rgba(0,217,255,0.02)]",
                textColor: "text-cyber-blue",
                sparkType: "assets",
                desc: "DISCOVERED NODES"
              },
              {
                title: "Active Threats",
                value: activeThreatsCount,
                trend: activeThreatsCount > 0 ? "+3%" : "-100%",
                isUp: activeThreatsCount > 0,
                color: "border-cyber-red/30 shadow-[0_0_10px_rgba(255,59,92,0.02)]",
                textColor: "text-cyber-red",
                sparkType: "threats",
                desc: "UNRESOLVED RISKS"
              },
              {
                title: "Critical Vulns",
                value: criticalVulnsCount,
                trend: criticalVulnsCount > 0 ? "+8%" : "-100%",
                isUp: criticalVulnsCount > 0,
                color: "border-cyber-orange/30 shadow-[0_0_10px_rgba(255,176,32,0.02)]",
                textColor: "text-cyber-orange",
                sparkType: "critical",
                desc: "CVSS RATINGS >= 9.0"
              },
              {
                title: "Attack Paths",
                value: attackPathsCount,
                trend: attackPathsCount > 0 ? "+15%" : "-100%",
                isUp: attackPathsCount > 0,
                color: "border-cyber-purple/30 shadow-[0_0_10px_rgba(139,92,246,0.02)]",
                textColor: "text-cyber-purple",
                sparkType: "paths",
                desc: "EXPLOIT CHAINS"
              },
              {
                title: "AI Confidence",
                value: `${aiConfidenceScore}%`,
                trend: "STABLE",
                isUp: true,
                color: "border-cyber-green/30 shadow-[0_0_10px_rgba(0,255,157,0.02)]",
                textColor: "text-cyber-green",
                sparkType: "confidence",
                desc: "HEALING ACCURACY"
              },
              {
                title: "Exposure Score",
                value: `${exposureScore} / 100`,
                trend: exposureScore > 40 ? "HIGH" : "SAFE",
                isUp: exposureScore > 40,
                color: "border-cyber-blue/30 shadow-[0_0_10px_rgba(0,217,255,0.02)]",
                textColor: "text-cyber-blue",
                sparkType: "exposure",
                desc: "THREAT INTENSITY"
              }
            ].map((card, idx) => (
              <div 
                key={idx} 
                className={`glass-panel border ${card.color} p-4 rounded-xl relative overflow-hidden group hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300`}
              >
                {/* Micro reflection lines */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.02] to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] font-mono text-slate-500 tracking-wider block mb-1">
                      {card.desc}
                    </span>
                    <h3 className="text-[10px] font-mono font-bold text-slate-400">{card.title}</h3>
                  </div>
                  <span className={`text-[9px] font-mono font-bold flex items-center gap-0.5 ${
                    card.isUp ? 'text-cyber-blue' : 'text-cyber-green'
                  }`}>
                    {card.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {card.trend}
                  </span>
                </div>

                <div className="mt-3 flex items-end justify-between">
                  <span className={`text-xl font-display font-bold ${card.textColor}`}>{card.value}</span>
                  
                  {/* Custom Trend Sparkline */}
                  <div className="w-16 h-8 opacity-65 group-hover:opacity-90 transition-opacity">
                    <svg className={`w-full h-full ${card.textColor}`} viewBox="0 0 100 30" fill="none">
                      <path 
                        d={getSparklinePath(card.sparkType)} 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}

          </div>

          {/* SOC Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Center Content Section (8-columns) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Topology Map Graph */}
              <div className="glass-panel border border-cyber-border/40 rounded-xl p-5 flex flex-col h-[520px]">
                <div className="flex justify-between items-center mb-4 border-b border-cyber-border/20 pb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <Box className="w-5 h-5 text-cyber-blue animate-pulse" />
                    <h3 className="text-sm font-display font-bold uppercase tracking-wider text-white">
                      Attack Pathway Topology Network Map
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[9px] font-mono text-cyber-blue border border-cyber-blue/30 bg-cyber-blue/10 px-2 py-0.5 rounded">
                      REACT FLOW CANVAS
                    </span>
                    <span className="text-[9px] font-mono text-cyber-purple border border-cyber-purple/30 bg-cyber-purple/10 px-2 py-0.5 rounded">
                      DRAGGABLE & ZOOMABLE
                    </span>
                  </div>
                </div>
                
                {/* React Flow Render Graph */}
                <div className="flex-1 min-h-[300px] rounded-lg border border-slate-900 overflow-hidden relative bg-[#040612]/50">
                  <ThreatFlowGraph assets={assets} vulnerabilities={vulnerabilities} identities={identities} />
                </div>
              </div>

              {/* Remediation Control Console */}
              <div className="glass-panel border border-cyber-border/40 rounded-xl">
                <RemediationDashboard vulnerabilities={vulnerabilities} onMitigatedChange={handleMitigationChange} />
              </div>

              {/* Vulnerabilities Table Grid */}
              <div className="glass-panel border border-cyber-border/40 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-cyber-border/20 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-cyber-orange" />
                    <h3 className="text-sm font-display font-bold uppercase tracking-wider text-white">
                      Identified Vulnerability Grid
                    </h3>
                  </div>
                  
                  {/* Severity Filters */}
                  <div className="flex items-center gap-1.5 bg-[#02050f] border border-cyber-border/80 p-1 rounded-md shrink-0">
                    {["All", "Critical", "High", "Medium", "Low"].map((sev) => (
                      <button
                        key={sev}
                        onClick={() => setSeverityFilter(sev)}
                        className={`px-2.5 py-1 text-[9px] font-mono rounded cursor-pointer transition-all ${
                          severityFilter === sev
                            ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30 font-bold'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {sev.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-[10px] text-left border-collapse">
                    <thead>
                      <tr className="border-b border-cyber-border/40 text-slate-500 uppercase tracking-widest text-[9px]">
                        <th className="py-2.5 px-3">Severity</th>
                        <th className="py-2.5 px-3">Vulnerability / Details</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Attack Vector Code</th>
                        <th className="py-2.5 px-3 text-right">Verification Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cyber-border/20">
                      {filteredVulnerabilities.map((vuln) => {
                        const isCrit = vuln.severity === 'Critical';
                        const isMit = activeMitigatedIds.includes(vuln.id);
                        return (
                          <tr 
                            key={vuln.id} 
                            className="hover:bg-slate-900/30 transition-colors"
                          >
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                                isCrit 
                                  ? 'bg-cyber-red/10 text-cyber-red border border-cyber-red/30' 
                                  : vuln.severity === 'High'
                                  ? 'bg-cyber-orange/10 text-cyber-orange border border-cyber-orange/30'
                                  : 'bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/30'
                              }`}>
                                {vuln.severity.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-200">{vuln.title}</div>
                              <div className="text-slate-400 text-[9px] line-clamp-1 mt-0.5">{vuln.description}</div>
                            </td>
                            <td className="py-3 px-3">
                              <code className="text-cyber-blue">{vuln.type}</code>
                            </td>
                            <td className="py-3 px-3 max-w-[120px] truncate text-slate-500">
                              {vuln.context}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {isMit ? (
                                <span className="text-cyber-green font-bold inline-flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5" /> SECURE
                                </span>
                              ) : (
                                <span className="text-cyber-red font-bold animate-pulse inline-flex items-center gap-1">
                                  <Flame className="w-3.5 h-3.5" /> ACTIVE EXPOSURE
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {filteredVulnerabilities.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500">
                            No validation threats matching query parameters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Console Logs Terminal */}
              <div className="glass-panel border border-cyber-border/40 rounded-xl">
                <TerminalLogs backendLogs={backendDerivedLogs} />
              </div>

            </div>

            {/* Right Information Panel (4-columns) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Security Posture circular gauge */}
              <div className="glass-panel border border-cyber-border/40 rounded-xl p-5 text-center flex flex-col items-center justify-center">
                <h4 className="text-xs font-display font-bold uppercase tracking-wider text-white mb-4 border-b border-cyber-border/20 pb-2 w-full">
                  Platform Security Posture Index
                </h4>
                
                {/* SVG circular progress */}
                <div className="relative w-40 h-40 flex items-center justify-center my-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    {/* Background Circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      className="stroke-[#0b1226]"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    {/* Glowing Accent Circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      className="stroke-cyber-blue/10"
                      strokeWidth="12"
                      fill="transparent"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      className="stroke-cyber-blue transition-all duration-1000 ease-out"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 50}
                      strokeDashoffset={2 * Math.PI * 50 - ((100 - exposureScore) / 100) * (2 * Math.PI * 50)}
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Inside metrics */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                    <span className="text-3xl font-display font-bold text-white leading-none">
                      {100 - exposureScore}%
                    </span>
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">
                      HYGIENE INDEX
                    </span>
                    <span className={`text-[9px] font-bold mt-1 px-1.5 py-0.2 rounded ${
                      (100 - exposureScore) > 75 
                        ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/20' 
                        : (100 - exposureScore) > 50
                        ? 'bg-cyber-orange/10 text-cyber-orange border border-cyber-orange/20'
                        : 'bg-cyber-red/10 text-cyber-red border border-cyber-red/20'
                    }`}>
                      {(100 - exposureScore) > 75 ? 'SECURE' : (100 - exposureScore) > 50 ? 'WARNING' : 'COMPROMISED'}
                    </span>
                  </div>
                </div>
                
                {/* Secondary breakdown stats */}
                <div className="grid grid-cols-2 gap-4 w-full mt-4 font-mono text-[10px]">
                  <div className="bg-[#02050f]/80 p-2.5 rounded border border-cyber-border/40">
                    <span className="text-slate-500 uppercase block text-[8px]">Exposure Factor</span>
                    <span className="text-cyber-purple font-bold text-xs">{exposureScore}%</span>
                  </div>
                  <div className="bg-[#02050f]/80 p-2.5 rounded border border-cyber-border/40">
                    <span className="text-slate-500 uppercase block text-[8px]">Validator State</span>
                    <span className="text-cyber-blue font-bold text-xs">SYNCHRONIZED</span>
                  </div>
                </div>
              </div>

              {/* Threat severity breakdown heatmap */}
              <div className="glass-panel border border-cyber-border/40 rounded-xl p-5">
                <h4 className="text-xs font-display font-bold uppercase tracking-wider text-white mb-4 border-b border-cyber-border/20 pb-2 flex items-center justify-between">
                  <span>Risk Category Distribution</span>
                  <Flame className="w-3.5 h-3.5 text-cyber-red" />
                </h4>
                
                <div className="space-y-3 font-mono text-[10px]">
                  {[
                    { label: "Critical Risk Vectors", count: vulnerabilities.filter(v => v.severity === 'Critical' && !activeMitigatedIds.includes(v.id)).length, color: "bg-cyber-red" },
                    { label: "High Risk Vectors", count: vulnerabilities.filter(v => v.severity === 'High' && !activeMitigatedIds.includes(v.id)).length, color: "bg-cyber-orange" },
                    { label: "Medium Risks", count: vulnerabilities.filter(v => v.severity === 'Medium' && !activeMitigatedIds.includes(v.id)).length, color: "bg-cyber-purple" },
                    { label: "Low Threats", count: vulnerabilities.filter(v => (v.severity === 'Low' || v.severity === 'Info') && !activeMitigatedIds.includes(v.id)).length, color: "bg-cyber-blue" },
                  ].map((row, idx) => {
                    const total = vulnerabilities.filter(v => !activeMitigatedIds.includes(v.id)).length || 1;
                    const pct = Math.round((row.count / total) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="text-slate-400">{row.label}</span>
                          <span className="text-slate-300 font-bold">{row.count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#030611] rounded overflow-hidden border border-slate-900">
                          <div 
                            className={`h-full ${row.color} rounded`}
                            style={{ width: `${row.count > 0 ? pct : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Threat Intelligence Alert feed */}
              <div className="glass-panel border border-cyber-border/40 rounded-xl p-5 flex flex-col h-[320px]">
                <h4 className="text-xs font-display font-bold uppercase tracking-wider text-white mb-3 border-b border-cyber-border/20 pb-2 flex items-center justify-between">
                  <span>Live Threat Intelligence Feed</span>
                  <Activity className="w-3.5 h-3.5 text-cyber-blue animate-pulse" />
                </h4>
                
                <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[9px] pr-1">
                  
                  {/* Dynamic system logs feed */}
                  {systemLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2 text-slate-300 border-l border-cyber-blue/30 pl-2 py-0.5">
                      <span className="text-slate-500 select-none">SYSTEM:</span>
                      <p className="flex-1 break-all">{log}</p>
                    </div>
                  ))}

                  {/* Base Mock Feed items */}
                  <div className="flex gap-2 text-slate-400 border-l border-cyber-purple/30 pl-2 py-0.5">
                    <span className="text-slate-600 select-none">INTELLIGENCE:</span>
                    <p className="flex-1">Parsed CVE-2026-30112 signature rules. Middleware compilation successfully cached.</p>
                  </div>
                  <div className="flex gap-2 text-slate-400 border-l border-cyber-purple/30 pl-2 py-0.5">
                    <span className="text-slate-600 select-none">INTELLIGENCE:</span>
                    <p className="flex-1">S3 Bucket Access Control Rules downloaded from AWS IAM metadata mapping.</p>
                  </div>
                  <div className="flex gap-2 text-slate-400 border-l border-slate-700 pl-2 py-0.5">
                    <span className="text-slate-600 select-none">DAEMON:</span>
                    <p className="flex-1">Cron scheduler successfully verified all active staging subdomains.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

      {/* Floating Interactive AI Assistant Chatbot */}
      <AIChatWidget />
    </div>
  );
}
