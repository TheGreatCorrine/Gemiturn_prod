# Gemiturn

An AI-driven return items management software for e-commerce platforms.

## Overview

Gemiturn is an intelligent return management system that leverages Google's Gemini API to automate and optimize the return process for e-commerce businesses. The system analyzes customer return data, images, and descriptions to categorize returns, detect patterns, and suggest optimal handling strategies.

## Features

- **API Integration**: Seamless integration with e-commerce platforms
- **AI Analysis**: Automatic categorization of return reasons using Gemini API
- **Smart Decision Making**: AI-powered recommendations for return handling
- **Batch Processing**: Efficient handling of multiple returns
- **Complete Workflow**: End-to-end management from customer return to resale

## Tech Stack

- **Backend**: Python, Flask, PostgreSQL
- **Frontend**: React, TypeScript, Tailwind CSS
- **Cloud**: Google Cloud Platform (Cloud Run, Cloud SQL, Cloud Storage)
- **AI**: Google Gemini API

For detailed information about our technology stack, see [documents/TechStacks.md](documents/TechStacks.md).

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 16+
- Docker
- Google Cloud SDK

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/gemiturn.git
cd gemiturn
```

2. Set up backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up frontend
```bash
cd frontend
npm install
```

4. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run the application
```bash
# In backend directory
flask run

# In frontend directory
npm start
```

If you encounter any issues during installation or running the application, please refer to our [Troubleshooting Guide](documents/TroubleShooting.md).

## Deployment

Instructions for deploying to Google Cloud Platform can be found in [DEPLOYMENT.md](DEPLOYMENT.md).

## Documentation

- [Technology Stack](documents/TechStacks.md)
- [Troubleshooting Guide](documents/TroubleShooting.md)

## License

MIT
