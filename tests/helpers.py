"""
Helper functions for validating JSON files against schemas.

This module provides utilities for loading JSON schemas and validating JSON files.
It includes dynamic fetching of quality dimensions and indicators from the EVERSE 
indicators API to ensure validation uses the most up-to-date lists.

Dimensions: Always validated (with fallback if API unavailable)
Indicators: Validated only if API is available (skipped otherwise)

Adapted from: https://github.com/EVERSE-ResearchSoftware/indicators/blob/main/tests/helpers.py
"""

import json
import glob
import pytest
from jsonschema import validate, ValidationError
import os
import urllib.request
import urllib.error


# Fallback list of dimensions if API is not accessible
FALLBACK_DIMENSIONS = [
    "dim:compatibility",
    "dim:fairness",
    "dim:flexibility",
    "dim:functional_suitability",
    "dim:interaction_capability",
    "dim:maintainability",
    "dim:performance_efficiency",
    "dim:reliability",
    "dim:safety",
    "dim:security",
    "dim:sustainability",
]


def fetch_quality_indicators():
    """
    Fetch quality indicators from the EVERSE indicators API.
    
    Attempts to fetch the current list of quality indicators from the EVERSE 
    indicators API. If the API is unavailable, returns None (which causes
    indicator validation to be skipped).
    
    API Endpoint: https://everse.software/indicators/api/indicators.json
    
    Returns:
        list or None: Indicator URIs if successful, None if API unavailable.
                     Example: ["https://w3id.org/everse/i/no_leaked_credentials", ...]
    
    Notes:
        - Handles both list and @graph-style JSON-LD responses
        - Extracts full URIs from @id fields
        - Returns None on any error (no fallback for indicators)
        - Timeout set to 5 seconds to avoid hanging tests
    """
    api_url = "https://everse.software/indicators/api/indicators.json"
    
    try:
        with urllib.request.urlopen(api_url, timeout=5) as response:
            data = json.loads(response.read().decode("utf-8"))

        indicators_identifiers = []

        indicators_list = data.get("indicators", [])
        for indicator in indicators_list:
            if isinstance(indicator, dict) and "identifier" in indicator:
                indicators_identifiers.append(indicator["identifier"]["@id"])

        if indicators_identifiers:
            print(f"Successfully fetched {len(indicators_identifiers)} indicators from {api_url}")
            return indicators_identifiers
        else:
            print(f"No indicators found in API response from {api_url}")
            return None

    except (
        urllib.error.URLError,
        urllib.error.HTTPError,
        json.JSONDecodeError,
        TimeoutError,
    ) as e:
        raise RuntimeError(f"Could not fetch indicators from {api_url}: {e}")


def fetch_quality_dimensions():
    """
    Fetch quality dimensions from the EVERSE indicators API with offline fallback.
    
    Attempts to fetch the current list of quality dimensions from the EVERSE 
    indicators API. If the API is unavailable (no internet connection or API error),
    falls back to a hardcoded list of dimensions.
    
    API Endpoint: https://everse.software/indicators/api/dimensions.json
    
    Returns:
        list: Dimension identifiers in the format "dim:<dimension_name>".
              Example: ["dim:compatibility", "dim:fairness", ...]
    
    Notes:
        - Handles both list and @graph-style JSON-LD responses
        - Extracts dimension names from full URIs (e.g., extracts "fairness" from 
          "https://w3id.org/everse/i/dimensions/fairness")
        - Prints status messages during fetch attempt
        - Timeout set to 5 seconds to avoid hanging tests
    """
    api_url = "https://everse.software/indicators/api/dimensions.json"
    
    try:
        with urllib.request.urlopen(api_url, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            
        # Extract dimension identifiers from the API response
        dimensions_identifiers = []
        
        dimensions = data.get('dimensions', [])
        for item in dimensions:
            if isinstance(item, dict) and 'identifier' in item:
                dim_id = item['identifier']
                if '/' in dim_id:
                    dim_name = dim_id.split('/')[-1]
                    dimensions_identifiers.append(f"dim:{dim_name}")
                else:
                    dimensions_identifiers.append(dim_id if dim_id.startswith('dim:') else f"dim:{dim_id}")
        
        if dimensions_identifiers:
            print(f"Successfully fetched {len(dimensions_identifiers)} dimensions from {api_url}")
            return dimensions_identifiers
        else:
            print(f"No dimensions found in API response from {api_url}")
            
    except (urllib.error.URLError, urllib.error.HTTPError, json.JSONDecodeError, TimeoutError) as e:
        print(f"Could not fetch dimensions from {api_url}: {e}")
    
    print(f"Using fallback dimension list:\n{FALLBACK_DIMENSIONS}")
    return FALLBACK_DIMENSIONS


def load_local_schema(schema_path):
    """
    Load JSON schema from file and update it with current quality dimensions and indicators.
    
    Loads the JSON schema file and dynamically updates:
    - Quality dimension enum with latest values from EVERSE API (or fallback)
    - Quality indicator enum with latest values from EVERSE API (or makes it optional if unavailable)
    
    This ensures validation always uses current dimension and indicator definitions.
    
    Args:
        schema_path (str): Absolute path to the JSON schema file
        
    Returns:
        dict: The loaded and updated JSON schema
        
    Raises:
        pytest.Failed: If schema file not found or invalid JSON
        
    Notes:
        - Calls fetch_quality_dimensions() to get current dimensions (with fallback)
        - Calls fetch_quality_indicators() to get current indicators (no fallback)
        - If indicators unavailable, removes enum validation (allows any URI)
        - Prints progress messages during schema loading
    """
    print(f"Attempting to load local schema from: {schema_path}")
    if not os.path.exists(schema_path):
        pytest.fail(f"Schema file not found at {schema_path}", pytrace=False)
    try:
        with open(schema_path, "r") as f:
            schema_data = json.load(f)
        
        # Update the quality dimension enums dynamically
        dimensions = fetch_quality_dimensions()
        
        # Update the qualityDimensionObject definition if it exists
        if ('definitions' in schema_data and 
            'qualityDimensionObject' in schema_data['definitions'] and
            'properties' in schema_data['definitions']['qualityDimensionObject'] and
            '@id' in schema_data['definitions']['qualityDimensionObject']['properties']):
            
            schema_data['definitions']['qualityDimensionObject']['properties']['@id']['enum'] = dimensions
            print(f"Updated schema with {len(dimensions)} quality dimensions")
        
        # Update the quality indicator enums dynamically
        indicators = fetch_quality_indicators()
        
        # Update the qualityIndicatorObject definition if it exists
        if ('definitions' in schema_data and 
            'qualityIndicatorObject' in schema_data['definitions'] and
            'properties' in schema_data['definitions']['qualityIndicatorObject'] and
            '@id' in schema_data['definitions']['qualityIndicatorObject']['properties']):
            
            if indicators is not None:
                # Set the enum with fetched indicators
                schema_data['definitions']['qualityIndicatorObject']['properties']['@id']['enum'] = indicators
                print(f"Updated schema with {len(indicators)} quality indicators")
            else:
                # Remove enum validation if indicators unavailable - allow any URI
                schema_data['definitions']['qualityIndicatorObject']['properties']['@id'].pop('enum', None)
                print("Indicator validation skipped (API unavailable)")
        
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
    Validate all JSON files in a directory against a JSON schema.
    
    Loads the schema (with dynamic dimension updates), then validates each JSON file
    in the specified directory. Collects all validation errors and fails the test
    if any files are invalid.
    
    Args:
        schema_file_path (str): Path to the JSON schema file
        json_file_path (str): Directory containing JSON files to validate
        
    Raises:
        pytest.skip: If no JSON files found in the directory
        AssertionError: If any JSON files fail validation
        
    Notes:
        - Uses glob pattern to find all *.json files
        - Validates each file independently
        - Prints progress for each file validation
        - Collects all errors before failing (doesn't stop at first error)
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