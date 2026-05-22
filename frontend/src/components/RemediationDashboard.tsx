"use client";

import { useState } from 'react';
import { Sparkles, Terminal, Code, GitPullRequest, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';

export default function RemediationDashboard({ vulnerabilities }: { vulnerabilities: any[] }) {
  const [selectedVulnId, setSelectedVulnId] = useState(vulnerabilities[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'Code' | 'PR'>('Code');
  const [loading, setLoading] = useState(false);

  const selectedVuln = vulnerabilities.find(v => v.id === selectedVulnId) || vulnerabilities[0];
  
  // Note: The FastAPI /api/state already includes remediations inside the vulnerability object
  const currentRemediation = selectedVuln?.remediations?.[0];

  const handleGenerateAI = async () => {
    if (!selectedVuln) return;
    setLoading(true);
    
    try {
      const res = await fetch("http://localhost:8000/api/remediate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vulnerabilityId: selectedVuln.id }),
      });
      // A full refresh will fetch the new remediation data
      if (res.ok) {
        window.location.reload(); 
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-sky-400" />
        <h3 className="text-sm font-mono font-bold text-white">AI Mitigation & Self-Healing Shield</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Vulnerability List */}
        <div className="lg:col-span-5 space-y-4">
          <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Select Active Vulnerability Report
          </label>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2">
            {vulnerabilities.map(vuln => (
              <div
                key={vuln.id}
                onClick={() => setSelectedVulnId(vuln.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedVulnId === vuln.id
                    ? 'bg-sky-950/20 border-sky-500 shadow-md ring-1 ring-sky-950/40'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{vuln.title}</h4>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0 ${
                    vuln.severity === 'Critical' ? 'bg-rose-950/50 text-red-400 border border-red-900/45' : 'bg-amber-950/50 text-amber-400 border border-amber-900/40'
                  }`}>
                    {vuln.severity}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 line-clamp-2">{vuln.description}</p>
              </div>
            ))}
            
            {vulnerabilities.length === 0 && (
              <div className="text-xs text-slate-500 text-center py-4 border border-dashed border-slate-800 rounded">
                No vulnerabilities discovered yet.
              </div>
            )}
          </div>

          <button
            onClick={handleGenerateAI}
            disabled={loading || !selectedVuln}
            className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs py-2 px-4 rounded transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing...</>
            ) : (
              <><Sparkles className="w-4 h-4 animate-pulse" /> Synthesize AI Patch</>
            )}
          </button>
        </div>

        {/* Right Column: Code & PR View */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex border-b border-slate-800 pb-2 mb-4 justify-between items-center">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('Code')}
                className={`text-xs font-mono font-semibold pb-2 relative transition-all ${
                  activeTab === 'Code' ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Code className="w-3.5 h-3.5 inline mr-1" /> Fix Patch
                {activeTab === 'Code' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-sky-500"></div>}
              </button>
              <button
                onClick={() => setActiveTab('PR')}
                className={`text-xs font-mono font-semibold pb-2 relative transition-all ${
                  activeTab === 'PR' ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <GitPullRequest className="w-3.5 h-3.5 inline mr-1" /> Pull Request
                {activeTab === 'PR' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-sky-500"></div>}
              </button>
            </div>

            {currentRemediation ? (
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Mitigation Cached
              </span>
            ) : (
              <span className="text-[10px] text-rose-400 font-mono flex items-center gap-1 bg-rose-950/20 px-2 py-0.5 rounded border border-rose-900/30">
                <AlertTriangle className="w-3.5 h-3.5" /> Untreated
              </span>
            )}
          </div>

          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 overflow-y-auto max-h-[300px]">
            {currentRemediation ? (
              activeTab === 'Code' ? (
                <pre className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                  <code>{currentRemediation.snippet}</code>
                </pre>
              ) : (
                <div className="text-xs font-mono text-slate-300 whitespace-pre-line leading-relaxed">
                  {currentRemediation.prBody}
                </div>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                <Terminal className="w-8 h-8 mb-2" />
                <p className="text-xs font-mono">No Mitigation Patch Available</p>
                <p className="text-[10px] mt-1">Select an exposure and press synthesize.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
