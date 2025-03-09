import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db
from sqlalchemy import Column, JSON
from sqlalchemy.sql import text

# Create Flask app
app = create_app()

# Use app context
with app.app_context():
    # Add image_urls column to return_items table
    try:
        # Check if column already exists
        result = db.session.execute(text("PRAGMA table_info(return_items)"))
        columns = [row[1] for row in result.fetchall()]
        
        if 'image_urls' not in columns:
            # Add column
            db.session.execute(text("ALTER TABLE return_items ADD COLUMN image_urls JSON"))
            db.session.commit()
            print("Successfully added image_urls column to return_items table")
        else:
            print("image_urls column already exists in return_items table")
            
    except Exception as e:
        db.session.rollback()
        print(f"Failed to add image_urls column: {str(e)}") 