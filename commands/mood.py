import argparse
from db import get_conn
from utils import today, now_iso, days_ago


def add_mood(args):
    dt = now_iso()
    conn = get_conn()
    conn.execute("INSERT INTO mood (datetime, mood, note) VALUES (?, ?, ?)", (dt, args.mood, args.note))
    conn.commit()
    conn.close()
    print(f"[OK] 心情：{args.mood}" + (f" - {args.note}" if args.note else ""))


def mood_today(args):
    conn = get_conn()
    rows = conn.execute(
        "SELECT datetime, mood, note FROM mood WHERE datetime LIKE ? ORDER BY datetime",
        (f"{today()}%",),
    ).fetchall()
    conn.close()
    if not rows:
        print("  今天还没有心情记录")
        return
    for r in rows:
        t = r["datetime"].split(" ")[1] if " " in r["datetime"] else ""
        print(f"  {t}  {r['mood']}" + (f"  {r['note']}" if r["note"] else ""))


def mood_stats(args):
    days = args.days or 7
    since = days_ago(days)
    conn = get_conn()
    rows = conn.execute(
        "SELECT mood, COUNT(*) as cnt FROM mood WHERE datetime >= ? GROUP BY mood ORDER BY cnt DESC",
        (since,),
    ).fetchall()
    conn.close()
    if not rows:
        print(f"  最近 {days} 天无心情记录")
        return
    print(f"  最近 {days} 天心情分布：")
    for r in rows:
        print(f"    {r['mood']}  {r['cnt']}次")


def register(parent_subparsers):
    parser = parent_subparsers.add_parser("mood", help="心情记录")
    sub = parser.add_subparsers(dest="mood_cmd")

    p = sub.add_parser("log", help="记录心情")
    p.add_argument("--mood", required=True, help="心情标签")
    p.add_argument("--note", help="备注")
    p.set_defaults(func=add_mood)

    sp = sub.add_parser("today", help="今天心情")
    sp.set_defaults(func=mood_today)

    st = sub.add_parser("stats", help="心情统计")
    st.add_argument("--days", type=int, default=7, help="天数")
    st.set_defaults(func=mood_stats)
