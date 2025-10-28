import pytest
from jsonschema import validate, ValidationError
from helpers import load_local_schema

# Load the schema
schema = load_local_schema("tests/tools_validation_schema.json")

# 1. A tool that should pass validation
valid_tool = {
    "@context": "https://w3id.org/everse/rs#",
    "@id": "https://example.com/tool/valid",
    "name": "Valid Tool",
    "description": "This is a valid tool.",
    "url": "https://example.com/tool/valid",
    "license": "https://opensource.org/licenses/MIT",
    "applicationCategory": {"@id": "rs:AnalysisCode"},
    "hasQualityDimension": {"@id": "dim:fairness"}
}

# 2. Tools that should not pass validation
invalid_tools = [
    # Missing required property: name
    {
        "@context": "https://w3id.org/everse/rs#",
        "@id": "https://example.com/tool/invalid1",
        "description": "This tool is missing a name.",
        "url": "https://example.com/tool/invalid1",
        "license": "https://opensource.org/licenses/MIT",
        "applicationCategory": {"@id": "rs:AnalysisCode"},
        "hasQualityDimension": {"@id": "dim:fairness"}
    },
    # Missing required property: context
    {
        "@id": "https://example.com/tool/invalid1",
        "description": "This tool is missing a name.",
        "url": "https://example.com/tool/invalid1",
        "license": "https://opensource.org/licenses/MIT",
        "applicationCategory": {"@id": "rs:AnalysisCode"},
        "hasQualityDimension": {"@id": "dim:fairness"}
    },
    # Missing required property: description
    {
        "@context": "https://w3id.org/everse/rs#",
        "@id": "https://example.com/tool/invalid2",
        "name": "Tool without description",
        "url": "https://example.com/tool/invalid2",
        "license": "https://opensource.org/licenses/MIT",
        "applicationCategory": {"@id": "rs:AnalysisCode"},
        "hasQualityDimension": {"@id": "dim:fairness"}
    },
    # Missing required property: license
    {
        "@context": "https://w3id.org/everse/rs#",
        "@id": "https://example.com/tool/invalid3",
        "name": "Tool without license",
        "description": "This tool is missing a license.",
        "url": "https://example.com/tool/invalid3",
        "applicationCategory": {"@id": "rs:AnalysisCode"},
        "hasQualityDimension": {"@id": "dim:fairness"}
    },
    # Missing required property: url
    {
        "@context": "https://w3id.org/everse/rs#",
        "@id": "https://example.com/tool/invalid4",
        "name": "Tool without url",
        "description": "This tool is missing a url.",
        "license": "https://opensource.org/licenses/MIT",
        "applicationCategory": {"@id": "rs:AnalysisCode"},
        "hasQualityDimension": {"@id": "dim:fairness"}
    },
    # Invalid applicationCategory
    {
        "@context": "https://w3id.org/everse/rs#",
        "@id": "https://example.com/tool/invalid5",
        "name": "Invalid Category Tool",
        "description": "This tool has an invalid application category.",
        "url": "https://example.com/tool/invalid5",
        "license": "https://opensource.org/licenses/MIT",
        "applicationCategory": {"@id": "rs:InvalidCategory"},
        "hasQualityDimension": {"@id": "dim:fairness"}
    },
    # Invalid quality dimension as a string
    {
        "@context": "https://w3id.org/everse/rs#",
        "@id": "https://example.com/tool/invalid6",
        "name": "Invalid Quality Dimension",
        "description": "This tool has an invalid quality dimension.",
        "url": "https://example.com/tool/invalid6",
        "license": "https://opensource.org/licenses/MIT",
        "applicationCategory": {"@id": "rs:AnalysisCode"},
        "hasQualityDimension": ["dim:InvalidDimension"]
    },
    # Invalid quality dimension as an object without @id
    {
        "@context": "https://w3id.org/everse/rs#",
        "@id": "https://example.com/tool/invalid7",
        "name": "Invalid Quality Dimension Object",
        "description": "This tool has an invalid quality dimension object.",
        "url": "https://example.com/tool/invalid7",
        "license": "https://opensource.org/licenses/MIT",
        "applicationCategory": {"@id": "rs:AnalysisCode"},
        "hasQualityDimension": {"name": "dim:documentation"}
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
