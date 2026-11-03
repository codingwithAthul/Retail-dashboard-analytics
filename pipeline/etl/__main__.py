"""Command line: python -m etl <command>. Run from the pipeline folder."""

import argparse
from pathlib import Path

from .generate import generate


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(prog="python -m etl", description="Store Insights data pipeline")
    commands = parser.add_subparsers(dest="command", required=True)

    gen = commands.add_parser("generate", help="write synthetic sample data as raw CSVs")
    gen.add_argument("--out", type=Path, default=Path("data/raw"), help="folder for the CSVs (default: data/raw)")

    args = parser.parse_args(argv)
    if args.command == "generate":
        generate(args.out)
        print(f"Sample data written to {args.out}")


if __name__ == "__main__":
    main()
