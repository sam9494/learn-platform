const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'research.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

// ── Schema ──
// Internally the tables are still named `topics` (= domains) and `branches`
// (= subdomains) to preserve existing rows (including `papers.analysis`).
// The API layer exposes them as domains/subdomains.
db.exec(`
  CREATE TABLE IF NOT EXISTS topics (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    name_en     TEXT,
    description TEXT,
    icon        TEXT
  );

  CREATE TABLE IF NOT EXISTS branches (
    id    TEXT PRIMARY KEY,
    topic TEXT NOT NULL REFERENCES topics(id),
    label TEXT NOT NULL,
    color TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS papers (
    id           TEXT PRIMARY KEY,
    topic        TEXT NOT NULL REFERENCES topics(id),
    year         INTEGER NOT NULL,
    era          TEXT,
    branch       TEXT NOT NULL REFERENCES branches(id),
    title        TEXT NOT NULL,
    authors      TEXT NOT NULL,
    journal      TEXT,
    badge        TEXT,
    row_pos      INTEGER NOT NULL DEFAULT 0,
    summary      TEXT,
    key_findings TEXT,
    significance TEXT,
    pdf_url      TEXT,
    analysis     TEXT,
    analyzed_at  TEXT
  );

  CREATE TABLE IF NOT EXISTS paper_prereqs (
    paper_id  TEXT NOT NULL REFERENCES papers(id),
    prereq_id TEXT NOT NULL REFERENCES papers(id),
    PRIMARY KEY (paper_id, prereq_id)
  );

  CREATE TABLE IF NOT EXISTS branch_prereqs (
    branch_id  TEXT NOT NULL REFERENCES branches(id),
    prereq_id  TEXT NOT NULL REFERENCES branches(id),
    PRIMARY KEY (branch_id, prereq_id)
  );
`);

// ── Additive migrations for subdomain metadata ──
function addColumnIfMissing(table, column, definition) {
  const info = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!info.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

addColumnIfMissing('branches', 'name_en', 'TEXT');
addColumnIfMissing('branches', 'description', 'TEXT');
addColumnIfMissing('branches', 'icon', 'TEXT');
addColumnIfMissing('branches', 'row_pos', 'INTEGER NOT NULL DEFAULT 0');
addColumnIfMissing('branches', 'year_start', 'INTEGER');

module.exports = db;
