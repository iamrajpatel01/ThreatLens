"use client";

import React, { useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Server, User, AlertOctagon, Database, Globe, Key, ShieldAlert } from 'lucide-react';

// Custom Asset Node Component
const AssetNode = ({ data }: any) => {
  const getIcon = () => {
    switch (data.type?.toLowerCase()) {
      case 'database': return <Database className="w-5 h-5 text-cyber-blue" />;
      case 'domain': return <Globe className="w-5 h-5 text-cyber-blue" />;
      case 'cloudbucket':
      case 'cloud bucket': return <Database className="w-5 h-5 text-cyber-orange" />;
      default: return <Server className="w-5 h-5 text-cyber-blue" />;
    }
  };

  return (
    <div className="px-4 py-3 rounded-lg glass-panel-glow-blue border border-cyber-blue/30 text-white min-w-[180px] hover:border-cyber-blue/70 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded bg-cyber-blue/10 border border-cyber-blue/20">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono text-cyber-blue uppercase tracking-wider">{data.type || 'Asset'}</div>
          <div className="text-xs font-semibold font-mono truncate text-slate-200" title={data.name}>{data.name}</div>
        </div>
      </div>
      {data.status && (
        <div className="mt-2 flex items-center justify-between text-[9px] font-mono border-t border-slate-800/80 pt-1.5">
          <span className="text-slate-400">STATUS:</span>
          <span className="text-cyber-green flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse"></span>
            ACTIVE
          </span>
        </div>
      )}
    </div>
  );
};

// Custom Identity Node Component
const IdentityNode = ({ data }: any) => {
  return (
    <div className="px-4 py-3 rounded-lg glass-panel-glow-purple border border-cyber-purple/30 text-white min-w-[180px] hover:border-cyber-purple/70 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded bg-cyber-purple/10 border border-cyber-purple/20">
          <User className="w-5 h-5 text-cyber-purple" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono text-cyber-purple uppercase tracking-wider">Identity</div>
          <div className="text-xs font-semibold font-mono truncate text-slate-200" title={data.role}>{data.role || 'Leaked Key'}</div>
        </div>
      </div>
      <div className="mt-2 text-[9px] font-mono border-t border-slate-800/80 pt-1.5 text-slate-400 truncate">
        SOURCE: <span className="text-cyber-purple">{data.source}</span>
      </div>
    </div>
  );
};

// Custom Vulnerability Node Component
const VulnerabilityNode = ({ data }: any) => {
  const isCritical = data.severity?.toLowerCase() === 'critical';
  
  return (
    <div className={`px-4 py-3 rounded-lg glass-panel-glow-red border text-white min-w-[200px] transition-all duration-300 ${
      isCritical 
        ? 'border-cyber-red/50 shadow-[0_0_15px_rgba(255,59,92,0.15)] glow-pulse-red' 
        : 'border-cyber-orange/40 hover:border-cyber-orange/85'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded ${isCritical ? 'bg-cyber-red/10 border border-cyber-red/20' : 'bg-cyber-orange/10 border border-cyber-orange/20'}`}>
          {isCritical ? (
            <ShieldAlert className="w-5 h-5 text-cyber-red" />
          ) : (
            <AlertOctagon className="w-5 h-5 text-cyber-orange" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-mono uppercase tracking-wider ${isCritical ? 'text-cyber-red' : 'text-cyber-orange'}`}>
              Vulnerability
            </span>
            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded ${
              isCritical ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/30' : 'bg-cyber-orange/20 text-cyber-orange border border-cyber-orange/30'
            }`}>
              {data.severity || 'HIGH'}
            </span>
          </div>
          <div className="text-xs font-semibold font-mono truncate text-slate-200 mt-0.5" title={data.title}>{data.title}</div>
        </div>
      </div>
      <div className="mt-2 text-[9px] font-mono border-t border-slate-800/80 pt-1.5 flex justify-between text-slate-400">
        <span>EXPOSURE SCORE:</span>
        <span className={isCritical ? 'text-cyber-red font-bold' : 'text-cyber-orange font-bold'}>
          {isCritical ? '9.8 / 10' : '7.5 / 10'}
        </span>
      </div>
    </div>
  );
};

export default function ThreatFlowGraph({
  assets,
  vulnerabilities,
  identities,
}: {
  assets: any[];
  vulnerabilities: any[];
  identities: any[];
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodeTypes = useMemo(() => ({
    asset: AssetNode,
    identity: IdentityNode,
    vulnerability: VulnerabilityNode,
  }), []);

  useEffect(() => {
    const flowNodes: any[] = [];
    const flowEdges: any[] = [];

    // Helper map to track positions
    const assetYMap = new Map();
    const identityYMap = new Map();
    const vulnYMap = new Map();

    // 1. Position Assets (Domains/Subdomains on the left)
    const baseAssets = assets.filter(a => a.type !== 'Cloud Bucket' && a.type !== 'Database');
    const targetAssets = assets.filter(a => a.type === 'Cloud Bucket' || a.type === 'Database');

    baseAssets.forEach((asset, idx) => {
      const yPos = 80 + idx * 120;
      assetYMap.set(asset.id, yPos);
      flowNodes.push({
        id: asset.id,
        type: 'asset',
        position: { x: 50, y: yPos },
        data: { name: asset.name, type: asset.type, status: asset.status },
      });
    });

    // 2. Position Identities (Middle-left)
    identities.forEach((ident, idx) => {
      const yPos = 120 + idx * 140;
      identityYMap.set(ident.id, yPos);
      flowNodes.push({
        id: ident.id,
        type: 'identity',
        position: { x: 340, y: yPos },
        data: { role: ident.role, source: ident.source },
      });
    });

    // 3. Position Vulnerabilities (Middle-right)
    vulnerabilities.forEach((vuln, idx) => {
      const yPos = 100 + idx * 150;
      vulnYMap.set(vuln.id, yPos);
      flowNodes.push({
        id: vuln.id,
        type: 'vulnerability',
        position: { x: 630, y: yPos },
        data: { title: vuln.title, severity: vuln.severity },
      });

      // Connect vulnerability to its primary assets
      if (vuln.assets && Array.isArray(vuln.assets)) {
        vuln.assets.forEach((assetRef: any) => {
          if (assetYMap.has(assetRef.id)) {
            flowEdges.push({
              id: `edge-${assetRef.id}-${vuln.id}`,
              source: assetRef.id,
              target: vuln.id,
              animated: true,
              style: { stroke: '#fb7185', strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#fb7185',
              },
            });
          }
        });
      }

      // Parse attack path sequence
      try {
        const sequence = JSON.parse(vuln.attackPathSequence);
        if (Array.isArray(sequence)) {
          for (let i = 0; i < sequence.length - 1; i++) {
            const src = sequence[i];
            const dst = sequence[i + 1];

            // Verify if both exist in our graph node definitions
            const srcNode = flowNodes.find(n => n.id === src);
            const dstNode = flowNodes.find(n => n.id === dst);

            if (srcNode && dstNode) {
              flowEdges.push({
                id: `attack-${vuln.id}-${src}-${dst}`,
                source: src,
                target: dst,
                animated: true,
                style: { 
                  stroke: '#ffb020', 
                  strokeWidth: 3,
                  strokeDasharray: '5,5'
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: '#ffb020',
                },
              });
            }
          }
        }
      } catch (e) {
        // Fallback or legacy sequence parsing
      }
    });

    // 4. Position Target Assets (Right-most)
    targetAssets.forEach((asset, idx) => {
      const yPos = 150 + idx * 160;
      flowNodes.push({
        id: asset.id,
        type: 'asset',
        position: { x: 920, y: yPos },
        data: { name: asset.name, type: asset.type, status: asset.status },
      });

      // Link any vulnerability connected to this target asset
      vulnerabilities.forEach(vuln => {
        try {
          const seq = JSON.parse(vuln.attackPathSequence);
          if (Array.isArray(seq) && seq.includes(asset.id)) {
            flowEdges.push({
              id: `target-link-${vuln.id}-${asset.id}`,
              source: vuln.id,
              target: asset.id,
              animated: true,
              style: { stroke: '#ff3b5c', strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#ff3b5c',
              },
            });
          }
        } catch (e) {}
      });
    });

    // Connect assets to identities (if applicable)
    // E.g. If staging.corporate-cloud.io points to leaked key
    assets.forEach(asset => {
      identities.forEach(ident => {
        if (ident.source.includes(asset.name) || (asset.name.includes('staging') && ident.source.includes('JS Bundle'))) {
          flowEdges.push({
            id: `asset-ident-${asset.id}-${ident.id}`,
            source: asset.id,
            target: ident.id,
            style: { stroke: '#8b5cf6', strokeWidth: 1.5 },
          });
        }
      });
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [assets, vulnerabilities, identities, setNodes, setEdges]);

  return (
    <div className="w-full h-full min-h-[450px] relative border border-cyber-border/40 rounded-lg overflow-hidden bg-[#040612]">
      {nodes.length > 0 ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.5}
          maxZoom={1.5}
          attributionPosition="bottom-left"
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls className="bg-slate-900 border border-slate-800 text-white fill-white rounded" />
          <MiniMap 
            nodeColor={(node: any) => {
              if (node.type === 'vulnerability') return '#ff3b5c';
              if (node.type === 'identity') return '#8b5cf6';
              return '#00d9ff';
            }}
            maskColor="rgba(5, 8, 22, 0.7)"
            className="bg-slate-900/80 border border-slate-800 rounded hidden md:block"
          />
        </ReactFlow>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full border border-dashed border-cyber-blue/40 flex items-center justify-center animate-spin">
            <Globe className="w-6 h-6 text-cyber-blue/60" />
          </div>
          <p className="text-slate-500 font-mono text-xs z-10">
            Scanning Pipeline Empty. Initialize Scope Boundary.
          </p>
        </div>
      )}
    </div>
  );
}
