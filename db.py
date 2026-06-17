import sqlite3
from collections.abc import Generator
from contextlib import contextmanager
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


@contextmanager
def get_conn() -> Generator[sqlite3.Connection, None, None]:
    db_path = get_db_path()
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    try:
        yield conn
    finally:
        conn.close()


def init_db():
    with get_conn() as conn:
        conn.executescript(_SCHEMA)
