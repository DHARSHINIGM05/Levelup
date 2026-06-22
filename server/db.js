import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);

// Initialize schema for test results
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    learnerId TEXT NOT NULL,
    learnerName TEXT,
    moduleName TEXT NOT NULL,           -- Listening / Speaking / Reading / Writing
    testType TEXT NOT NULL,             -- Pre-test / Post-test / Practice
    totalQuestions INTEGER NOT NULL,
    correctAnswers INTEGER NOT NULL,
    accuracy REAL NOT NULL,
    sessionDuration REAL,               -- minutes
    calmModeActivatedCount INTEGER DEFAULT 0,
    calmModeResumedCount INTEGER DEFAULT 0,
    inattentiveCount INTEGER DEFAULT 0,
    isCompleted INTEGER DEFAULT 1,      -- 1 = completed, 0 = started but abandoned
    sessionKey TEXT,                    -- optional client-provided key to avoid duplicates
    timestamp DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE INDEX IF NOT EXISTS idx_test_results_learner ON test_results (learnerId);
  CREATE INDEX IF NOT EXISTS idx_test_results_module ON test_results (moduleName);
  CREATE INDEX IF NOT EXISTS idx_test_results_type ON test_results (testType);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_test_results_sessionKey
    ON test_results (sessionKey)
    WHERE sessionKey IS NOT NULL;
`);

export default db;

