/**
 * 學數學 · 簡易伺服器
 * 提供靜態檔案 + 學習進度 API
 * 使用 Node.js 內建 SQLite（Node 22+），零外部相依套件
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { DatabaseSync } = require('node:sqlite');

const PORT = 3000;
const ROOT = __dirname;

const db = new DatabaseSync(path.join(ROOT, 'progress.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS progress (
    lesson_id TEXT PRIMARY KEY,
    completed_at TEXT NOT NULL
  )
`);

const stmtAll    = db.prepare('SELECT lesson_id, completed_at FROM progress');
const stmtUpsert = db.prepare('INSERT OR REPLACE INTO progress (lesson_id, completed_at) VALUES (?, ?)');
const stmtDel    = db.prepare('DELETE FROM progress WHERE lesson_id = ?');
const stmtClear  = db.prepare('DELETE FROM progress');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon'
};

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => resolve(body));
  });
}

const server = http.createServer(async (req, res) => {
  const u = url.parse(req.url, true);
  const p = decodeURIComponent(u.pathname);

  // ---- API ----
  if (p.startsWith('/api/progress')) {
    try {
      if (req.method === 'GET' && p === '/api/progress') {
        return sendJSON(res, 200, stmtAll.all());
      }
      if (req.method === 'POST' && p === '/api/progress') {
        const { lessonId } = JSON.parse(await readBody(req) || '{}');
        if (!lessonId) return sendJSON(res, 400, { error: 'lessonId required' });
        stmtUpsert.run(lessonId, new Date().toISOString());
        return sendJSON(res, 200, { ok: true });
      }
      if (req.method === 'DELETE' && p.startsWith('/api/progress/')) {
        const id = p.split('/').pop();
        stmtDel.run(id);
        return sendJSON(res, 200, { ok: true });
      }
      if (req.method === 'DELETE' && p === '/api/progress') {
        stmtClear.run();
        return sendJSON(res, 200, { ok: true });
      }
      return sendJSON(res, 404, { error: 'API not found' });
    } catch (e) {
      return sendJSON(res, 500, { error: e.message });
    }
  }

  // ---- Static ----
  let filePath = p === '/' ? '/index.html' : p;
  filePath = path.join(ROOT, filePath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404); return res.end('Not found: ' + p);
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n📚  學數學伺服器啟動成功！`);
  console.log(`    開啟瀏覽器：http://localhost:${PORT}`);
  console.log(`    資料庫檔案：${path.join(ROOT, 'progress.db')}`);
  console.log(`    停止：Ctrl + C\n`);
});
