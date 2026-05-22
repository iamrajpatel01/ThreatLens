"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Network, ZoomIn } from 'lucide-react';

export default function ThreatForceGraph({ assets, vulnerabilities, identities }: { assets: any[], vulnerabilities: any[], identities: any[] }) {
  const fgRef = useRef<any>();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  // Map Knowledge Graph to Force Graph Data
  useEffect(() => {
    const nodes: any[] = [];
    const links: any[] = [];

    // Add Assets
    assets.forEach(a => {
      nodes.push({ id: a.id, name: a.name, group: 'Asset', val: 5 });
      
      // If we have M:N Asset linking (e.g. Subdomain -> IP)
      if (a.linkedTo && Array.isArray(a.linkedTo)) {
          a.linkedTo.forEach((targetAsset: any) => {
              links.push({ source: a.id, target: targetAsset.id });
          });
      }
    });

    // Add Identities
    identities.forEach(i => {
      nodes.push({ id: i.id, name: i.role || i.source, group: 'Identity', val: 3 });
    });

    // Add Vulnerabilities & Attack Paths
    vulnerabilities.forEach(v => {
      nodes.push({ id: v.id, name: v.title, group: 'Vulnerability', val: 6 });
      
      // Link the vulnerability to all its connected assets
      if (v.assets && Array.isArray(v.assets)) {
        v.assets.forEach((asset: any) => {
          links.push({ source: asset.id, target: v.id });
        });
      }

      // Attack path sequences
      try {
        const sequence = JSON.parse(v.attackPathSequence);
        if (Array.isArray(sequence)) {
          for (let i = 0; i < sequence.length - 1; i++) {
             // Only push link if both source and target exist in nodes array to prevent crashes
             const sourceExists = nodes.some(n => n.id === sequence[i]);
             const targetExists = nodes.some(n => n.id === sequence[i+1]);
             if (sourceExists && targetExists) {
                links.push({ source: sequence[i], target: sequence[i+1], isAttackPath: true });
             }
          }
        }
      } catch(e) {}
    });

    setGraphData({ nodes, links });
  }, [assets, vulnerabilities, identities]);

  const nodeColor = useCallback((node: any) => {
    switch (node.group) {
      case 'Asset': return '#38bdf8'; // sky-400
      case 'Identity': return '#a78bfa'; // violet-400
      case 'Vulnerability': return '#fb7185'; // rose-400
      default: return '#94a3b8'; // slate-400
    }
  }, []);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {graphData.nodes.length > 0 ? (
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeLabel="name"
          nodeColor={nodeColor}
          backgroundColor="#020617" // slate-950
          linkColor={(link: any) => link.isAttackPath ? '#fb7185' : '#334155'}
          linkDirectionalArrowLength={(link: any) => link.isAttackPath ? 3.5 : 0}
          linkDirectionalArrowRelPos={1}
          linkWidth={(link: any) => link.isAttackPath ? 2 : 1}
          onNodeClick={(node: any) => {
            // Center node on click
            fgRef.current.centerAt(node.x, node.y, 1000);
            fgRef.current.zoom(3, 2000);
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-slate-500 font-mono text-xs z-10 flex items-center gap-2">
            <Network className="w-4 h-4" /> Graph empty. Run Discovery.
          </p>
        </div>
      )}
      <div className="absolute bottom-4 right-4 flex gap-4 bg-slate-900/80 p-3 rounded-lg border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-sky-400"></div>
          <span className="text-[10px] font-mono text-slate-300 uppercase">Asset</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-violet-400"></div>
          <span className="text-[10px] font-mono text-slate-300 uppercase">Identity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-400"></div>
          <span className="text-[10px] font-mono text-slate-300 uppercase">Vulnerability</span>
        </div>
      </div>
    </div>
  );
}
