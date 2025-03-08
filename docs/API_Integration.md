# Gemiturn API Integration Documentation

This document details the internal API architecture and workflows for the Gemiturn system. For e-commerce platform integration specifics, please refer to the [E-commerce Platform API Integration Guide](./ecommerce_api_integration.md).

## System Workflow

The complete system workflow is as follows:

1. **Data Collection**
   - Data enters the system through various collection points
   - The system processes returns information from e-commerce platforms

2. **Database Storage**
   - Validated data is stored in the system database
   - Primarily stored in the `ReturnItem` table, with related information in other associated tables

3. **AI Analysis (Gemini + NLP)**
   - The system analyzes data using Google Gemini API and natural language processing techniques
   - Analysis includes image recognition, text analysis, classification, and tag generation

4. **Optimal Processing Determination**
   - Based on AI analysis results, the system determines the best return processing method
   - Analysis results and recommendations are stored in the database and can be returned to e-commerce platforms via API

## Internal API Endpoints

### Import API

#### Batch Import Return Requests

```
POST /api/imports/returns
```

**Request Parameters:**

```json
{
  "start_date": "2023-01-01",  // Optional, start date
  "end_date": "2023-12-31",    // Optional, end date
  "status": "pending",         // Optional, return status
  "limit": 100                 // Optional, limit on returned results
}
```

**Response:**

```json
{
  "success": true,
  "imported_count": 15,
  "failed_count": 2,
  "errors": ["Import failed: RET00123 - Image download failed"]
}
```

#### Process Single Return Request

```
POST /api/imports/process
```

**Request Parameters:**

```json
{
  "return_id": "RET00123"  // Required, return ID
}
```

**Response:**

```json
{
  "success": true,
  "return_id": "RET00123",
  "ai_analysis": {
    "category": "Quality Issue",
    "reason": "Product Damaged",
    "recommendation": "Accept Return",
    "confidence": 0.92
  },
  "tags": ["Damaged", "Electronics", "Screen Broken", "Under Warranty"],
  "suggested_action": "Accept Return",
  "confidence": 0.92
}
```

### Return Management API

#### Get Returns List

```
GET /api/returns/
```

#### Create Return Record

```
POST /api/returns/
```

#### Get Return Details

```
GET /api/returns/{id}
```

#### Update Return Status

```
PATCH /api/returns/{id}
```

#### Delete Return Record

```
DELETE /api/returns/{id}
```

## Interface Design

The system uses an interface separation design pattern to ensure decoupling and flexibility between components:

### AI Service Interface (AIServiceInterface)

Defines methods for interacting with AI services:

- `analyze_image()`: Analyze images
- `analyze_text()`: Analyze text
- `categorize_return()`: Categorize returns
- `generate_tags()`: Generate tags
- `suggest_action()`: Suggest actions

## Database Models

The system uses the following database models to store and manage data:

### ReturnItem

Core model storing all return information:

- Basic information (order ID, product ID, product name)
- Classification information (product category, vendor)
- Customer information (return reason, customer description, contact details)
- AI analysis results (classification, reason, recommendation, confidence)
- Status and financial information (processing status, price, fees)
- Processing information and timestamps

### ReturnHistory

Records status change history for return items:

- Return item ID
- Status change
- Processing notes
- Operator
- Creation time

### Vendor

Stores vendor information:

- Vendor name
- Contact information
- Return policy
- Return window

### ProductCategory

Stores product category information:

- Category name
- Description
- Parent category
- Default return policy

### User

Stores user information:

- Username and password
- Roles and permissions
- Login information

## Implementation Details

### Import Service (ImportService)

Responsible for coordinating platform API and AI services, implementing data import and processing:

- Import return data from external platforms
- Use AI services to analyze images and text
- Generate tags and classifications
- Save data to database

### Gemini Service (GeminiService)

Uses Google Gemini API to provide AI analysis functions:

- Use Gemini Pro Vision model to analyze images
- Use Gemini Pro model to analyze text
- Classify returns and generate tags
- Provide processing recommendations

## Security Considerations

- All API endpoints require JWT authentication
- Sensitive operations require appropriate permissions
- Data transmission uses HTTPS encryption
- Passwords are stored using hashing
- API keys are securely stored in environment variables

## Deployment Notes

- Ensure Google Cloud credentials are correctly configured
- Set appropriate environment variables (API keys, database connections, etc.)
- Configure sufficient storage space for images and logs
- Set appropriate log levels
- Configure database backup strategy

## Extensibility

The system design supports the following extensions:

- Connect to different e-commerce platforms (by implementing different platform adapters)
- Use different AI services (by implementing different `AIServiceInterface` instances)
- Add new analysis dimensions and processing strategies
- Extend the data model to support more business requirements 