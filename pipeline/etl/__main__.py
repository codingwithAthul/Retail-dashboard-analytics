"""Command line: python -m etl <command>. Run from the pipeline folder."""

import argparse
import sys
from pathlib import Path

from .generate import generate
from .validate import Report, validate


def print_report(report: Report) -> None:
    for warning in report.warnings:
        print(f"warning: {warning}")
    for error in report.errors:
        print(f"error: {error}", file=sys.stderr)


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(prog="python -m etl", description="Store Insights data pipeline")
    commands = parser.add_subparsers(dest="command", required=True)

    gen = commands.add_parser("generate", help="write synthetic sample data as raw CSVs")
    gen.add_argument("--out", type=Path, default=Path("data/raw"), help="folder for the CSVs (default: data/raw)")

    check = commands.add_parser("validate", help="check raw CSVs against the schema")
    check.add_argument("--input", type=Path, default=Path("data/raw"), help="folder with the CSVs (default: data/raw)")

    args = parser.parse_args(argv)
    if args.command == "generate":
        generate(args.out)
        print(f"Sample data written to {args.out}")
    elif args.command == "validate":
        report = validate(args.input)
        print_report(report)
        if not report.ok:
            sys.exit(1)
        print(f"{args.input}: valid")


if __name__ == "__main__":
    main()
