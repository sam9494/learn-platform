const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const db = require('./db');

require('./seed');

const app = express();
app.use(cors());
app.use(express.json());

const PAPERS_DIR = path.join(__dirname, 'papers');

// ── Helper: download file ──
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;

    const request = (targetUrl) => {
      client.get(targetUrl, (resp) => {
        if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
          return request(resp.headers.location);
        }
        if (resp.statusCode !== 200) {
          fs.unlinkSync(dest);
          return reject(new Error(`HTTP ${resp.statusCode}`));
        }
        resp.pipe(file);
        file.on('finish', () => file.close(resolve));
      }).on('error', (err) => {
        fs.unlinkSync(dest);
        reject(err);
      });
    };
    request(url);
  });
}

// ── Helper: extract text from PDF ──
async function extractPdfText(filePath) {
  const pdfParse = require('pdf-parse-new');
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

// ════════════════════════════════════
// GET /api/domains
// ════════════════════════════════════
app.get('/api/domains', (_req, res) => {
  const domains = db.prepare('SELECT * FROM topics').all();
  const paperCounts = db.prepare('SELECT topic, COUNT(*) as cnt FROM papers GROUP BY topic').all();
  const subdomainCounts = db.prepare('SELECT topic, COUNT(*) as cnt FROM branches GROUP BY topic').all();

  const pMap = {}; paperCounts.forEach((r) => { pMap[r.topic] = r.cnt; });
  const sMap = {}; subdomainCounts.forEach((r) => { sMap[r.topic] = r.cnt; });

  res.json(domains.map((d) => ({
    id: d.id,
    name: d.name,
    nameEn: d.name_en,
    description: d.description,
    icon: d.icon,
    paperCount: pMap[d.id] || 0,
    subdomainCount: sMap[d.id] || 0,
  })));
});

// ════════════════════════════════════
// GET /api/domains/:domainId/subdomains
// Returns subdomain tech-tree with prereq edges
// ════════════════════════════════════
app.get('/api/domains/:domainId/subdomains', (req, res) => {
  const domain = db.prepare('SELECT * FROM topics WHERE id = ?').get(req.params.domainId);
  if (!domain) return res.sendStatus(404);

  const subs = db.prepare(`
    SELECT b.*, COUNT(p.id) as paper_count
    FROM branches b
    LEFT JOIN papers p ON p.branch = b.id
    WHERE b.topic = ?
    GROUP BY b.id
    ORDER BY b.year_start
  `).all(req.params.domainId);

  const subIds = subs.map((s) => s.id);
  const prereqRows = subIds.length
    ? db.prepare(
        `SELECT * FROM branch_prereqs WHERE branch_id IN (${subIds.map(() => '?').join(',')})`
      ).all(...subIds)
    : [];
  const prereqMap = {};
  prereqRows.forEach((r) => {
    if (!prereqMap[r.branch_id]) prereqMap[r.branch_id] = [];
    prereqMap[r.branch_id].push(r.prereq_id);
  });

  res.json({
    domain: {
      id: domain.id,
      name: domain.name,
      nameEn: domain.name_en,
      description: domain.description,
      icon: domain.icon,
    },
    subdomains: subs.map((s) => ({
      id: s.id,
      label: s.label,
      nameEn: s.name_en,
      description: s.description,
      color: s.color,
      rowPos: s.row_pos,
      yearStart: s.year_start,
      paperCount: s.paper_count,
      prereqs: prereqMap[s.id] || [],
    })),
  });
});

// ════════════════════════════════════
// GET /api/subdomains/:subId/papers
// Returns papers + intra-subdomain prereq edges + subdomain/domain context
// ════════════════════════════════════
app.get('/api/subdomains/:subId/papers', (req, res) => {
  const sub = db.prepare(`
    SELECT b.*, t.id as domain_id, t.name as domain_name, t.icon as domain_icon
    FROM branches b JOIN topics t ON b.topic = t.id
    WHERE b.id = ?
  `).get(req.params.subId);
  if (!sub) return res.sendStatus(404);

  const papers = db.prepare(`
    SELECT p.*, b.label as branch_label, b.color as branch_color
    FROM papers p JOIN branches b ON p.branch = b.id
    WHERE p.branch = ?
    ORDER BY p.year
  `).all(req.params.subId);

  const paperIds = papers.map((p) => p.id);
  const prereqMap = {};
  if (paperIds.length) {
    const rows = db.prepare(
      `SELECT * FROM paper_prereqs WHERE paper_id IN (${paperIds.map(() => '?').join(',')})`
    ).all(...paperIds);
    rows.forEach((r) => {
      if (!prereqMap[r.paper_id]) prereqMap[r.paper_id] = [];
      prereqMap[r.paper_id].push(r.prereq_id);
    });
  }

  res.json({
    domain: { id: sub.domain_id, name: sub.domain_name, icon: sub.domain_icon },
    subdomain: {
      id: sub.id,
      label: sub.label,
      nameEn: sub.name_en,
      description: sub.description,
      color: sub.color,
    },
    papers: papers.map((p) => ({
      id: p.id,
      year: p.year,
      era: p.era,
      branch: p.branch,
      branchLabel: p.branch_label,
      branchColor: p.branch_color,
      title: p.title,
      authors: p.authors,
      journal: p.journal,
      badge: p.badge,
      row: p.row_pos,
      summary: p.summary,
      keyFindings: JSON.parse(p.key_findings || '[]'),
      significance: p.significance,
      pdfUrl: p.pdf_url,
      hasAnalysis: !!p.analysis,
      prereqs: prereqMap[p.id] || [],
    })),
  });
});

// ════════════════════════════════════
// GET /api/papers/:id — single paper detail
// (prereqs include cross-subdomain refs with subdomain/domain metadata)
// ════════════════════════════════════
app.get('/api/papers/:id', (req, res) => {
  const p = db.prepare(`
    SELECT p.*, b.label as branch_label, b.color as branch_color,
           t.id as domain_id, t.name as domain_name
    FROM papers p
    JOIN branches b ON p.branch = b.id
    JOIN topics t ON p.topic = t.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!p) return res.sendStatus(404);

  // Prereqs (upstream) and dependents (downstream), joined with subdomain info
  const prereqs = db.prepare(`
    SELECT pp.prereq_id as id, p.year, p.title, p.authors, p.branch,
           b.label as branch_label, b.color as branch_color,
           t.id as domain_id, t.name as domain_name
    FROM paper_prereqs pp
    JOIN papers p ON pp.prereq_id = p.id
    JOIN branches b ON p.branch = b.id
    JOIN topics t ON p.topic = t.id
    WHERE pp.paper_id = ?
    ORDER BY p.year
  `).all(req.params.id);

  const dependents = db.prepare(`
    SELECT pp.paper_id as id, p.year, p.title, p.authors, p.branch,
           b.label as branch_label, b.color as branch_color,
           t.id as domain_id, t.name as domain_name
    FROM paper_prereqs pp
    JOIN papers p ON pp.paper_id = p.id
    JOIN branches b ON p.branch = b.id
    JOIN topics t ON p.topic = t.id
    WHERE pp.prereq_id = ?
    ORDER BY p.year
  `).all(req.params.id);

  res.json({
    id: p.id, year: p.year, era: p.era,
    domain: p.domain_id, domainName: p.domain_name,
    branch: p.branch, branchLabel: p.branch_label, branchColor: p.branch_color,
    title: p.title, authors: p.authors, journal: p.journal, badge: p.badge,
    row: p.row_pos, summary: p.summary,
    keyFindings: JSON.parse(p.key_findings || '[]'),
    significance: p.significance, pdfUrl: p.pdf_url,
    analysis: p.analysis, analyzedAt: p.analyzed_at,
    prereqs,
    dependents,
  });
});

// ════════════════════════════════════
// POST /api/papers/:id/analyze
// ════════════════════════════════════
app.post('/api/papers/:id/analyze', async (req, res) => {
  const p = db.prepare('SELECT p.*, t.name as topic_name FROM papers p JOIN topics t ON p.topic = t.id WHERE p.id = ?').get(req.params.id);
  if (!p) return res.sendStatus(404);

  if (p.analysis) {
    return res.json({ analysis: p.analysis });
  }

  let pdfText = '';
  const pdfPath = path.join(PAPERS_DIR, `${p.id}.pdf`);

  if (p.pdf_url && !fs.existsSync(pdfPath)) {
    try {
      console.log(`Downloading PDF for ${p.id}...`);
      await downloadFile(p.pdf_url, pdfPath);
      console.log(`Downloaded: ${pdfPath}`);
    } catch (err) {
      console.error(`PDF download failed for ${p.id}:`, err.message);
    }
  }

  if (fs.existsSync(pdfPath)) {
    try {
      pdfText = await extractPdfText(pdfPath);
      console.log(`Extracted ${pdfText.length} chars from ${p.id}.pdf`);
    } catch (err) {
      console.error(`PDF parse failed for ${p.id}:`, err.message);
    }
  }

  const topicContext = p.topic_name || '學術研究';
  const prompt = `你是學術論文分析專家。請根據你的訓練知識，用繁體中文深入分析這篇論文：「${p.title}」，作者 ${p.authors}，${p.year} 年發表於 ${p.journal}。${pdfText ? '以下是論文全文供參考：' + pdfText.slice(0, 60000) : '請根據你對這篇高引用論文的知識來分析。'}。請按照以下八個段落撰寫，每段都要有實質內容，用 markdown 格式輸出：（一）前言與背景（二）研究假設（三）研究方法（四）主要發現與結論（五）理論貢獻（六）實務意義（七）限制與反思（八）在「${topicContext}」研究脈絡中的定位。直接開始寫，不要問問題。`;

  const os = require('os');
  const { exec } = require('child_process');
  const tmpFile = path.join(os.tmpdir(), `claude_${p.id}_${Date.now()}.txt`);
  fs.writeFileSync(tmpFile, prompt, 'utf-8');
  console.log(`Analyzing ${p.id} (${prompt.length} chars → ${tmpFile})`);

  const bashPath = 'C:\\Program Files\\Git\\bin\\bash.exe';
  const tmpUnix = tmpFile.replace(/\\/g, '/');
  const cmd = `cat "${tmpUnix}" | claude -p --model sonnet`;

  exec(cmd, {
    timeout: 180000,
    maxBuffer: 4 * 1024 * 1024,
    encoding: 'utf-8',
    shell: bashPath,
    cwd: os.tmpdir(),
  }, (err, stdout, stderr) => {
    try { fs.unlinkSync(tmpFile); } catch (_) {}

    if (err) {
      console.error('Claude CLI error:', err.message);
      console.error('stderr:', stderr);
      return res.status(500).json({ error: err.message, stderr: String(stderr || '').slice(0, 2000), stdout: String(stdout || '').slice(0, 2000) });
    }

    const analysis = stdout.trim();
    if (!analysis) {
      console.error('Empty response. stderr:', stderr);
      return res.status(500).json({ error: 'empty response from claude CLI', stderr: String(stderr || '').slice(0, 2000) });
    }

    console.log(`Analysis done for ${p.id} (${analysis.length} chars)`);
    db.prepare('UPDATE papers SET analysis = ?, analyzed_at = ? WHERE id = ?')
      .run(analysis, new Date().toISOString(), p.id);

    res.json({ analysis });
  });
});

// ════════════════════════════════════
// GET /api/papers/:id/analysis — standalone HTML page
// ════════════════════════════════════
app.get('/api/papers/:id/analysis', (req, res) => {
  const p = db.prepare(`
    SELECT p.*, b.label as branch_label, b.color as branch_color
    FROM papers p JOIN branches b ON p.branch = b.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!p) return res.sendStatus(404);
  if (!p.analysis) return res.sendStatus(404);

  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${p.title} — 深入分析</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: 'Noto Serif TC', Georgia, serif;
    background: #0a0f1a;
    min-height: 100vh;
    color: #c8bfa6;
  }
  body::before {
    content: '';
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 0L56 17v34L28 68 0 51V17z' fill='none' stroke='rgba(100,160,230,0.03)' stroke-width='0.6'/%3E%3Cpath d='M28 50L56 67v34L28 118 0 101V67z' fill='none' stroke='rgba(100,160,230,0.03)' stroke-width='0.6'/%3E%3C/svg%3E");
    background-size: 56px 100px;
  }
  .container {
    position: relative; z-index: 1;
    max-width: 800px; margin: 0 auto;
    padding: 40px 48px 60px;
    background: linear-gradient(180deg, #111c30 0%, #0f1923 50%, #111c30 100%);
    min-height: 100vh;
    box-shadow: -8px 0 24px rgba(0,0,0,0.4), 8px 0 24px rgba(0,0,0,0.4);
    border-left: 1px solid rgba(42,58,85,0.5);
    border-right: 1px solid rgba(42,58,85,0.5);
  }
  .container::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, transparent 5%, #c8a84e 30%, #e8d06e 50%, #c8a84e 70%, transparent 95%);
  }

  .header {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(200,168,78,0.15);
  }
  .meta {
    font-family: 'Cinzel', serif;
    font-size: 12px; letter-spacing: 3px; text-transform: uppercase;
    color: #c8a84e; margin-bottom: 8px;
    text-shadow: 0 0 10px rgba(200,168,78,0.2);
  }
  h1 {
    font-size: 22px; font-weight: 700; line-height: 1.5;
    color: #f0e8d0; margin-bottom: 8px;
  }
  .authors { font-size: 14px; color: #8a8272; font-style: italic; margin-bottom: 4px; }
  .journal { font-size: 13px; color: #5a5548; }

  .analysis h2 {
    font-family: 'Cinzel', serif;
    font-size: 15px; font-weight: 700; letter-spacing: 2px;
    color: #c8a84e;
    margin: 28px 0 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(200,168,78,0.12);
  }
  .analysis h3 {
    font-size: 14px; font-weight: 700; color: #f0e8d0;
    margin: 16px 0 8px;
  }
  .analysis p {
    font-size: 14px; line-height: 1.9; color: #c8bfa6;
    margin-bottom: 10px; text-align: justify;
  }
  .analysis ul, .analysis ol {
    padding-left: 22px; margin: 8px 0 12px;
  }
  .analysis li {
    font-size: 14px; line-height: 1.8; color: #c8bfa6;
    margin-bottom: 4px;
  }
  .analysis li::marker { color: #8a7030; }
  .analysis strong { color: #f0e8d0; }
  .analysis blockquote {
    border-left: 3px solid #c8a84e;
    padding: 8px 16px; margin: 12px 0;
    background: rgba(200,168,78,0.04);
    font-style: italic;
  }

  .timestamp {
    margin-top: 40px; padding-top: 16px;
    border-top: 1px solid rgba(200,168,78,0.1);
    font-size: 12px; color: #5a5548; text-align: right;
    font-style: italic;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
  ::-webkit-scrollbar-thumb { background: #2a3a55; border-radius: 3px; }

  @media print {
    body { background: #fff; color: #222; }
    .container { box-shadow: none; padding: 20px; background: #fff; border: none; }
    .meta, .analysis h2 { color: #555; }
    h1, .analysis h3, .analysis strong { color: #222; }
    .analysis p, .analysis li { color: #333; }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="meta">${p.year} · ${p.branch_label} · 深入分析</div>
      <h1>${p.title}</h1>
      <div class="authors">${p.authors}</div>
      <div class="journal">${p.journal}</div>
    </div>
    <div class="analysis">${markdownToHtml(p.analysis)}</div>
    <div class="timestamp">分析產生於 ${p.analyzed_at ? new Date(p.analyzed_at).toLocaleString('zh-TW') : ''}</div>
  </div>
</body>
</html>`;

  res.type('html').send(html);
});

function markdownToHtml(md) {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
    .replace(/^(?!<[hulo])(.)(.*)$/gm, '<p>$1$2</p>')
    .replace(/<p><\/p>/g, '')
    .replace(/\n/g, '');
}

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
