#!/usr/bin/env python3
"""
Test data generation script for Gemiturn API testing.

This script creates synthetic return data records for testing the Gemiturn
AI analysis system. It can generate various product types, return reasons,
and customer descriptions to simulate real-world scenarios.
"""

import argparse
import json
import os
import random
import requests
import sys
from datetime import datetime, timedelta
from faker import Faker

# Initialize faker for generating realistic test data
fake = Faker()

# Configuration
API_BASE_URL = os.environ.get('GEMITURN_API_URL', 'http://localhost:8000/api')
API_KEY = os.environ.get('GEMITURN_API_KEY', '')

# Product categories for test data
PRODUCT_CATEGORIES = [
    'Electronics',
    'Clothing',
    'Home & Kitchen',
    'Beauty & Personal Care',
    'Toys & Games'
]

# Common return reasons
RETURN_REASONS = [
    'Damaged product',
    'Wrong item received',
    'Not as described',
    'No longer needed',
    'Defective',
    'Missing parts',
    'Late delivery'
]

def generate_test_data(count=5, include_images=False, categories=None):
    """
    Generate test return data.
    
    Args:
        count (int): Number of records to generate
        include_images (bool): Whether to include sample images
        categories (list): List of product categories to use
        
    Returns:
        list: Generated test data records
    """
    if categories is None:
        categories = PRODUCT_CATEGORIES
        
    test_data = []
    
    for i in range(count):
        # Generate a date within the last 30 days
        created_date = datetime.now() - timedelta(days=random.randint(1, 30))
        
        # Create a test record
        record = {
            "order_id": f"ORD{fake.random_number(digits=5)}",
            "product_id": f"PROD{fake.random_number(digits=6)}",
            "product_name": fake.catch_phrase(),
            "product_category": random.choice(categories),
            "return_reason": random.choice(RETURN_REASONS),
            "customer_description": fake.paragraph(nb_sentences=3),
            "customer_email": fake.email(),
            "customer_phone": fake.phone_number(),
            "status": "pending",
            "original_price": round(random.uniform(10.0, 500.0), 2),
            "created_at": created_date.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Add images if requested
        if include_images:
            record["image_urls"] = [
                f"https://picsum.photos/id/{random.randint(1, 1000)}/800/600",
                f"https://picsum.photos/id/{random.randint(1, 1000)}/800/600"
            ]
            
        test_data.append(record)
        
    return test_data

def upload_test_data(data):
    """
    Upload generated test data to the API.
    
    Args:
        data (list): Test data records to upload
        
    Returns:
        dict: API response information
    """
    if not API_KEY:
        print("Error: API key not found. Set the GEMITURN_API_KEY environment variable.")
        sys.exit(1)
        
    # First authenticate
    auth_response = requests.post(
        f"{API_BASE_URL}/auth",
        json={"api_key": API_KEY}
    )
    
    if auth_response.status_code != 200:
        print(f"Authentication failed: {auth_response.text}")
        sys.exit(1)
        
    token = auth_response.json().get('token')
    
    # Upload each record
    results = {
        "success": 0,
        "failed": 0,
        "errors": []
    }
    
    for record in data:
        response = requests.post(
            f"{API_BASE_URL}/returns/",
            json=record,
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 201:
            results["success"] += 1
        else:
            results["failed"] += 1
            results["errors"].append(f"Failed to upload record: {response.text}")
    
    return results

def main():
    """Main function to parse arguments and execute the script."""
    parser = argparse.ArgumentParser(description='Generate test data for Gemiturn API')
    parser.add_argument('--count', type=int, default=5, help='Number of test records to generate')
    parser.add_argument('--images', action='store_true', help='Include sample images')
    parser.add_argument('--categories', type=str, help='Comma-separated list of product categories')
    parser.add_argument('--api-key', type=str, help='API key (overrides environment variable)')
    parser.add_argument('--output', type=str, help='Output file for generated data (JSON)')
    parser.add_argument('--upload', action='store_true', help='Upload data to API')
    
    args = parser.parse_args()
    
    # Override API key if provided
    if args.api_key:
        global API_KEY
        API_KEY = args.api_key
    
    # Parse categories if provided
    categories = None
    if args.categories:
        categories = [cat.strip() for cat in args.categories.split(',')]
    
    # Generate test data
    print(f"Generating {args.count} test records...")
    test_data = generate_test_data(args.count, args.images, categories)
    
    # Save to file if requested
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(test_data, f, indent=2)
        print(f"Test data saved to {args.output}")
    
    # Upload if requested
    if args.upload:
        print("Uploading test data to API...")
        results = upload_test_data(test_data)
        print(f"Upload complete: {results['success']} successful, {results['failed']} failed")
        if results['errors']:
            print("Errors:")
            for error in results['errors']:
                print(f"  - {error}")
    
    # Print summary
    print(f"Created {len(test_data)} test records")
    if not args.output and not args.upload:
        print("Test data:")
        print(json.dumps(test_data, indent=2))

if __name__ == "__main__":
    main() 