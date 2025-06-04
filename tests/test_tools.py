# inspired by https://github.com/EVERSE-ResearchSoftware/indicators/blob/main/tests/test_dimensions_and_indicators.py
from helpers import validate_json_files_using_schema


def test_tools():
    """
    Validates all JSON files in the 'indicators/' directory against the
    local JSON Schema file (indicator_validation_schema.json).
    """
    validate_json_files_using_schema(
        schema_file_path="tests/tools_validation_schema.json",
        json_file_path="data/software-tools",
    )

