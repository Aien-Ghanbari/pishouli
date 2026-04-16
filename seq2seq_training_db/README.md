# Seq2Seq Training Dataset (Pishouli)

This folder exists inside the Pishouli project as requested.

- schema.sql: local SQLite schema for the same training-pairs table shape used by backend.

## Backend truth source

The live app writes training pairs to Cloudflare D1 table:
- seq2seq_training_pairs

Rows are automatically updated when admin creates/edits/deletes letters.

## Local SQLite usage

sqlite3 seq2seq_training.db < schema.sql

## Quick export query

SELECT room_id, letter_id, persian_text, finglish_text, pair_quality, is_active
FROM seq2seq_training_pairs
WHERE is_active = 1;
