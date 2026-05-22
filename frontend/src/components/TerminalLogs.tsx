"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, RefreshCw } from 'lucide-react';

interface LogItem {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export default function TerminalLogs({ backendLogs }: { backendLogs: any[] }) {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Map and load initial backend logs
  useEffect(() => {
    const formattedLogs: LogItem[] = backendLogs.map(bl => ({
      timestamp: bl.timestamp || new Date().toISOString(),
      level: bl.level || 'info',
      message: bl.message
    }));
    setLogs(formattedLogs);
  }, [backendLogs]);

  // Stream simulated system logs in real-time
  useEffect(() => {
    const simulatedPhrases = [
      { level: 'info' as const, msg: 'Active validation scans verified 3 attack pathways to bucket records storage.' },
      { level: 'info' as const, msg: 'Evaluating JWT signature algorithm on auth endpoint...' },
      { level: 'success' as const, msg: 'Authentication token verified against tenant rules.' },
      { level: 'info' as const, msg: 'Scanning static script compilation bundles for secrets...' },
      { level: 'warn' as const, msg: 'Potential API key leakage found in Webpack build artifacts!' },
      { level: 'info' as const, msg: 'Intercepting payload structure from /api/v1/user/profile...' },
      { level: 'success' as const, msg: 'IDOR Shield validation middleware matches target request owners.' },
      { level: 'info' as const, msg: 'Deduplicating vulnerability instances using Knowledge Graph heuristics.' },
      { level: 'info' as const, msg: 'Resolving subdomains from target scope...' },
      { level: 'info' as const, msg: 'Port scan completed on 159.203.41.92. Open ports: 80, 443.' },
      { level: 'error' as const, msg: 'CRITICAL ACCESS VIOLATION: Exposed S3 bucket accepts anonymous REST requests.' }
    ];

    const interval = setInterval(() => {
      const randomItem = simulatedPhrases[Math.floor(Math.random() * simulatedPhrases.length)];
      const newLog: LogItem = {
        timestamp: new Date().toISOString(),
        level: randomItem.level,
        message: randomItem.msg
      };
      
      setLogs(prev => {
        // Keep logs capped at 100 entries to prevent memory leak
        const updated = [newLog, ...prev];
        if (updated.length > 100) {
          updated.pop();
        }
        return updated;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Auto scroll terminal to top when new logs arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [logs]);

  return (
    <div className="glass-panel border border-cyber-border/40 rounded-xl p-5 flex flex-col h-[280px]">
      <div className="flex justify-between items-center border-b border-cyber-border/20 pb-3 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyber-blue animate-pulse" />
          <h3 className="text-sm font-display font-bold uppercase tracking-wider text-white">
            Real-Time Validation Terminal Logs
          </h3>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-cyber-green">
            <span className="w-2 h-2 bg-cyber-green rounded-full animate-ping"></span>
            STREAMING
          </span>
          <button 
            onClick={() => setLogs([])}
            className="text-slate-500 hover:text-cyber-blue cursor-pointer"
          >
            CLEAR
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 bg-[#02040a] border border-cyber-border/30 rounded p-3 font-mono text-[10px] overflow-y-auto space-y-1.5 selection:bg-cyber-blue/30 selection:text-white"
      >
        {logs.map((log, idx) => {
          let lvlColor = 'text-cyber-blue';
          let label = '[INFO]';
          if (log.level === 'warn') {
            lvlColor = 'text-cyber-orange';
            label = '[WARN]';
          } else if (log.level === 'error') {
            lvlColor = 'text-cyber-red font-bold';
            label = '[CRIT]';
          } else if (log.level === 'success') {
            lvlColor = 'text-cyber-green';
            label = '[PASS]';
          }

          return (
            <div key={idx} className="flex gap-3 hover:bg-slate-900/40 py-0.5 px-1 rounded transition-colors duration-150">
              <span className="text-slate-600 select-none">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={`${lvlColor} font-bold select-none shrink-0`}>{label}</span>
              <span className="text-slate-300 break-all">{log.message}</span>
            </div>
          );
        })}
        {logs.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-500">
            No logs currently active. Waiting for scanner initialization.
          </div>
        )}
      </div>
    </div>
  );
}
