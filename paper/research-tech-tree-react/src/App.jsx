import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import PaperNode from './components/PaperNode';
import SubdomainNode from './components/SubdomainNode';
import DetailPanel from './components/DetailPanel';
import Legend from './components/Legend';
import HomePage from './components/HomePage';
import {
  buildPaperNodes, buildPaperEdges,
  buildSubdomainNodes, buildSubdomainEdges,
} from './data/buildGraph';

const API = 'http://localhost:3002/api';
const nodeTypes = { paper: PaperNode, subdomain: SubdomainNode };

export default function App() {
  // view = 'home' | 'subdomains' | 'papers'
  const [view, setView] = useState('home');
  const [domain, setDomain] = useState(null);         // { id, name, icon }
  const [subdomain, setSubdomain] = useState(null);   // { id, label, color, description }
  const [subdomains, setSubdomains] = useState([]);   // list (for subdomain view)
  const [papers, setPapers] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const papersRef = useRef([]);

  // ── Load subdomains for a domain ──
  useEffect(() => {
    if (view !== 'subdomains' || !domain) return;
    setLoading(true);
    setSelectedId(null);
    fetch(`${API}/domains/${domain.id}/subdomains`)
      .then((r) => r.json())
      .then(({ domain: d, subdomains: subs }) => {
        setDomain({ id: d.id, name: d.name, icon: d.icon });
        setSubdomains(subs);
        setNodes(buildSubdomainNodes(subs));
        setEdges(buildSubdomainEdges(subs));
        setLoading(false);
      });
  }, [view, domain?.id, setNodes, setEdges]);

  // ── Load papers for a subdomain ──
  useEffect(() => {
    if (view !== 'papers' || !subdomain) return;
    setLoading(true);
    setSelectedId(null);
    fetch(`${API}/subdomains/${subdomain.id}/papers`)
      .then((r) => r.json())
      .then(({ domain: d, subdomain: sub, papers: ps }) => {
        setDomain({ id: d.id, name: d.name, icon: d.icon });
        setSubdomain(sub);
        setPapers(ps);
        papersRef.current = ps;
        setNodes(buildPaperNodes(ps));
        setEdges(buildPaperEdges(ps));
        setLoading(false);
      });
  }, [view, subdomain?.id, setNodes, setEdges]);

  // ── Hover highlight ──
  const handleNodeMouseEnter = useCallback((_e, node) => {
    const id = node.id;
    let connectedIds;

    if (view === 'papers') {
      const paper = node.data;
      connectedIds = new Set([id]);
      (paper.prereqs || []).forEach((pid) => connectedIds.add(pid));
      papersRef.current.forEach((p) => {
        if (p.prereqs.includes(id)) connectedIds.add(p.id);
      });
    } else {
      const sub = node.data;
      connectedIds = new Set([id]);
      (sub.prereqs || []).forEach((sid) => connectedIds.add(sid));
      subdomains.forEach((s) => {
        if ((s.prereqs || []).includes(id)) connectedIds.add(s.id);
      });
    }

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        style: connectedIds.has(n.id) ? { opacity: 1 } : { opacity: 0.25 },
      }))
    );
    setEdges((eds) =>
      eds.map((e) => {
        const connected = e.source === id || e.target === id;
        return {
          ...e,
          style: {
            ...e.style,
            opacity: connected ? 0.9 : 0.05,
            strokeWidth: connected ? 2.5 : 1.5,
            filter: connected ? 'drop-shadow(0 0 3px rgba(200,168,78,0.4))' : 'none',
          },
        };
      })
    );
  }, [view, subdomains, setNodes, setEdges]);

  const handleNodeMouseLeave = useCallback(() => {
    setNodes((nds) => nds.map((n) => ({ ...n, style: { opacity: 1 } })));
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        style: { ...e.style, opacity: 0.45, strokeWidth: 2, filter: 'none' },
      }))
    );
  }, [setNodes, setEdges]);

  const handleNodeClick = useCallback((_e, node) => {
    if (view === 'subdomains') {
      // Enter paper view for this subdomain
      setSubdomain({ id: node.data.id, label: node.data.label, color: node.data.color });
      setView('papers');
    } else {
      setSelectedId(node.id);
    }
  }, [view]);

  const handlePaneClick = useCallback(() => {
    setSelectedId(null);
  }, []);

  const minimapNodeColor = useCallback((node) => {
    if (view === 'papers') return node.data.branchColor || '#555';
    return node.data.color || '#555';
  }, [view]);

  const handleAnalysisSaved = useCallback((paperId) => {
    setPapers((prev) => {
      const updated = prev.map((p) =>
        p.id === paperId ? { ...p, hasAnalysis: true } : p
      );
      papersRef.current = updated;
      return updated;
    });
  }, []);

  const handleSelectDomain = useCallback((domainId) => {
    setDomain({ id: domainId });
    setSubdomain(null);
    setSubdomains([]);
    setPapers([]);
    setSelectedId(null);
    setNodes([]);
    setEdges([]);
    setView('subdomains');
  }, [setNodes, setEdges]);

  const handleBackToDomains = useCallback(() => {
    setView('home');
    setDomain(null);
    setSubdomain(null);
    setSubdomains([]);
    setPapers([]);
    setSelectedId(null);
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  const handleBackToSubdomains = useCallback(() => {
    setView('subdomains');
    setSubdomain(null);
    setPapers([]);
    setSelectedId(null);
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  // ── Home ──
  if (view === 'home') {
    return <HomePage onSelectDomain={handleSelectDomain} />;
  }

  if (loading) {
    return (
      <div style={{
        width: '100vw', height: '100vh', background: '#0a0f1a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Cinzel', serif", color: '#c8a84e', fontSize: 18,
        letterSpacing: 4,
      }}>
        LOADING...
      </div>
    );
  }

  // Legend data depends on view
  const legendItems = view === 'papers'
    ? subdomains.length > 0
      ? subdomains.reduce((acc, s) => { acc[s.id] = { label: s.label, color: s.color }; return acc; }, {})
      // fallback: derive from current papers (single subdomain view)
      : (subdomain ? { [subdomain.id]: { label: subdomain.label, color: subdomain.color } } : {})
    : subdomains.reduce((acc, s) => { acc[s.id] = { label: s.label, color: s.color }; return acc; }, {});

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0f1a' }}>
      <div className="hex-bg" />
      <div className="topbar">
        {view === 'subdomains' && (
          <button className="back-btn" onClick={handleBackToDomains}>&#x25C0; 領域</button>
        )}
        {view === 'papers' && (
          <button className="back-btn" onClick={handleBackToSubdomains}>
            &#x25C0; {domain?.name || '子領域'}
          </button>
        )}
        <h1>&#x2B21; Research Tech Tree</h1>
        <div className="topic">
          {view === 'subdomains'
            ? `領域：${domain?.name || ''}`
            : `${domain?.name || ''} › ${subdomain?.label || ''}`}
        </div>
        {Object.keys(legendItems).length > 0 && <Legend branches={legendItems} />}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onPaneClick={handlePaneClick}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.1}
        maxZoom={2.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(100,160,230,0.04)" gap={50} size={1} />
        <MiniMap
          nodeColor={minimapNodeColor}
          nodeStrokeWidth={0}
          maskColor="rgba(10,15,26,0.85)"
          style={{
            background: 'rgba(15,25,35,0.92)',
            border: '1px solid rgba(42,58,85,0.6)',
            borderRadius: 3,
          }}
        />
      </ReactFlow>

      {view === 'papers' && (
        <DetailPanel
          paperId={selectedId}
          onClose={() => setSelectedId(null)}
          onNavigate={setSelectedId}
          onAnalysisSaved={handleAnalysisSaved}
        />
      )}
    </div>
  );
}
