import os
import uuid
from datetime import datetime
from google.cloud import storage
from flask import current_app
from app.utils.logger import get_logger

logger = get_logger(__name__)

class StorageService:
    """Service for interacting with Google Cloud Storage"""
    
    def __init__(self):
        """Initialize the storage client"""
        self.client = storage.Client(project=current_app.config.get('GCP_PROJECT_ID'))
        self.bucket_name = current_app.config.get('GCP_STORAGE_BUCKET')
        
        if not self.bucket_name:
            logger.warning("GCP Storage bucket name not found in configuration")
            raise ValueError("GCP Storage bucket name is required")
        
        # Ensure bucket exists
        try:
            self.bucket = self.client.get_bucket(self.bucket_name)
        except Exception as e:
            logger.error(f"Error accessing GCP Storage bucket: {str(e)}")
            raise
    
    def upload_file(self, file_data, original_filename=None, folder='returns'):
        """
        Upload a file to Google Cloud Storage
        
        Args:
            file_data (bytes): File data to upload
            original_filename (str): Original filename
            folder (str): Folder to store the file in
            
        Returns:
            str: Public URL of the uploaded file
        """
        try:
            # Generate a unique filename
            if original_filename:
                extension = os.path.splitext(original_filename)[1]
            else:
                extension = '.jpg'  # Default extension
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            unique_id = str(uuid.uuid4())[:8]
            filename = f"{folder}/{timestamp}_{unique_id}{extension}"
            
            # Upload the file
            blob = self.bucket.blob(filename)
            blob.upload_from_string(file_data, content_type=self._get_content_type(extension))
            
            # Make the file publicly accessible
            blob.make_public()
            
            return blob.public_url
            
        except Exception as e:
            logger.error(f"Error uploading file to GCP Storage: {str(e)}")
            raise
    
    def delete_file(self, file_url):
        """
        Delete a file from Google Cloud Storage
        
        Args:
            file_url (str): Public URL of the file to delete
            
        Returns:
            bool: True if deletion was successful, False otherwise
        """
        try:
            # Extract the blob name from the URL
            blob_name = file_url.split(f"{self.bucket_name}/")[1]
            
            # Delete the blob
            blob = self.bucket.blob(blob_name)
            blob.delete()
            
            return True
            
        except Exception as e:
            logger.error(f"Error deleting file from GCP Storage: {str(e)}")
            return False
    
    def _get_content_type(self, extension):
        """
        Get the content type based on file extension
        
        Args:
            extension (str): File extension
            
        Returns:
            str: Content type
        """
        content_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.pdf': 'application/pdf',
            '.txt': 'text/plain'
        }
        
        return content_types.get(extension.lower(), 'application/octet-stream') 