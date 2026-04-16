CREATE TABLE IF NOT EXISTS seq2seq_training_pairs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT NOT NULL,
  letter_id TEXT NOT NULL,
  persian_text TEXT NOT NULL,
  finglish_text TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'admin_textbox',
  pair_quality INTEGER NOT NULL DEFAULT 3 CHECK (pair_quality BETWEEN 1 AND 5),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
  UNIQUE(room_id, letter_id)
);

CREATE INDEX IF NOT EXISTS idx_seq2seq_room_active
  ON seq2seq_training_pairs(room_id, is_active, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_seq2seq_quality
  ON seq2seq_training_pairs(pair_quality DESC, updated_at DESC);
