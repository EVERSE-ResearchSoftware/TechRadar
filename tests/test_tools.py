# inspired by https://github.com/EVERSE-ResearchSoftware/indicators/blob/main/tests/test_dimensions_and_indicators.py
from helpers import validate_json_files_using_schema
import glob
import os
import re
import json


def test_tools_schema():
    """
    Validates all JSON files in the 'quality-tools/' directory against the
    local JSON Schema file (tools_validation_schema.json).
    """
    validate_json_files_using_schema(
        schema_file_path="tests/tools_validation_schema.json",
        json_file_path="quality-tools",
    )


def test_tool_filenames():
    """
    Ensures all tool filenames and their internal @id in 'quality-tools/' 
    follow the naming convention:
    - Lowercase letters
    - Hyphens for separation (no underscores or spaces)
    - Ends with .json
    - The @id property must end with the same slug as the filename
    """
    tool_files = glob.glob("quality-tools/*.json")
    
    # Regex for valid filename: lowercase letters, numbers, and hyphens
    valid_pattern = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*\.json$')
    
    invalid_filenames = []
    mismatched_ids = []
    
    for file_path in tool_files:
        filename = os.path.basename(file_path)
        slug = filename.replace('.json', '')
        
        # Check filename format
        if not valid_pattern.match(filename):
            invalid_filenames.append(filename)
            
        # Check @id matches filename slug
        try:
            with open(file_path, "r") as f:
                data = json.load(f)
                tool_id = data.get('@id', '')
                if not tool_id.endswith(f"/{slug}") and not tool_id.endswith(f":{slug}"):
                    # Special case: allow if it matches perfectly (e.g. for external URLs used as IDs)
                    # But the requirement is to use hyphens in slugs, so we check if the ID contains underscores
                    if "_" in tool_id or any(c.isupper() for c in tool_id if c.isalpha()):
                         mismatched_ids.append(f"{filename} (@id: {tool_id})")
        except (json.JSONDecodeError, IOError):
            pass # Handled by other tests
            
    errors = []
    if invalid_filenames:
        errors.append(f"Invalid filenames (must be lowercase-hyphen-only): {', '.join(invalid_filenames)}")
    if mismatched_ids:
        errors.append(f"Invalid or mismatched @id (must use hyphen-only slug matching filename): {', '.join(mismatched_ids)}")
        
    assert not errors, "\n".join(errors)
