import json
import os
from pathlib import Path
from datetime import datetime

def get_items(field):
    """
    Extract items from a field that can be:
    field e.g applicationCategory, hasQualityDimension 
    - a dict with '@id' e.g { "@id": "dim:Maintainability", "@type": "@id" }
    - a list of dicts with '@id' e.g. [
        { "@id": "dim:Maintainability", "@type": "@id" },
        { "@id": "dim:Sustainability", "@type": "@id" },
        { "@id": "dim:Reliability", "@type": "@id" }
      ]
    - a list of strings e.g [ "Maintainability", "Sustainability"]
    - a single string  e.g "Maintainability"
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

def rsqkit_to_md(field):
    """Generates an md written list of the related RSQKit pages"""
    if not field:
        return ''
    links = [f"[{item['title']}]({item['url']})" for item in field]

    print(links)

    if not links:
        return ''
    elif len(links) == 1:
        return links[0]
    elif len(links) == 2:
        return ' and '.join(links)
    else:
        return ', '.join(links[:-1]) + ' and ' + links[-1]

def generate_markdown(json_ld_file, output_dir, quality_dimension=None, is_multi_dim=False):
    """Generates tools markdown for techradar dashboard from a JSON-LD file."""
    with open(json_ld_file, 'r') as file:
        json_ld = json.load(file)

    # Fetch title
    title = json_ld.get('name', 'Unknown Title')
    # Fetch url
    url = json_ld.get('url', '')
    # Fetch description
    description = json_ld.get('description', "No description available")

    # Extract applicationCategory
    application_category_field = json_ld.get('applicationCategory', [])
    application_categories = get_items(application_category_field)
    
    # Rules in case of multi-tier tools
    if len(application_categories) > 1:
        if "AnalysisCode" in application_categories:
            application_category = "AnalysisCode"
        elif "PrototypeTool" in application_categories:
            application_category = "PrototypeTool"
        else:
            application_category = "ResearchInfrastructureSoftware"
    elif len(application_categories) == 1:
        application_category = application_categories[0]
    else:
        application_category = "Unknown"

    if not application_categories:
        print('Tool is missing application category in Json_LD')

    # Extract hasQualityDimension
    quality_dimension_field = json_ld.get('hasQualityDimension', [])
    quality_dimensions = get_items(quality_dimension_field)
    if not quality_dimensions:
        print('Tool is missing quality dimension in Json_LD')

    # Rule in case of multi-dimension tools
    if len(quality_dimensions) > 1 and quality_dimension:
        quality_dimensions = [quality_dimension]
    
    # Extract tags
    tags = []
    if 'howToUse' in json_ld:
        how_to_use = json_ld['howToUse']
        tags.extend(how_to_use)  # Add howToUse tags, e.g., 'online-service', 'CI/CD'

    if 'license' in json_ld:
        license_info = json_ld['license']
        if isinstance(license_info, dict) and '@id' in license_info:
            tags.append(license_info['@id'].split('/')[-1])
    
    if 'appliesToProgrammingLanguage' in json_ld:
        programming_language = json_ld['appliesToProgrammingLanguage']
        tags.extend(programming_language)

    # Add 'multi-dimensional' tag if there are tools with multi-quality dimensions
    if is_multi_dim:
        tags.append('multi-dimensional')

    # Extract RSQKit links
    rsqkit_field = json_ld.get('rsqkit', [])
    rsqkit_list_md = rsqkit_to_md(rsqkit_field)
    rsqkit = ''
    if rsqkit_list_md:
        rsqkit = 'See more in RSQKit: ' + rsqkit_list_md

    # Prepare markdown content
    markdown_content = f"""---
title: "{title}"
ring: {application_category}
segment: {', '.join(quality_dimensions)}
tags: {tags}
---
{description}

Tool License: {license_info}

Tool url: {url}

Application Category (or Categories in case of multi-tier tool): {', '.join(application_categories)}

{rsqkit}
"""

    os.makedirs(output_dir, exist_ok=True)
    
    markdown_file_name = f"{title.replace(' ', '_').lower()}.md"
    
    if quality_dimension:
        # Replace spaces in the quality dimension name with underscores
        formatted_quality_dimension = quality_dimension.replace(' ', '_')
        markdown_file_name = f"{title.replace(' ', '_').lower()}_{formatted_quality_dimension}.md"

    
    markdown_path = os.path.join(output_dir, markdown_file_name)
    
    with open(markdown_path, 'w') as md_file:
        md_file.write(markdown_content)
        
    print(f"Generated markdown file: {markdown_path}")


def process_json_ld_files(input_dir, output_dir):
    """Process all JSON-LD files in the input directory."""
    for json_file in os.listdir(input_dir):
        if json_file.endswith('.json'):
            json_ld_path = os.path.join(input_dir, json_file)
            # Extract quality dimensions for this JSON-LD file
            with open(json_ld_path, 'r') as file:
                json_ld = json.load(file)
            quality_dimension_field = json_ld.get('hasQualityDimension', [])
            quality_dimensions = get_items(quality_dimension_field)

            if len(quality_dimensions) > 1:
                # For each quality dimension, generate a separate markdown file
                for dimension in quality_dimensions:
                    generate_markdown(json_ld_path, output_dir, quality_dimension=dimension, is_multi_dim=True)
            else:
                # Else, generate a single markdown file
                generate_markdown(json_ld_path, output_dir)


outdir = Path(f'../radar/{datetime.today().strftime("%Y-%m-%d")}')
outdir.mkdir(parents=True, exist_ok=True)

input_dir = '../data/software-tools'  # Directory where JSON-LD files are stored
output_dir = outdir # Directory where markdown files are stored

process_json_ld_files(input_dir, output_dir)
