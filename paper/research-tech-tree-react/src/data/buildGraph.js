// ── Paper tech tree layout ──
const PAPER_COL_GAP = 400;
const PAPER_ROW_GAP = 210;
const PAPER_PAD_LEFT = 120;
const PAPER_PAD_TOP = 90;

export function buildPaperNodes(papers) {
  const sortedYears = [...new Set(papers.map((p) => p.year))].sort((a, b) => a - b);
  return papers.map((p) => ({
    id: p.id,
    type: 'paper',
    position: {
      x: PAPER_PAD_LEFT + sortedYears.indexOf(p.year) * PAPER_COL_GAP,
      y: PAPER_PAD_TOP + p.row * PAPER_ROW_GAP,
    },
    data: p,
  }));
}

export function buildPaperEdges(papers) {
  const paperIdSet = new Set(papers.map((p) => p.id));
  const edges = [];
  papers.forEach((p) => {
    p.prereqs.forEach((srcId) => {
      if (!paperIdSet.has(srcId)) return; // skip cross-subdomain refs here
      edges.push({
        id: `${srcId}->${p.id}`,
        source: srcId,
        target: p.id,
        type: 'smoothstep',
        pathOptions: { borderRadius: 8 },
        style: {
          stroke: p.branchColor || '#888',
          strokeWidth: 2,
          opacity: 0.45,
        },
      });
    });
  });
  return edges;
}

// ── Subdomain tech tree layout ──
const SUB_COL_GAP = 420;
const SUB_ROW_GAP = 240;
const SUB_PAD_LEFT = 140;
const SUB_PAD_TOP = 100;

export function buildSubdomainNodes(subdomains) {
  const sortedYears = [...new Set(subdomains.map((s) => s.yearStart))].sort((a, b) => a - b);
  return subdomains.map((s) => ({
    id: s.id,
    type: 'subdomain',
    position: {
      x: SUB_PAD_LEFT + sortedYears.indexOf(s.yearStart) * SUB_COL_GAP,
      y: SUB_PAD_TOP + s.rowPos * SUB_ROW_GAP,
    },
    data: s,
  }));
}

export function buildSubdomainEdges(subdomains) {
  const edges = [];
  const colorMap = {};
  subdomains.forEach((s) => { colorMap[s.id] = s.color; });

  subdomains.forEach((s) => {
    (s.prereqs || []).forEach((srcId) => {
      edges.push({
        id: `${srcId}->${s.id}`,
        source: srcId,
        target: s.id,
        type: 'smoothstep',
        pathOptions: { borderRadius: 8 },
        style: {
          stroke: colorMap[s.id] || '#888',
          strokeWidth: 2.5,
          opacity: 0.5,
        },
      });
    });
  });
  return edges;
}
