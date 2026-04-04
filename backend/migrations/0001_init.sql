PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS rooms (
  room_id TEXT PRIMARY KEY,
  room_key_hash TEXT NOT NULL,
  admin_key_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  room_id TEXT PRIMARY KEY,
  single_read_mode INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS letters (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  mood TEXT NOT NULL,
  title_fa TEXT NOT NULL,
  body_fa TEXT NOT NULL,
  title_en TEXT NOT NULL,
  body_en TEXT NOT NULL,
  is_visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_letters_room_created ON letters(room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_letters_room_deleted ON letters(room_id, deleted);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  vault TEXT,
  visitor_id TEXT,
  at TEXT NOT NULL,
  meta_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_events_room_at ON events(room_id, at DESC);

CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  visitor_id TEXT,
  entered_at TEXT NOT NULL,
  exited_at TEXT,
  vaults_json TEXT NOT NULL DEFAULT '[]',
  FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_visits_room_entered ON visits(room_id, entered_at DESC);
