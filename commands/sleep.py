import argparse
from db import get_conn
from utils import parse_date, today, minutes_to_hm, print_table, days_ago


def add_sleep(args):
    date = parse_date(args.date) if args.date else today()
    conn = get_conn()
    conn.execute(
        "INSERT OR REPLACE INTO sleep (date, total_min, deep_min, awake_min, rem_min, core_min, note) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        (date, args.total, args.deep or 0, args.awake or 0, args.rem or 0, args.core or 0, args.note),
    )
    conn.commit()
    conn.close()
    print(f"[OK] {date} sleep: {minutes_to_hm(args.total)}" +
          (f", deep {args.deep}m" if args.deep else ""))


def show_sleep(args):
    date = parse_date(args.date)
    conn = get_conn()
    row = conn.execute("SELECT * FROM sleep WHERE date = ?", (date,)).fetchone()
    conn.close()
    if not row:
        print(f"  {date} no record")
        return
    print(f"date: {row['date']}")
    print(f"  total: {minutes_to_hm(row['total_min'])}")
    if row["deep_min"]:
        print(f"  deep: {row['deep_min']}m")
    if row["rem_min"]:
        print(f"  rem:  {row['rem_min']}m")
    if row["core_min"]:
        print(f"  core: {row['core_min']}m")
    if row["awake_min"]:
        print(f"  awake: {row['awake_min']}m")
    if row["note"]:
        print(f"  note: {row['note']}")


def sleep_stats(args):
    days = args.days or 7
    since = days_ago(days)
    conn = get_conn()
    rows = conn.execute(
        "SELECT date, total_min, deep_min FROM sleep WHERE date >= ? ORDER BY date",
        (since,),
    ).fetchall()
    conn.close()
    if not rows:
        print(f"  no sleep records in last {days} days")
        return
    headers = ["date", "total", "deep"]
    data = [[r["date"], minutes_to_hm(r["total_min"]), f"{r['deep_min']}m"] for r in rows]
    print_table(headers, data)
    avg_total = sum(r["total_min"] for r in rows) / len(rows)
    avg_deep = sum(r["deep_min"] for r in rows) / len(rows)
    print(f"  avg   {minutes_to_hm(int(avg_total))}  {avg_deep:.1f}m")


def register(parent_subparsers):
    parser = parent_subparsers.add_parser("sleep", help="睡眠记录")
    sub = parser.add_subparsers(dest="sleep_cmd")

    p = sub.add_parser("record", help="记录睡眠")
    p.add_argument("--date", help="日期 YYYY-MM-DD")
    p.add_argument("--total", type=int, required=True, help="总睡眠分钟")
    p.add_argument("--deep", type=int, help="深睡分钟")
    p.add_argument("--awake", type=int, help="清醒分钟")
    p.add_argument("--rem", type=int, help="REM分钟")
    p.add_argument("--core", type=int, help="核心睡眠分钟")
    p.add_argument("--note", help="备注")
    p.set_defaults(func=add_sleep)

    sp = sub.add_parser("stats", help="睡眠统计")
    sp.add_argument("--days", type=int, default=7, help="天数")
    sp.set_defaults(func=sleep_stats)

    sv = sub.add_parser("show", help="查看某天睡眠")
    sv.add_argument("--date", required=True, help="日期 YYYY-MM-DD")
    sv.set_defaults(func=show_sleep)
