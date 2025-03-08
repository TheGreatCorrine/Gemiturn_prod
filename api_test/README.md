# Gemiturn API Test Scripts

This directory contains Python scripts for testing and validating the Gemiturn API functionality.

## Available Scripts

### create_test_data.py

Creates sample return data in the development environment for testing purposes.

**Usage:**
```bash
python create_test_data.py --count 10 --images
```

**Parameters:**
- `--count`: Number of test records to create (default: 5)
- `--images`: Include sample images with return data
- `--categories`: Comma-separated list of product categories to use
- `--api-key`: API key (defaults to environment variable)

### check_db.py

Validates database records and checks for data integrity issues.

**Usage:**
```bash
python check_db.py --table returns
```

**Parameters:**
- `--table`: Database table to check (default: all tables)
- `--verbose`: Show detailed output
- `--fix`: Attempt to fix issues (use with caution)
- `--export`: Export results to CSV file

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
export GEMITURN_API_KEY=your_api_key
export GEMITURN_API_URL=http://localhost:8000/api
```

## Adding New Tests

When adding new test scripts:

1. Follow the existing naming convention
2. Include detailed docstrings and comments
3. Add error handling and verbose output options
4. Update this README with script details 