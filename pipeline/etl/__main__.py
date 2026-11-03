"""Command line: python -m etl <command>. Run from the pipeline folder."""

import argparse
import sys
from pathlib import Path

from .census import build as build_census
from .generate import generate
from .nearby import build as build_nearby
from .transform import transform, write_summary
from .validate import Report, validate

ROOT = Path(__file__).parent.parent.parent
APP_DATA = ROOT / "src" / "data" / "generated" / "sales.json"
CENSUS_DATA = ROOT / "src" / "data" / "generated" / "fsaCensus.json"
NEARBY_DATA = ROOT / "src" / "data" / "generated" / "nearby.json"
STORES_CSV = ROOT / "Research" / "data" / "vancouver-sdm-stores.csv"


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

    census = commands.add_parser("census", help="fetch 2021 census profiles for each store's postal area (needs internet)")
    census.add_argument("--out", type=Path, default=CENSUS_DATA, help="profile file (default: the app's census file)")

    near = commands.add_parser("nearby", help="find pharmacies and supermarkets near each store in OpenStreetMap (needs internet)")
    near.add_argument("--out", type=Path, default=NEARBY_DATA, help="places file (default: the app's nearby file)")

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
    elif args.command == "census":
        areas = build_census(STORES_CSV, args.out)
        print(f"Census profiles for {len(areas)} postal areas written to {args.out}")
    elif args.command == "nearby":
        stores = build_nearby(STORES_CSV, args.out)
        print(f"Nearby places for {len(stores)} stores written to {args.out}")
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
