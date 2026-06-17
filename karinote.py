#!/usr/bin/env python3
import sys
import argparse
from db import init_db
from commands import sleep, mood


def main():
    init_db()
    parser = argparse.ArgumentParser(prog="karinote", description="Karinote - 私人状态记录本")
    sub = parser.add_subparsers(dest="command")

    cmds = {
        "sleep": sleep.register(sub),
        "mood": mood.register(sub),
    }

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        sys.exit(0)

    if not hasattr(args, "func"):
        p = cmds.get(args.command)
        if p:
            p.print_help()
        sys.exit(0)

    args.func(args)


if __name__ == "__main__":
    main()
