# Gemiturn AI Analysis System GCP Deployment Guide

This document provides detailed steps for deploying the Gemiturn AI Analysis System on Google Cloud Platform (GCP).

## Prerequisites

1. Google Cloud Platform account
2. Google Cloud SDK installed and configured
3. Docker (for containerizing applications)
4. Local e-commerce platform with necessary API endpoints implemented (see `ecommerce_api_integration.md`)

## Deployment Architecture

We will deploy the Gemiturn AI Analysis System using the following architecture:

1. **App Engine**: Hosting the backend Flask application
2. **Cloud SQL**: Hosting the MySQL database
3. **Cloud Storage**: Storing return images and other static resources
4. **VPC Network**: Configuring secure network connections
5. **Cloud IAM**: Managing access permissions

## Step 1: Prepare GCP Project

1. Create a new GCP project (or use an existing one)
   ```bash
   gcloud projects create gemiturn-ai --name="Gemiturn AI Analysis"
   gcloud config set project gemiturn-ai
   ```

2. Enable necessary APIs
   ```bash
   gcloud services enable appengine.googleapis.com \
       cloudsql.googleapis.com \
       storage.googleapis.com \
       aiplatform.googleapis.com \
       secretmanager.googleapis.com
   ```

## Step 2: Set Up Cloud SQL

1. Create a Cloud SQL instance
   ```bash
   gcloud sql instances create gemiturn-db \
       --database-version=MYSQL_8_0 \
       --tier=db-f1-micro \
       --region=us-central1 \
       --root-password=YOUR_ROOT_PASSWORD
   ```

2. Create database and user
   ```bash
   gcloud sql databases create gemiturn --instance=gemiturn-db
   gcloud sql users create gemiturn --instance=gemiturn-db --password=YOUR_DB_PASSWORD
   ```

3. Note the connection information
   ```
   Instance connection name: gemiturn-ai:us-central1:gemiturn-db
   Database name: gemiturn
   Username: gemiturn
   Password: YOUR_DB_PASSWORD
   ```

## Step 3: Set Up Cloud Storage

1. Create a storage bucket
   ```bash
   gcloud storage buckets create gs://gemiturn-ai-storage --location=us-central1
   ```

2. Set access permissions
   ```bash
   gcloud storage buckets add-iam-policy-binding gs://gemiturn-ai-storage \
       --member=serviceAccount:gemiturn-ai@appspot.gserviceaccount.com \
       --role=roles/storage.objectAdmin
   ```

## Step 4: Configure Secret Manager

1. Create secrets
   ```bash
   echo -n "YOUR_DB_PASSWORD" | gcloud secrets create db-password --data-file=-
   echo -n "YOUR_JWT_SECRET_KEY" | gcloud secrets create jwt-secret-key --data-file=-
   echo -n "YOUR_LOCAL_ECOMMERCE_API_KEY" | gcloud secrets create ecommerce-api-key --data-file=-
   echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-
   ```

2. Grant App Engine access permissions
   ```bash
   gcloud secrets add-iam-policy-binding db-password \
       --member=serviceAccount:gemiturn-ai@appspot.gserviceaccount.com \
       --role=roles/secretmanager.secretAccessor
   
   gcloud secrets add-iam-policy-binding jwt-secret-key \
       --member=serviceAccount:gemiturn-ai@appspot.gserviceaccount.com \
       --role=roles/secretmanager.secretAccessor
   
   gcloud secrets add-iam-policy-binding ecommerce-api-key \
       --member=serviceAccount:gemiturn-ai@appspot.gserviceaccount.com \
       --role=roles/secretmanager.secretAccessor
   
   gcloud secrets add-iam-policy-binding gemini-api-key \
       --member=serviceAccount:gemiturn-ai@appspot.gserviceaccount.com \
       --role=roles/secretmanager.secretAccessor
   ```

## Step 5: Prepare the Application

1. Update the configuration file
   Edit the `backend/app.yaml` file to include the following:
   ```yaml
   runtime: python39
   
   env_variables:
     FLASK_ENV: "production"
     DB_USER: "gemiturn"
     DB_NAME: "gemiturn"
     CLOUD_SQL_CONNECTION_NAME: "gemiturn-ai:us-central1:gemiturn-db"
     GCP_STORAGE_BUCKET: "gemiturn-ai-storage"
     LOCAL_ECOMMERCE_API_URL: "http://your-ecommerce-platform/api"
   
   vpc_access_connector:
     name: projects/gemiturn-ai/locations/us-central1/connectors/gemiturn-connector
   
   handlers:
   - url: /.*
     script: auto
   
   entrypoint: gunicorn -b :$PORT run:app
   ```

2. Create a VPC access connector (if access to local resources is needed)
   ```bash
   gcloud compute networks vpc-access connectors create gemiturn-connector \
       --region=us-central1 \
       --network=default \
       --range=10.8.0.0/28
   ```

3. Update database migration scripts
   Ensure the `backend/migrations/cloud_sql_migration.py` file is properly configured.

## Step 6: Deploy the Backend Application

1. Navigate to the backend directory
   ```bash
   cd backend
   ```

2. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

3. Deploy to App Engine
   ```bash
   gcloud app deploy
   ```

4. Migrate the database
   ```bash
   gcloud app instances ssh --service=default --version=YOUR_VERSION -- "cd /app && python migrations/cloud_sql_migration.py"
   ```

## Step 7: Deploy the Frontend Application (Optional)

If your frontend application also needs to be deployed to GCP:

1. Navigate to the frontend directory
   ```bash
   cd frontend
   ```

2. Build the production version
   ```bash
   npm run build
   ```

3. Deploy to Firebase Hosting or App Engine
   ```bash
   # Using Firebase Hosting
   firebase deploy
   
   # Or using App Engine
   gcloud app deploy
   ```

## Step 8: Configure Network Connections

To enable the AI Analysis System on GCP to access your local e-commerce platform, you need to:

1. Ensure your local e-commerce platform has a public IP address, or
2. Set up a VPN connection, or
3. Use Cloud Interconnect to connect your local network and GCP

### Option 1: Public IP Address

If your local e-commerce platform has a public IP address, simply ensure:
- Your firewall allows connections from GCP
- API endpoints use HTTPS encryption
- Appropriate authentication and authorization mechanisms are implemented

### Option 2: Set Up a VPN Connection

1. Create a VPN gateway on GCP
   ```bash
   gcloud compute target-vpn-gateways create gemiturn-vpn-gateway \
       --region=us-central1 \
       --network=default
   ```

2. Configure your local VPN device to connect to the GCP VPN gateway
   (Specific steps depend on your local network device)

### Option 3: Use Cloud Interconnect

For enterprise-level connections, consider using Cloud Interconnect:
1. Contact the Google Cloud sales team
2. Set up Dedicated or Partner Interconnect
3. Configure routing and firewall rules

## Step 9: Test the Deployment

1. Access the deployed application
   ```
   https://gemiturn-ai.appspot.com
   ```

2. Test the API connection
   ```bash
   curl -X POST https://gemiturn-ai.appspot.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "admin123"}'
   ```

3. Test the import functionality
   ```bash
   curl -X POST https://gemiturn-ai.appspot.com/api/imports/returns \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"limit": 10}'
   ```

## Monitoring and Maintenance

1. Set up logging
   ```bash
   gcloud logging sinks create gemiturn-logs \
       storage.googleapis.com/gemiturn-ai-logs \
       --log-filter="resource.type=gae_app AND resource.labels.module_id=default"
   ```

2. Set up monitoring alerts
   ```bash
   gcloud alpha monitoring policies create \
       --policy-from-file=monitoring-policy.json
   ```

3. Set up regular backups
   ```bash
   gcloud sql backups create --instance=gemiturn-db
   ```

## Troubleshooting

### Common Issues

1. **Database connection failure**
   - Check the Cloud SQL connection name
   - Verify database username and password
   - Ensure the App Engine service account has access to Cloud SQL

2. **API connection failure**
   - Check the local e-commerce platform API URL
   - Verify the API key
   - Check network connections (firewalls, VPN, etc.)

3. **Deployment failure**
   - Check the app.yaml configuration
   - Verify all necessary APIs are enabled
   - Check service account permissions

### Getting Help

If you encounter issues, you can:
1. View App Engine logs
   ```bash
   gcloud app logs tail
   ```

2. Check Cloud SQL logs
   ```bash
   gcloud logging read "resource.type=cloudsql_database"
   ```

3. Contact our technical support team

## Security Best Practices

1. Regularly update all keys and passwords
2. Enable Cloud Audit Logging
3. Implement the principle of least privilege
4. Regularly review firewall rules
5. Enable VPC Service Controls (Enterprise Edition)

## Cost Optimization

1. Set up budget alerts
   ```bash
   gcloud billing budgets create \
       --billing-account=YOUR_BILLING_ACCOUNT_ID \
       --display-name="Gemiturn Budget" \
       --budget-amount=1000USD \
       --threshold-rule=percent=0.8
   ```

2. Use App Engine auto-scaling
3. Choose appropriate Cloud SQL instance sizes
4. Set up automatic idle instance sleep

## Conclusion

Congratulations! You have successfully deployed the Gemiturn AI Analysis System on Google Cloud Platform. The system can now retrieve return data from your local e-commerce platform, perform AI analysis, and return results to the e-commerce platform.

For further assistance or custom deployments, please contact our technical support team. 