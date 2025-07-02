import json
import os
from pathlib import Path
from datetime import datetime

def get_items(field):
    """
    Extract items from a field that can be:
    field e.g applicationCategory, hasqualityDimension 
    - a dict with '@id' e.g { "@id": "rs:Maintainability", "@type": "@id" }
    - a list of dicts with '@id' e.g. [
        { "@id": "rs:Maintainability", "@type": "@id" },
        { "@id": "rs:Sustainability", "@type": "@id" },
        { "@id": "rs:Reliability", "@type": "@id" }
  ]
    - a list of strings e.g [ "Maintainability", "Sustainability"]
    - a single string  e.g "Maintainability
    Returns a list of strings.
    """
    items = []
    if isinstance(field, dict):
        if '@id' in field:
            raw_id = field['@id'].split('/')[-1]
            items.append(raw_id.split(':')[-1])
        else:
            pass
    elif isinstance(field, list):
        for item in field:
            if isinstance(item, dict) and '@id' in item:
                raw_id = item['@id'].split('/')[-1]
                items.append(raw_id.split(':')[-1])
            elif isinstance(item, str):
                items.append(item)
    elif isinstance(field, str):
        items.append(field)
    return items

def generate_markdown(json_ld_file, output_dir):
    """Generates markdown from a JSON-LD file."""
    with open(json_ld_file, 'r') as file:
        json_ld = json.load(file)

    # Fetch title
    title = json_ld.get('schema:name', 'Unknown Title')
    # Fetch url
    url = json_ld.get('schema:url', '')
    # Fetch description
    description = json_ld.get('schema:description', "No description available")

    # Extract applicationCategory
    application_category_field = json_ld.get('schema:applicationCategory', [])
    application_categories = get_items(application_category_field)
    # TODO: Need to modify conditions for tools with multi-tier case
    if "AnalysisCode" in application_categories:
        application_category = "AnalysisCode"
    elif application_categories:
        application_category = application_categories[0]
    else:
        application_category = "Unknown"

    if not application_categories:
        print('Tool is missing application category in Json_LD')

    # Extract hasQualityDimension
    quality_dimension_field = json_ld.get('rs:hasQualityDimension', [])
    quality_dimensions = get_items(quality_dimension_field)
    # TODO: Need to modify conditions for tools with multi-quality dimensions case
    if not quality_dimensions:
        print('Tool is missing quality dimension in Json_LD')

    # Extract tags
    tags = []
    if 'rs:howToUse' in json_ld:
        how_to_use = json_ld['rs:howToUse']
        tags.extend(how_to_use)  # Add howToUse tags, e.g., 'online-service', 'CI/CD'

    if 'schema:license' in json_ld:
        license_info = json_ld['schema:license']
        if isinstance(license_info, dict) and '@id' in license_info:
            tags.append(license_info['@id'].split('/')[-1])  # Extracts exact license type, e.g., 'Apache-2.0'
    
    if 'rs:appliesToProgrammingLanguage' in json_ld:
        programming_language = json_ld['rs:appliesToProgrammingLanguage']
        tags.extend(programming_language)


    # Prepare markdown content; join lists as comma-separated strings
    markdown_content = f"""---
title: "{title}"
rings: {application_category}
segments: {', '.join(quality_dimensions)}
tags: {tags}
---
{url}
{description}
"""

    # Make sure the output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate markdown file name
    markdown_file_name = f"{title.replace(' ', '_').lower()}.md"
    markdown_path = os.path.join(output_dir, markdown_file_name)
    
    # Write markdown content to file
    with open(markdown_path, 'w') as md_file:
        md_file.write(markdown_content)
        
    print(f"Generated markdown file: {markdown_path}")

def process_json_ld_files(input_dir, output_dir):
    """Process all JSON-LD files in the input directory."""
    for json_file in os.listdir(input_dir):
        if json_file.endswith('.json'):
            json_ld_path = os.path.join(input_dir, json_file)
            generate_markdown(json_ld_path, output_dir)


# Create new directory for the markdown files
outdir = Path(f'../radar/{datetime.today().strftime("%Y-%m-%d")}')
outdir.mkdir(parents=True, exist_ok=True)

# Example usage
input_dir = '../data/software-tools'  # Directory where JSON-LD files are stored
output_dir = outdir # Directory where markdown files are stored

process_json_ld_files(input_dir, output_dir)
