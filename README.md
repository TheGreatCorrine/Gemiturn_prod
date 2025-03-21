# Gemiturn AI Analysis System
<div>
<img src="https://readme-typing-svg.demolab.com/?pause=1&size=50&color=f75c7e&center=True&width=1200&height=120&vCenter=True&lines=Gemiturn+AI+Analysis+System.;Power+By+Gemini+AI" />
</div>

<p align="center">
  <img src="frontend/public/logo1.png" alt="Gemiturn Logo" width="200">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white" alt="Google Cloud">
<img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
</p>

A comprehensive AI-powered solution for automating e-commerce product return analysis and processing.

<img width="1220" alt="Screenshot 2025-03-21 at 6 35 09 PM" src="https://github.com/user-attachments/assets/9f6ecc51-864a-4e8b-91be-686cc518c1ab" />


## Overview

Gemiturn leverages **Google's Gemini AI technology** to analyze product returns, identify issues, and recommend optimal processing actions. Built on **Google Cloud Platform (GCP)** with **Google Natural Language Processing (NLP)** tools, the system delivers enterprise-grade performance while following **Google's classic four-color design philosophy**. The system helps e-commerce platforms reduce manual review time, improve accuracy in return handling, and optimize operational costs.

## Key Features

- **AI-Powered Return Analysis**: Automatically analyze return images and customer descriptions using **Gemini Vision API**
- **Intelligent Categorization**: Classify returns by issue type and severity with **Google NLP**
- **Decision Automation**: Generate processing recommendations with confidence scores
- **Platform Integration**: Seamless integration with e-commerce platforms via **RESTful APIs**
- **Reporting Dashboard**: Visualize return trends and processing metrics with **Google-inspired design**

## System Architecture

Gemiturn consists of:

- **Backend API**: Flask-based Python application hosted on **Google Cloud Run**
- **AI Analysis Engine**: **Google Gemini** integration for image and text processing
- **Database**: Structured storage using **Cloud SQL** for return data and analysis results
- **E-commerce Platform Connector**: Standardized **RESTful API** integration with retail platforms
- **RESTful API**: Follows **RESTful design principles** for easy integration with e-commerce platforms, details: [see API Design](#api-design)
- **Security**: Enterprise-grade protection with **Google Cloud IAM**

## Documentation

- [E-commerce API Integration](docs/ecommerce_api_integration.md): Guide for connecting your platform
- [API Documentation](docs/API_Integration.md): Internal API architecture and endpoints
- [GCP Deployment Guide](docs/gcp_deployment_guide.md): Instructions for cloud deployment
- [Tech Stack Overview](docs/TechStacks.md): Technologies and frameworks used
- [Troubleshooting](docs/TroubleShooting.md): Solutions for common issues

## Getting Started

1. Review the [E-commerce API Integration Guide](docs/ecommerce_api_integration.md)
2. Set up necessary API endpoints on your platform
3. Deploy the Gemiturn system using the [GCP Deployment Guide](docs/gcp_deployment_guide.md)
4. Run integration tests to validate your setup

## Development

For local development:

```bash
# Clone the repository
git clone https://github.com/yourusername/gemiturn.git

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
export GEMITURN_API_KEY=your_api_key
export GEMITURN_API_URL=http://localhost:8000/api
export GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Run development server
python run.py
```

## API Design

Gemiturn implements a **modern RESTful API architecture** with:

- Resource-oriented endpoints following REST conventions
- JSON data format for request and response payloads
- Authentication via JWT tokens
- Comprehensive error handling with standard HTTP status codes
- Clear documentation with OpenAPI/Swagger specifications

## Contact

For questions or support:

- Email: support@gemiturn.com
- Website: https://gemiturn.com
- Documentation: https://docs.gemiturn.com
