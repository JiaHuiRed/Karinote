"""
Karinote Bridge — RedPar 与 Karinote 数据层的桥梁。

用法:
  python karinote_bridge.py --action query --type sleep --days 7
  python karinote_bridge.py --action query --type mood --days 3
  python karinote_bridge.py --action query --type body --days 7
  python karinote_bridge.py --action query --type track --days 7
  python karinote_bridge.py --action query --type all --days 3
  python karinote_bridge.py --action write --type sleep --data '{...}'

输出: JSON (stdout)
"""

import argparse
import json
import os
import sqlite3
import sys
from datetime import datetime, timedelta
from pathlib import Path

# 兼容直接运行和通过 Electron 子进程调用
KARINOTE_DIR = Path(__file__).resolve().parent.parent.parent  # RedPar 的父目录
if str(KARINOTE_DIR) not in sys.path:
    sys.path.insert(0, str(KARINOTE_DIR))

# Karinote 数据目录
DATA_DIR = Path.home() / ".karinote"
DB_PATH = DATA_DIR / "karinote.db"


def get_conn() -> sqlite3.Connection:
    """连接 Karinote 数据库"""
    if not DB_PATH.exists():
        return None
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def query_sleep(days: int) -> list[dict]:
    """查询最近 N 天睡眠数据"""
    conn = get_conn()
    if not conn:
        return []
    date_from = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    rows = conn.execute(
        "SELECT * FROM sleep WHERE date >= ? ORDER BY date DESC", (date_from,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def query_mood(days: int) -> list[dict]:
    """查询最近 N 天心情数据"""
    conn = get_conn()
    if not conn:
        return []
    dt_from = (datetime.now() - timedelta(days=days)).isoformat()
    rows = conn.execute(
        "SELECT * FROM mood WHERE datetime >= ? ORDER BY datetime DESC", (dt_from,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def query_body(days: int) -> list[dict]:
    """查询最近 N 天身体/运动数据"""
    conn = get_conn()
    if not conn:
        return []
    date_from = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    rows = conn.execute(
        "SELECT * FROM body WHERE date >= ? ORDER BY date DESC", (date_from,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def query_track(days: int) -> list[dict]:
    """查询最近 N 天自定义追踪数据"""
    conn = get_conn()
    if not conn:
        return []
    date_from = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    rows = conn.execute(
        "SELECT * FROM track WHERE date >= ? ORDER BY date DESC", (date_from,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def query_all(days: int) -> dict:
    """查询所有类型的数据"""
    return {
        "sleep": query_sleep(days),
        "mood": query_mood(days),
        "body": query_body(days),
        "track": query_track(days),
    }


def write_sleep(data: dict) -> dict:
    """写入睡眠数据"""
    conn = get_conn()
    if not conn:
        return {"error": "数据库不存在"}
    try:
        conn.execute(
            """INSERT INTO sleep (date, total_min, deep_min, awake_min, rem_min, core_min, note)
               VALUES (:date, :total_min, :deep_min, :awake_min, :rem_min, :core_min, :note)
               ON CONFLICT(date) DO UPDATE SET
               total_min=excluded.total_min, deep_min=excluded.deep_min,
               awake_min=excluded.awake_min, rem_min=excluded.rem_min,
               core_min=excluded.core_min, note=excluded.note""",
            {
                "date": data.get("date", datetime.now().strftime("%Y-%m-%d")),
                "total_min": data.get("total_min", 0),
                "deep_min": data.get("deep_min", 0),
                "awake_min": data.get("awake_min", 0),
                "rem_min": data.get("rem_min", 0),
                "core_min": data.get("core_min", 0),
                "note": data.get("note", ""),
            },
        )
        conn.commit()
        return {"ok": True}
    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()


def write_body(data: dict) -> dict:
    """写入身体/运动数据"""
    conn = get_conn()
    if not conn:
        return {"error": "数据库不存在"}
    try:
        conn.execute(
            """INSERT INTO body (date, sport_min, skin, energy, coffee, note)
               VALUES (:date, :sport_min, :skin, :energy, :coffee, :note)
               ON CONFLICT(date) DO UPDATE SET
               sport_min=excluded.sport_min, skin=excluded.skin,
               energy=excluded.energy, coffee=excluded.coffee, note=excluded.note""",
            {
                "date": data.get("date", datetime.now().strftime("%Y-%m-%d")),
                "sport_min": data.get("sport_min", 0),
                "skin": data.get("skin", ""),
                "energy": data.get("energy", 0),
                "coffee": data.get("coffee", 0),
                "note": data.get("note", ""),
            },
        )
        conn.commit()
        return {"ok": True}
    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()


def write_mood(data: dict) -> dict:
    """写入心情数据"""
    conn = get_conn()
    if not conn:
        return {"error": "数据库不存在"}
    try:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        conn.execute(
            "INSERT INTO mood (datetime, mood, note) VALUES (?, ?, ?)",
            (data.get("datetime", now), data.get("mood", ""), data.get("note", "")),
        )
        conn.commit()
        return {"ok": True}
    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()


def write_track(data: dict) -> dict:
    """写入自定义追踪数据"""
    conn = get_conn()
    if not conn:
        return {"error": "数据库不存在"}
    try:
        conn.execute(
            "INSERT INTO track (date, name, value, note) VALUES (?, ?, ?, ?)",
            (
                data.get("date", datetime.now().strftime("%Y-%m-%d")),
                data.get("name", ""),
                data.get("value", 0),
                data.get("note", ""),
            ),
        )
        conn.commit()
        return {"ok": True}
    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()


def main():
    parser = argparse.ArgumentParser(description="Karinote Data Bridge")
    parser.add_argument("--action", choices=["query", "write"], required=True)
    parser.add_argument(
        "--type",
        choices=["sleep", "mood", "body", "track", "all"],
        help="数据类型",
    )
    parser.add_argument("--days", type=int, default=7, help="查询天数（默认7天）")
    parser.add_argument("--data", type=str, help="写入数据 JSON")
    args = parser.parse_args()

    # 检查数据库是否存在
    if not DB_PATH.exists():
        print(json.dumps({"error": f"数据库不存在: {DB_PATH}"}))
        sys.exit(0)

    if args.action == "query":
        if args.type == "all":
            result = query_all(args.days)
        elif args.type == "sleep":
            result = query_sleep(args.days)
        elif args.type == "mood":
            result = query_mood(args.days)
        elif args.type == "body":
            result = query_body(args.days)
        elif args.type == "track":
            result = query_track(args.days)
        else:
            result = {"error": f"未知类型: {args.type}"}
        print(json.dumps(result, ensure_ascii=False, default=str))

    elif args.action == "write":
        if not args.data:
            print(json.dumps({"error": "写入操作需要 --data 参数"}))
            sys.exit(0)
        try:
            data = json.loads(args.data)
        except json.JSONDecodeError as e:
            print(json.dumps({"error": f"JSON 解析失败: {e}"}))
            sys.exit(0)

        if args.type == "sleep":
            result = write_sleep(data)
        elif args.type == "body":
            result = write_body(data)
        elif args.type == "mood":
            result = write_mood(data)
        elif args.type == "track":
            result = write_track(data)
        else:
            result = {"error": f"不支持写入类型: {args.type}"}
        print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
