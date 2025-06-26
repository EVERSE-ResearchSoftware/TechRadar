import pytest
from jsonschema import validate, ValidationError
from helpers import load_local_schema

# Load the schema
schema = load_local_schema("tests/tools_validation_schema.json")

# 1. A tool that should pass validation
valid_tool = {
    "@id": "https://example.com/tool/valid",
    "schema:name": "Valid Tool",
    "schema:description": "This is a valid tool.",
    "schema:url": "https://example.com/tool/valid",
    "schema:license": "https://opensource.org/licenses/MIT",
    "schema:applicationCategory": {"@id": "rs:AnalysisCode"},
    "rs:hasQualityDimension": {"@id": "rs:FAIRness"}
}

# 2. Tools that should not pass validation
invalid_tools = [
    # Missing required property: schema:name
    {
        "@id": "https://example.com/tool/invalid1",
        "schema:description": "This tool is missing a name.",
        "schema:url": "https://example.com/tool/invalid1",
        "schema:license": "https://opensource.org/licenses/MIT",
        "schema:applicationCategory": {"@id": "rs:AnalysisCode"},
        "rs:hasQualityDimension": {"@id": "rs:FAIRness"}
    },
    # Invalid applicationCategory
    {
        "@id": "https://example.com/tool/invalid2",
        "schema:name": "Invalid Category Tool",
        "schema:description": "This tool has an invalid application category.",
        "schema:url": "https://example.com/tool/invalid2",
        "schema:license": "https://opensource.org/licenses/MIT",
        "schema:applicationCategory": {"@id": "rs:InvalidCategory"},
        "rs:hasQualityDimension": {"@id": "rs:FAIRness"}
    },
    # Invalid quality dimension as a string
    {
        "@id": "https://example.com/tool/invalid3",
        "schema:name": "Invalid Quality Dimension",
        "schema:description": "This tool has an invalid quality dimension.",
        "schema:url": "https://example.com/tool/invalid3",
        "schema:license": "https://opensource.org/licenses/MIT",
        "schema:applicationCategory": {"@id": "rs:AnalysisCode"},
        "rs:hasQualityDimension": ["rs:InvalidDimension"]
    },
    # Invalid quality dimension as an object without @id
    {
        "@id": "https://example.com/tool/invalid4",
        "schema:name": "Invalid Quality Dimension Object",
        "schema:description": "This tool has an invalid quality dimension object.",
        "schema:url": "https://example.com/tool/invalid4",
        "schema:license": "https://opensource.org/licenses/MIT",
        "schema:applicationCategory": {"@id": "rs:AnalysisCode"},
        "rs:hasQualityDimension": {"name": "rs:Documentation"}
    }
]


def test_valid_tool():
    """Tests that a valid tool passes validation."""
    validate(instance=valid_tool, schema=schema)


@pytest.mark.parametrize("tool", invalid_tools)
def test_invalid_tools(tool):
    """Tests that invalid tools fail validation."""
    with pytest.raises(ValidationError):
        validate(instance=tool, schema=schema)
