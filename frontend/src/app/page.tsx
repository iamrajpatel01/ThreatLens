"use client";

import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { ShieldAlert, Crosshair, Cpu, Box, Database, Radar, Activity } from "lucide-react";
import RemediationDashboard from "@/components/RemediationDashboard";

// Dynamic import for force-graph as it requires browser canvas
const ThreatForceGraph = dynamic(() => import('@/components/ThreatForceGraph'), { ssr: false });

export default function Home() {
  const [scopes, setScopes] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  
  const [identities, setIdentities] = useState<any[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  const [newScope, setNewScope] = useState("");

  const fetchState = () => {
    fetch("http://localhost:8000/api/state")
      .then((res) => res.json())
      .then((data) => {
        setAssets(data.assets || []);
        setVulnerabilities(data.vulnerabilities || []);
        setIdentities(data.identities || []);
      })
      .catch((err) => console.error("Failed to fetch state:", err));
  };

  // Fetch initial state
  useEffect(() => {
    fetchState();
  }, []);

  const handleAddScope = async () => {
    if (!newScope.trim()) return;
    
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
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunRecon = async () => {
    if (scopes.length === 0) return alert("Please add a boundary scope first.");
    setLoadingAction('recon');
    try {
      await fetch("http://localhost:8000/api/scan/recon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scopeId: scopes[0].id }),
      });
      fetchState();
    } catch(e) {}
    setLoadingAction(null);
  };

  const handleRunIdor = async () => {
    setLoadingAction('idor');
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
    } catch(e) {}
    setLoadingAction(null);
  };

  return (
    <main className="p-8 max-w-[1600px] mx-auto min-h-screen flex flex-col gap-8">
      {/* Header */}
      <header className="border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3">
          <Radar className="w-8 h-8 text-sky-400" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">ThreatLens Platform</h1>
            <p className="text-sm font-mono text-slate-400">Autonomous Security Validation Engine v2.0</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Controls */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Scopes Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-mono font-bold text-sky-400 mb-4 flex items-center gap-2">
              <Crosshair className="w-4 h-4" /> Validated Boundary Scopes
            </h3>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="e.g. corporate-cloud.io"
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                value={newScope}
                onChange={(e) => setNewScope(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddScope()}
              />
              <button 
                onClick={handleAddScope}
                className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-2 rounded text-xs font-bold"
              >
                Add
              </button>
            </div>
            
            <div className="space-y-2">
              {scopes.map((s, i) => (
                <div key={i} className="px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs font-mono flex justify-between items-center">
                  <span>{s.domain}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded">Authorized</span>
                </div>
              ))}
              {scopes.length === 0 && (
                <div className="text-xs text-slate-500 text-center py-4 border border-dashed border-slate-800 rounded">
                  No scopes defined. Add a domain to begin.
                </div>
              )}
            </div>
          </div>
          
          {/* Intelligence Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-mono font-bold text-sky-400 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4" /> Knowledge Graph Metrics
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                <p className="text-2xl font-bold text-white">{assets.length}</p>
                <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase">Assets</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                <p className="text-2xl font-bold text-violet-400">{identities.length}</p>
                <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase">Identities</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                <p className="text-2xl font-bold text-rose-400">{vulnerabilities.length}</p>
                <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase">Exposures</p>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <button 
                onClick={handleRunRecon}
                disabled={loadingAction !== null}
                className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-mono text-[10px] py-2 rounded transition-colors flex items-center justify-center gap-2 border border-slate-700 uppercase tracking-wider"
              >
                <Cpu className="w-3 h-3" /> {loadingAction === 'recon' ? 'Recon Running...' : 'Init Deep Discovery Worker'}
              </button>
              <button 
                onClick={handleRunIdor}
                disabled={loadingAction !== null}
                className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-mono text-[10px] py-2 rounded transition-colors flex items-center justify-center gap-2 border border-slate-700 uppercase tracking-wider"
              >
                <Activity className="w-3 h-3" /> {loadingAction === 'idor' ? 'Testing...' : 'Execute IDOR Logic Test'}
              </button>
            </div>
          </div>
          
        </div>

        {/* Right Column - Threat Map & Remediation */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex-1 min-h-[450px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-mono font-bold text-sky-400 flex items-center gap-2">
                <Box className="w-4 h-4" /> Topology & Attack Path Visualizer
              </h3>
            </div>
            
            <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-400 via-slate-950 to-slate-950 pointer-events-none"></div>
               <ThreatForceGraph assets={assets} vulnerabilities={vulnerabilities} identities={identities} />
            </div>
          </div>

          <RemediationDashboard vulnerabilities={vulnerabilities} />
          
        </div>
      </div>
    </main>
  );
}
