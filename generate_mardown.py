import json
import os
from datetime import datetime
from pathlib import Path


def generate_markdown(json_ld_file, output_dir):
    """Generates markdown from a JSON-LD file."""
    with open(json_ld_file, 'r') as file:
        json_ld = json.load(file)
        
    title = json_ld.get('schema:name', 'Unknown Title')
    application_category = json_ld.get('schema:applicationCategory', 'Not Linked to any Ring')  # Default
    if isinstance(application_category, dict) and '@id' in application_category:
        rs = application_category['@id'].split('/')[-1]
        ring = rs.split(':')[-1]  # Extracts exact value from the ID
        print(ring)
    else:
        ring = 'Missing application category in Json_LD'
    quadrant = 'application'  # Default quadrant for tools # TBD
    tags = []

    # Get tags
    if 'rs:hasQualityDimension' in json_ld:
        quality_dimension = json_ld['rs:hasQualityDimension']
        if isinstance(quality_dimension, dict) and '@id' in quality_dimension:
            rs_quality_dimension = quality_dimension['@id'].split('/')[-1]
            tags.append(rs_quality_dimension.split(':')[-1])  # Extracts exact value from the ID

    if 'rs:howToUse' in json_ld:
        how_to_use = json_ld['rs:howToUse']
        tags.extend(how_to_use)  # Add howToUse tags, e.g., 'web-interface'

    if 'schema:license' in json_ld:
        license_info = json_ld['schema:license']
        if isinstance(license_info, dict) and '@id' in license_info:
            tags.append(license_info['@id'].split('/')[-1])  # Extracts exact license type, e.g., 'Apache-2.0'

    url = json_ld.get('schema:url', '')
    
    # Fetch description if URL is provided
    description = json_ld.get('schema:description', "No description available")
    
    # Create markdown content
    markdown_content = f"""---
title: "{title}"
ring: {ring}
quadrant: {quadrant}
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
outdir = Path(f'radar/{datetime.today().strftime("%Y-%m-%d")}')
outdir.mkdir(parents=True, exist_ok=True)

# Example usage
input_dir = 'data/software-tools'  # Directory where JSON-LD files are stored
output_dir = outdir # Directory where markdown files are stored

process_json_ld_files(input_dir, output_dir)
