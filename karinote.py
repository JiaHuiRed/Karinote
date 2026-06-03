#!/usr/bin/env python3
import sys
import argparse
from db import init_db
from commands import sleep, mood


def main():
    init_db()
    parser = argparse.ArgumentParser(prog="karinote", description="Karinote - 私人状态记录本")
    subparsers = parser.add_subparsers(dest="command")

    sleep.register(subparsers)
    mood.register(subparsers)

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        sys.exit(0)

    if not hasattr(args, "func"):
        # no subcommand given (e.g. just `karinote sleep`), show parent help
        sub = [a for a in parser._actions if hasattr(a, "_parser_class") and a.dest == args.command]
        if sub:
            sub[0]._parser_class.print_help()
        sys.exit(0)

    args.func(args)


if __name__ == "__main__":
    main()
