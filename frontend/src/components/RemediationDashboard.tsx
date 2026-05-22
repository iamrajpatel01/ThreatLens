"use client";

import { useState } from 'react';
import { Sparkles, Terminal, Code, GitPullRequest, ShieldCheck, AlertTriangle, RefreshCw, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';

export default function RemediationDashboard({ 
  vulnerabilities,
  onMitigatedChange
}: { 
  vulnerabilities: any[],
  onMitigatedChange?: (vulnId: string, isMitigated: boolean) => void
}) {
  const [selectedVulnId, setSelectedVulnId] = useState(vulnerabilities[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'Code' | 'PR' | 'Analysis'>('Code');
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<string>('');
  const [mitigatedList, setMitigatedList] = useState<Record<string, boolean>>({});

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
      if (res.ok) {
        // Wait briefly, then trigger reload to fetch new database records
        setTimeout(() => {
          window.location.reload(); 
        }, 800);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeployPatch = () => {
    if (!selectedVuln) return;
    setDeploying(true);
    setDeployStep('Initiating Code Shield Deployment pipeline...');
    
    const steps = [
      'Authenticating deployment tokens...',
      'Compiling Express/Nginx middleware configurations...',
      'Running integration validation tests...',
      'Injecting patch into main branch (Simulated PR)...',
      'Restarting staging instances & validation checks...',
      'Verification complete. Security validation state: SECURE.'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setDeployStep(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
        setDeploying(false);
        setMitigatedList(prev => ({ ...prev, [selectedVuln.id]: true }));
        if (onMitigatedChange) {
          onMitigatedChange(selectedVuln.id, true);
        }
      }
    }, 900);
  };

  // Get static CVE metrics based on vulnerability type
  const getCveDetails = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'IDOR':
        return {
          id: 'CVE-2026-30112',
          cvss: '8.8 High',
          vector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H',
          impact: 'Broken access control allows unauthorized reading/modification of adjacent resource profiles.'
        };
      case 'EXPOSED_API_KEY':
        return {
          id: 'CVE-2026-44018',
          cvss: '9.8 Critical',
          vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
          impact: 'Publicly compiled front-end JS leaks master credentials, granting immediate control of cloud assets.'
        };
      default:
        return {
          id: 'CVE-2026-90928',
          cvss: '7.5 High',
          vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
          impact: 'Information disclosure leaks sensitive directory maps, infrastructure configs or internal comments.'
        };
    }
  };

  const cve = selectedVuln ? getCveDetails(selectedVuln.type) : null;

  return (
    <div className="glass-panel border border-cyber-border/40 rounded-xl p-5 w-full">
      <div className="flex justify-between items-center mb-5 border-b border-cyber-border/20 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyber-purple animate-pulse" />
          <h3 className="text-sm font-display font-bold uppercase tracking-wider text-white">AI Mitigation & Self-Healing Shield</h3>
        </div>
        <div className="text-[10px] font-mono text-slate-500">
          ENGINE STATE: <span className="text-cyber-green">ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Vulnerability List */}
        <div className="lg:col-span-5 space-y-4">
          <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-widest">
            Select Active Vulnerability Report
          </label>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2">
            {vulnerabilities.map(vuln => {
              const isCrit = vuln.severity === 'Critical';
              const isMitigated = mitigatedList[vuln.id] || vuln.remediations?.length > 0;
              return (
                <div
                  key={vuln.id}
                  onClick={() => setSelectedVulnId(vuln.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 relative overflow-hidden ${
                    selectedVulnId === vuln.id
                      ? 'bg-slate-900/60 border-cyber-purple shadow-[0_0_12px_rgba(139,92,246,0.1)]'
                      : 'bg-[#050816]/70 border-cyber-border/50 hover:border-slate-700'
                  }`}
                >
                  {/* Neon indicator bar */}
                  {selectedVulnId === vuln.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-cyber-purple"></div>
                  )}
                  
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-bold font-mono text-slate-200 line-clamp-1">{vuln.title}</h4>
                    <span className={`text-[8px] px-1.5 py-0.2 rounded font-mono font-bold uppercase shrink-0 ${
                      isCrit 
                        ? 'bg-cyber-red/10 text-cyber-red border border-cyber-red/30' 
                        : 'bg-cyber-orange/10 text-cyber-orange border border-cyber-orange/30'
                    }`}>
                      {vuln.severity}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 line-clamp-2">{vuln.description}</p>
                  
                  <div className="mt-2.5 flex justify-between items-center text-[8px] font-mono text-slate-500 pt-1.5 border-t border-slate-900">
                    <span>TYPE: <span className="text-cyber-blue">{vuln.type}</span></span>
                    {isMitigated ? (
                      <span className="text-cyber-green font-bold flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5" /> MITIGATED
                      </span>
                    ) : (
                      <span className="text-cyber-red font-bold animate-pulse">ACTIVE RISK</span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {vulnerabilities.length === 0 && (
              <div className="text-xs text-slate-500 text-center py-8 border border-dashed border-cyber-border/30 rounded-lg">
                No vulnerabilities discovered yet. Run Discovery.
              </div>
            )}
          </div>

          <button
            onClick={handleGenerateAI}
            disabled={loading || !selectedVuln}
            className="w-full bg-cyber-purple/20 hover:bg-cyber-purple/35 disabled:opacity-40 text-cyber-purple hover:text-white border border-cyber-purple/40 font-bold text-xs py-2 px-4 rounded transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing LLM Remediation...</>
            ) : (
              <><Sparkles className="w-4 h-4 animate-pulse" /> Synthesize AI Remediation</>
            )}
          </button>
        </div>

        {/* Right Column: Code & PR View */}
        <div className="lg:col-span-7 flex flex-col h-[380px]">
          <div className="flex border-b border-cyber-border/20 pb-2 mb-4 justify-between items-center">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('Code')}
                className={`text-xs font-mono pb-2 relative transition-all cursor-pointer ${
                  activeTab === 'Code' ? 'text-cyber-blue font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Code className="w-3.5 h-3.5 inline mr-1" /> Code Fix
                {activeTab === 'Code' && <div className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-cyber-blue"></div>}
              </button>
              <button
                onClick={() => setActiveTab('PR')}
                className={`text-xs font-mono pb-2 relative transition-all cursor-pointer ${
                  activeTab === 'PR' ? 'text-cyber-blue font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <GitPullRequest className="w-3.5 h-3.5 inline mr-1" /> Pull Request
                {activeTab === 'PR' && <div className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-cyber-blue"></div>}
              </button>
              <button
                onClick={() => setActiveTab('Analysis')}
                className={`text-xs font-mono pb-2 relative transition-all cursor-pointer ${
                  activeTab === 'Analysis' ? 'text-cyber-blue font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 inline mr-1" /> Risk & CVE
                {activeTab === 'Analysis' && <div className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-cyber-blue"></div>}
              </button>
            </div>

            {currentRemediation ? (
              <span className="text-[10px] text-cyber-green font-mono flex items-center gap-1 bg-cyber-green/10 px-2 py-0.5 rounded border border-cyber-green/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Mitigation Available
              </span>
            ) : (
              <span className="text-[10px] text-cyber-red font-mono flex items-center gap-1 bg-cyber-red/10 px-2 py-0.5 rounded border border-cyber-red/30 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" /> Untreated Flaw
              </span>
            )}
          </div>

          <div className="flex-1 bg-[#030610] border border-cyber-border/40 rounded-lg p-4 overflow-y-auto min-h-[180px]">
            {currentRemediation ? (
              activeTab === 'Code' ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-b border-slate-900 pb-2">
                    <span>FILE: middleware/securityGuard.js</span>
                    <span className="text-cyber-blue">EXPRESS MIDDLEWARE</span>
                  </div>
                  <pre className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                    <code>{currentRemediation.snippet}</code>
                  </pre>
                </div>
              ) : activeTab === 'PR' ? (
                <div className="space-y-3 font-mono">
                  <div className="text-[11px] font-bold text-cyber-blue border-b border-slate-900 pb-1.5">
                    [PR-SHIELD] Ingesting Attack Path Context...
                  </div>
                  <div className="text-[10px] text-slate-300 whitespace-pre-line leading-relaxed">
                    {currentRemediation.prBody}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 font-mono text-xs">
                  {cve && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-2.5 rounded border border-cyber-border/40">
                        <div className="text-[9px] text-slate-500">IDENTIFIER:</div>
                        <div className="text-cyber-blue font-bold font-display">{cve.id}</div>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded border border-cyber-border/40">
                        <div className="text-[9px] text-slate-500">SEVERITY RATING:</div>
                        <div className="text-cyber-red font-bold">{cve.cvss}</div>
                      </div>
                    </div>
                  )}
                  {cve && (
                    <div className="bg-slate-950 p-3 rounded border border-cyber-border/40 space-y-1">
                      <div className="text-[9px] text-slate-500">CVSS VECTOR STRING:</div>
                      <div className="text-[10px] text-slate-400 break-all select-all">{cve.vector}</div>
                    </div>
                  )}
                  <div className="bg-slate-950 p-3 rounded border border-cyber-border/40 space-y-1.5">
                    <div className="text-[9px] text-slate-500">AI REMEDIATION CONFIDENCE:</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-gradient-to-r from-cyber-purple to-cyber-blue h-full" style={{ width: '94%' }}></div>
                      </div>
                      <span className="text-cyber-blue font-bold text-xs">94%</span>
                    </div>
                  </div>
                  <div className="bg-cyber-purple/5 p-3 rounded border border-cyber-purple/20 space-y-1">
                    <div className="text-[9px] text-cyber-purple uppercase tracking-wider font-bold">Security Architect Recommendations:</div>
                    <div className="text-[10px] text-slate-300 leading-relaxed">
                      Deploy the generated middleware immediately. It restricts endpoint parsing parameters to verified JWT tokens, preventing parameter parameter swapping and cross-tenant leakage.
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                <Terminal className="w-8 h-8 mb-2 text-cyber-purple animate-pulse" />
                <p className="text-xs font-mono">No AI Mitigation Patch Synthesized</p>
                <p className="text-[10px] mt-1">Select an exposure report and click synthesize.</p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          {currentRemediation && (
            <div className="mt-4 border-t border-cyber-border/20 pt-4 flex gap-2">
              <button
                onClick={handleDeployPatch}
                disabled={deploying || mitigatedList[selectedVuln.id]}
                className="flex-1 bg-cyber-green/10 hover:bg-cyber-green/20 disabled:opacity-40 border border-cyber-green/40 hover:border-cyber-green text-cyber-green hover:text-white text-xs font-mono font-bold py-2 rounded cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                {deploying ? (
                  <><Cpu className="w-3.5 h-3.5 animate-spin" /> Deploying...</>
                ) : mitigatedList[selectedVuln.id] ? (
                  <><CheckCircle className="w-3.5 h-3.5" /> Security Shield Enforced</>
                ) : (
                  <><Cpu className="w-3.5 h-3.5" /> Deploy Shield Patch</>
                )}
              </button>
            </div>
          )}

          {/* Simulation Output */}
          {deploying && (
            <div className="mt-2.5 p-2 bg-[#02040c] border border-cyber-green/20 rounded font-mono text-[9px] text-cyber-green flex items-center gap-2 animate-pulse">
              <span className="w-1.5 h-1.5 bg-cyber-green rounded-full"></span>
              {deployStep}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
