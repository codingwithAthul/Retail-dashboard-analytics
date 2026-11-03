"""Command line: python -m etl <command>. Run from the pipeline folder."""

import argparse
import sys
from pathlib import Path

from .generate import generate
from .transform import transform, write_summary
from .validate import Report, validate

APP_DATA = Path(__file__).parent.parent.parent / "src" / "data" / "generated" / "sales.json"


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

    run = commands.add_parser("run", help="generate (or import), validate and build the dashboard data file")
    run.add_argument("--input", type=Path, help="folder with real store exports; omit to use sample data")
    run.add_argument("--out", type=Path, default=APP_DATA, help="summary file (default: the app's data file)")

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
    elif args.command == "run":
        folder = args.input
        if folder is None:
            folder = Path("data/raw")
            generate(folder)
        report = validate(folder)
        print_report(report)
        if not report.ok:
            sys.exit(1)
        write_summary(transform(report.tables, "import" if args.input else "sample"), args.out)
        print(f"Dashboard data written to {args.out}")


if __name__ == "__main__":
    main()
