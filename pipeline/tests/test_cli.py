import json

import pytest

from etl.__main__ import main
from etl.generate import generate


def test_run_builds_sample_summary(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    main(["run", "--out", str(tmp_path / "sales.json")])
    summary = json.loads((tmp_path / "sales.json").read_text())
    assert summary["source"] == "sample"
    assert (tmp_path / "data" / "raw" / "fact_sales.csv").exists()


def test_run_marks_imported_data(tmp_path):
    generate(tmp_path / "export")
    main(["run", "--input", str(tmp_path / "export"), "--out", str(tmp_path / "sales.json")])
    assert json.loads((tmp_path / "sales.json").read_text())["source"] == "import"


def test_invalid_input_exits_with_error_and_writes_nothing(tmp_path, capsys):
    with pytest.raises(SystemExit) as exit_info:
        main(["run", "--input", str(tmp_path / "empty"), "--out", str(tmp_path / "sales.json")])
    assert exit_info.value.code == 1
    assert "dim_store.csv is missing" in capsys.readouterr().err
    assert not (tmp_path / "sales.json").exists()
