"""
copy of the original file:
https://github.com/EVERSE-ResearchSoftware/indicators/blob/main/tests/helpers.py
"""

import json
import glob
import pytest
from jsonschema import validate, ValidationError
import os


def load_local_schema(schema_path):
    """Loads the JSON schema from a local file."""
    print(f"Attempting to load local schema from: {schema_path}")
    if not os.path.exists(schema_path):
        pytest.fail(f"Schema file not found at {schema_path}", pytrace=False)
    try:
        with open(schema_path, "r") as f:
            schema_data = json.load(f)
        print("Successfully loaded local schema.")
        return schema_data
    except json.JSONDecodeError as e:
        pytest.fail(
            f"Failed to decode JSON from schema file {schema_path}: {e}", pytrace=False
        )
    except Exception as e:
        pytest.fail(
            f"An unexpected error occurred while loading schema {schema_path}: {e}",
            pytrace=False,
        )


def validate_json_files_using_schema(schema_file_path, json_file_path):
    """
    Validates all JSON files in the 'json_file_path/' directory against the
    local JSON Schema file (schema_file_path).
    """

    json_files = glob.glob(f"{json_file_path}/*.json")

    if not json_files:
        pytest.skip(f"No json files found in {json_file_path}/ directory.")

    print(f"\nLoading the schema from {schema_file_path}...")
    schema = load_local_schema(schema_file_path)
    print("Schema loaded successfully.")

    validation_errors = []

    for json_file_name in json_files:
        print(f"\nValidating {json_file_name} against the schema...")
        try:
            with open(json_file_name, "r") as f:
                instance = json.load(f)

            validate(instance=instance, schema=schema)
            print(f"{json_file_name} is valid against the the schema.")

        except json.JSONDecodeError as e:
            error_message = f"{json_file_name}: Invalid JSON - {e}"
            print(f"Error: {error_message}")
            validation_errors.append(error_message)
        except ValidationError as e:
            error_message = f"{json_file_name}: Schema validation failed - Path: {'/'.join(map(str, e.path))} - Message: {e.message}"
            print(f"Error: {error_message}")
            validation_errors.append(error_message)
        except Exception as e:
            error_message = f"{json_file_name}: Unexpected error - {e}"
            print(f"Error: {error_message}")
            validation_errors.append(error_message)

    assert not validation_errors, (
        "The schema validation failed for one or more files:\n"
        + "\n".join(validation_errors)
    )