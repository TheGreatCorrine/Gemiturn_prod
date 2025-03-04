# Troubleshooting Guide

This document provides solutions for common issues you might encounter when setting up and running the Gemiturn application.

## Installation Issues

### Dependency Installation Problems

If you encounter problems installing dependencies, especially with Pillow or other packages, try these solutions:

#### Python Version Compatibility

This project works best with Python 3.9 or 3.10. If using Python 3.13+, you may encounter compatibility issues with some packages.

#### Alternative Installation Methods

```bash
# Install core dependencies first
pip install flask flask-restx flask-cors flask-sqlalchemy flask-jwt-extended python-dotenv

# Then try installing the rest
pip install -r requirements.txt
```

#### For Pillow Installation Issues

- Edit requirements.txt and change `pillow==10.1.0` to `pillow>=9.5.0,<10.0.0`
- Or install Pillow separately: `pip install pillow`

#### Using Virtual Environment with Specific Python Version

```bash
python3.10 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Flask Import Error

If you see errors like `Import "flask" could not be resolved`, ensure you've installed all dependencies and activated your virtual environment:

```bash
# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Flask and related packages
pip install flask flask-restx
```

## Runtime Issues

### Database Connection Problems

If you encounter database connection issues:

1. Check that your database credentials in `.env` are correct
2. Ensure your database server is running
3. For PostgreSQL, verify that the database exists and the user has appropriate permissions

```bash
# For SQLite (development), ensure the directory is writable
chmod 755 backend/

# For PostgreSQL, test connection
psql -U username -h localhost -d gemiturn
```

### Google Cloud Authentication Issues

If you encounter GCP authentication problems:

1. Verify your GCP credentials are correctly set up
2. Ensure the `GEMINI_API_KEY` in your `.env` file is valid
3. Check that the service account has appropriate permissions

```bash
# Set application default credentials
gcloud auth application-default login

# Or set service account key
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

### Frontend API Connection Issues

If the frontend cannot connect to the backend API:

1. Check that the backend server is running
2. Verify the API URL in the frontend environment is correct
3. Ensure CORS is properly configured

```bash
# Check if backend is running
curl http://localhost:5000/health

# Verify frontend API URL in .env file
REACT_APP_API_URL=http://localhost:5000/api/v1
```

## Deployment Issues

### Docker Build Failures

If Docker build fails:

1. Ensure Docker is installed and running
2. Check that your Dockerfile has the correct syntax
3. Verify all required files are present in the build context

```bash
# Test Docker build
docker build -t gemiturn-backend ./backend
```

### Cloud Run Deployment Issues

If deployment to Cloud Run fails:

1. Verify you have the necessary permissions
2. Ensure your GCP project is correctly configured
3. Check that your container image is properly built and pushed

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/gemiturn-backend ./backend

# Deploy to Cloud Run
gcloud run deploy gemiturn-backend --image gcr.io/PROJECT_ID/gemiturn-backend --platform managed
```

## Getting Help

If you continue to experience issues not covered in this guide, please:

1. Check the project's issue tracker for similar problems
2. Search for error messages online
3. Open a new issue with detailed information about your problem, including:
   - Error messages
   - System information (OS, Python version, etc.)
   - Steps to reproduce the issue 