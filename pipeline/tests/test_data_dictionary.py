import re
from pathlib import Path

import pytest

from etl.schema import TABLES

DOC = (Path(__file__).parent.parent.parent / "docs" / "data-dictionary.md").read_text()


def documented_columns(table_name: str) -> list[str]:
    section = re.search(rf"^### {table_name}\n(.*?)(?=^##)", DOC + "\n## end", re.S | re.M)
    assert section, f"{table_name} is missing from the data dictionary"
    return re.findall(r"^\| `(\w+)` \|", section.group(1), re.M)


@pytest.mark.parametrize("name", TABLES)
def test_data_dictionary_matches_schema(name):
    assert documented_columns(name) == TABLES[name].column_names
