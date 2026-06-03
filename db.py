import sqlite3
from config import get_db_path

_SCHEMA = """
CREATE TABLE IF NOT EXISTS sleep (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE,
    total_min INTEGER,
    deep_min INTEGER,
    awake_min INTEGER DEFAULT 0,
    rem_min INTEGER DEFAULT 0,
    core_min INTEGER DEFAULT 0,
    note TEXT
);

CREATE TABLE IF NOT EXISTS mood (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    datetime TEXT,
    mood TEXT,
    note TEXT
);

CREATE TABLE IF NOT EXISTS body (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    sport_min INTEGER DEFAULT 0,
    skin TEXT,
    energy INTEGER,
    coffee INTEGER DEFAULT 0,
    note TEXT
);

CREATE TABLE IF NOT EXISTS track (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    name TEXT,
    value INTEGER,
    note TEXT
);

CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
);
"""


def get_conn() -> sqlite3.Connection:
    db_path = get_db_path()
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    conn = get_conn()
    conn.executescript(_SCHEMA)
    conn.close()
