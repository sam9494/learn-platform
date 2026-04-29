import { useState, useEffect } from 'react';

const API = 'http://localhost:3002/api';

export default function DetailPanel({ paperId, onClose, onNavigate, onAnalysisSaved }) {
  const [detail, setDetail] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!paperId) { setDetail(null); return; }
    setError(null);
    fetch(`${API}/papers/${paperId}`)
      .then((r) => {
        if (!r.ok) throw new Error('載入失敗');
        return r.json();
      })
      .then(setDetail)
      .catch((e) => setError(e.message));
  }, [paperId]);

  if (!paperId || !detail) return null;

  const prereqs = detail.prereqs || [];
  const dependents = detail.dependents || [];
  const currentBranch = detail.branch;

  const handleAnalyze = async () => {
    if (detail.analysis) {
      window.open(`${API}/papers/${detail.id}/analysis`, '_blank');
      return;
    }
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch(`${API}/papers/${detail.id}/analyze`, { method: 'POST' });
      if (!res.ok) {
        const info = await res.json().catch(() => null);
        console.error('[analyze failed]', info);
        throw new Error(info?.error ? `分析失敗：${info.error}` : '分析失敗，請稍後再試');
      }
      const data = await res.json();
      setDetail((prev) => ({ ...prev, analysis: data.analysis, analyzedAt: new Date().toISOString() }));
      onAnalysisSaved(detail.id);
      window.open(`${API}/papers/${detail.id}/analysis`, '_blank');
    } catch (e) {
      setError(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownload = () => {
    if (detail.pdfUrl) {
      window.open(detail.pdfUrl, '_blank');
    } else {
      const query = encodeURIComponent(`${detail.title} ${detail.authors} filetype:pdf`);
      window.open(`https://scholar.google.com/scholar?q=${query}`, '_blank');
    }
  };

  const renderConnItem = (p, arrow) => {
    const crossBranch = p.branch !== currentBranch;
    return (
      <div
        key={p.id}
        className={`detail-conn-item${crossBranch ? ' cross-branch' : ''}`}
        onClick={() => onNavigate(p.id)}
        title={crossBranch ? `來自子領域：${p.branch_label}` : ''}
      >
        <span style={{ color: p.branch_color }}>{arrow}</span>
        <span>{p.year} — {p.authors}</span>
        {crossBranch && (
          <span className="cross-branch-tag" style={{ borderColor: p.branch_color, color: p.branch_color }}>
            {p.branch_label}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="detail-panel open">
      <button className="close-btn" onClick={onClose}>✕</button>

      <div className="detail-year">{detail.year} · {detail.branchLabel}</div>
      <div className="detail-title">{detail.title}</div>
      <div className="detail-authors">{detail.authors}</div>
      <div className="detail-journal">{detail.journal}</div>

      <div className="detail-section">
        <h3>摘要</h3>
        <p>{detail.summary}</p>
      </div>

      <div className="detail-section">
        <h3>主要發現</h3>
        <ul>
          {(detail.keyFindings || []).map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </div>

      <div className="detail-section">
        <h3>重要性</h3>
        <p>{detail.significance}</p>
      </div>

      {prereqs.length > 0 && (
        <div className="detail-section">
          <h3>前置研究</h3>
          {prereqs.map((p) => renderConnItem(p, '\u25C4'))}
        </div>
      )}

      {dependents.length > 0 && (
        <div className="detail-section">
          <h3>後續影響</h3>
          {dependents.map((p) => renderConnItem(p, '\u25BA'))}
        </div>
      )}

      {error && <div className="analysis-error">{error}</div>}

      <div className="detail-actions">
        <button className="action-btn download-btn" onClick={handleDownload}>
          <span className="action-icon">📜</span>
          {detail.pdfUrl ? '下載論文' : '搜尋論文'}
        </button>

        <button
          className="action-btn analyze-btn"
          onClick={handleAnalyze}
          disabled={analyzing}
        >
          <span className="action-icon">{analyzing ? '⏳' : '🔍'}</span>
          {analyzing ? '分析中...' : detail.analysis ? '查看分析' : '深入分析'}
        </button>
      </div>
    </div>
  );
}
