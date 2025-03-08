# E-commerce Platform API Integration Guide

This document provides API specifications required to integrate your e-commerce platform with the Gemiturn AI Analysis System.

## Overview

Gemiturn AI Analysis System processes return request data from e-commerce platforms, performs AI analysis, and provides recommended actions. This integration requires your platform to expose specific API endpoints.

## Return Data Workflow

The complete system workflow is as follows:

1. **Data Collection** → [Return List API](#2-returns-list-endpoint)
   - Your e-commerce platform collects return requests from customers
   - When a customer initiates a return, information is stored in your system
   - Gemiturn retrieves this data through your Returns List API

2. **Data Enrichment** → [Return Details](#3-return-details-endpoint) & [Images](#4-return-images-endpoint)
   - Gemiturn requests detailed information for each return case
   - Product specifications, customer descriptions, and return reasons are collected
   - Images are retrieved through your Return Images API for visual analysis

3. **AI Processing**
   - Gemiturn performs comprehensive analysis using Google Gemini and NLP technologies
   - Visual inspection identifies product condition, defects, and authenticity issues
   - Text analysis evaluates customer descriptions and return reasons

4. **Decision Logic**
   - Based on combined analysis results, the system determines optimal return handling
   - Recommendations consider product condition, return policies, and customer history
   - Confidence scores indicate the reliability of the analysis

5. **Status Updates** → [Update Status API](#5-update-return-status-endpoint)
   - Analysis results are sent back to your platform
   - Return status is updated with processing decisions
   - The system provides explanations for recommended actions

> **Quick Navigation**:
> - [Authentication](#1-authentication-endpoint)
> - [Returns List](#2-returns-list-endpoint)
> - [Return Details](#3-return-details-endpoint)
> - [Return Images](#4-return-images-endpoint)
> - [Update Status](#5-update-return-status-endpoint)
> - [Implementation Example](#implementation-example)
> - [Security Recommendations](#security-recommendations)

## API Specifications

### Basic Information

- Base URL: `http://your-ecommerce-platform/api`
- Authentication: API key + JWT token
- Data Format: JSON

### 1. Authentication Endpoint

**Endpoint:** `/auth`

**Method:** POST

**Request Body:**
```json
{
  "api_key": "your-api-key"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "expires_in": 3600
}
```

### 2. Returns List Endpoint

**Endpoint:** `/returns`

**Method:** GET

**Query Parameters:**
- `start_date` (optional): Start date in YYYY-MM-DD format
- `end_date` (optional): End date in YYYY-MM-DD format
- `status` (optional): Return status
- `limit` (optional): Maximum number of results to return, default 100

**Response:**
```json
[
  {
    "id": "RET00001",
    "order_id": "ORD00001",
    "product_id": "PROD00001",
    "product_name": "Product Name",
    "product_category": "Product Category",
    "return_reason": "Return Reason",
    "customer_description": "Customer Description",
    "customer_email": "customer@example.com",
    "customer_phone": "13800000000",
    "status": "pending",
    "original_price": 100.0,
    "created_at": "2023-01-01 12:00:00"
  },
  // More return records...
]
```

### 3. Return Details Endpoint

**Endpoint:** `/returns/{return_id}`

**Method:** GET

**Response:**
```json
{
  "id": "RET00001",
  "order_id": "ORD00001",
  "product_id": "PROD00001",
  "product_name": "Product Name",
  "product_category": "Product Category",
  "return_reason": "Return Reason",
  "customer_description": "Customer Description",
  "customer_email": "customer@example.com",
  "customer_phone": "13800000000",
  "status": "pending",
  "original_price": 100.0,
  "created_at": "2023-01-01 12:00:00",
  "updated_at": "2023-01-01 12:00:00",
  "additional_info": {
    // Any additional information...
  }
}
```

### 4. Return Images Endpoint

**Endpoint:** `/returns/{return_id}/images`

**Method:** GET

**Response:**
```json
{
  "return_id": "RET00001",
  "image_urls": [
    "http://your-ecommerce-platform/images/return_1_1.jpg",
    "http://your-ecommerce-platform/images/return_1_2.jpg"
  ]
}
```

### 5. Update Return Status Endpoint

**Endpoint:** `/returns/{return_id}/status`

**Method:** PUT

**Request Body:**
```json
{
  "status": "processed",
  "notes": "AI analysis completed"
}
```

**Response:**
```json
{
  "success": true,
  "return_id": "RET00001",
  "status": "processed"
}
```

## Data Field Descriptions

### Return Record Fields

| Field Name | Type | Description |
|------------|------|-------------|
| id | string | Return ID |
| order_id | string | Order ID |
| product_id | string | Product ID |
| product_name | string | Product name |
| product_category | string | Product category |
| return_reason | string | Return reason |
| customer_description | string | Customer description |
| customer_email | string | Customer email |
| customer_phone | string | Customer phone |
| status | string | Return status |
| original_price | number | Original price |
| created_at | string | Creation time |
| updated_at | string | Update time |

### Status Values

| Status Value | Description |
|--------------|-------------|
| pending | Awaiting processing |
| processing | In progress |
| completed | Completed |
| rejected | Rejected |

## Implementation Example

Below is a simple example using Express.js to implement these API endpoints:

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Mock database
const returns = [/* return data */];
const API_KEY = 'your-api-key';
const JWT_SECRET = 'your-jwt-secret';

// Authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// 1. Authentication endpoint
app.post('/api/auth', (req, res) => {
  const { api_key } = req.body;
  if (api_key !== API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  const token = jwt.sign({ role: 'api' }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, expires_in: 3600 });
});

// 2. Returns list endpoint
app.get('/api/returns', authenticate, (req, res) => {
  const { start_date, end_date, status, limit = 100 } = req.query;
  
  // Filtering logic...
  
  res.json(returns.slice(0, limit));
});

// 3. Return details endpoint
app.get('/api/returns/:id', authenticate, (req, res) => {
  const returnItem = returns.find(r => r.id === req.params.id);
  if (!returnItem) {
    return res.status(404).json({ error: 'Return record not found' });
  }
  
  res.json(returnItem);
});

// 4. Return images endpoint
app.get('/api/returns/:id/images', authenticate, (req, res) => {
  const returnItem = returns.find(r => r.id === req.params.id);
  if (!returnItem) {
    return res.status(404).json({ error: 'Return record not found' });
  }
  
  res.json({
    return_id: returnItem.id,
    image_urls: returnItem.image_urls || []
  });
});

// 5. Update return status endpoint
app.put('/api/returns/:id/status', authenticate, (req, res) => {
  const { status, notes } = req.body;
  const returnItem = returns.find(r => r.id === req.params.id);
  if (!returnItem) {
    return res.status(404).json({ error: 'Return record not found' });
  }
  
  returnItem.status = status;
  if (notes) {
    returnItem.notes = notes;
  }
  
  res.json({
    success: true,
    return_id: returnItem.id,
    status: returnItem.status
  });
});

app.listen(8080, () => {
  console.log('API server running at http://localhost:8080');
});
```

## Security Recommendations

1. Use HTTPS to secure API communications
2. Implement rate limiting to prevent abuse
3. Validate all input data
4. Log all API calls for audit purposes
5. Rotate API keys and JWT secrets regularly

## Testing

After implementing the API, you can test it using the following curl commands:

```bash
# 1. Get authentication token
curl -X POST http://localhost:8080/api/auth \
  -H "Content-Type: application/json" \
  -d '{"api_key": "your-api-key"}'

# 2. Get returns list
curl -X GET "http://localhost:8080/api/returns?limit=10" \
  -H "Authorization: Bearer your-jwt-token"

# 3. Get return details
curl -X GET http://localhost:8080/api/returns/RET00001 \
  -H "Authorization: Bearer your-jwt-token"

# 4. Get return images
curl -X GET http://localhost:8080/api/returns/RET00001/images \
  -H "Authorization: Bearer your-jwt-token"

# 5. Update return status
curl -X PUT http://localhost:8080/api/returns/RET00001/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"status": "processed", "notes": "AI analysis completed"}'
```

## Contact Information

For questions or further assistance, please contact our technical support team. 