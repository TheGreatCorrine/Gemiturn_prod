from datetime import datetime
from app import db

class ReturnItem(db.Model):
    """Model for return items"""
    __tablename__ = 'return_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(50), nullable=False, index=True)
    product_id = db.Column(db.String(50), nullable=False, index=True)
    product_name = db.Column(db.String(255), nullable=False)
    product_category = db.Column(db.String(100), nullable=False)
    return_reason = db.Column(db.String(255))
    customer_description = db.Column(db.Text)
    image_urls = db.Column(db.JSON)  # Store multiple image URLs as JSON
    
    # AI analysis fields
    ai_category = db.Column(db.String(100))
    ai_reason = db.Column(db.String(255))
    ai_recommendation = db.Column(db.String(255))
    ai_confidence = db.Column(db.Float)
    
    # Status tracking
    status = db.Column(db.String(50), default='pending', index=True)  # pending, processing, completed, rejected
    original_price = db.Column(db.Float)
    resale_price = db.Column(db.Float)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    processed_at = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<ReturnItem {self.id} - {self.product_name}>'
    
    def to_dict(self):
        """Convert object to dictionary"""
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'product_name': self.product_name,
            'product_category': self.product_category,
            'return_reason': self.return_reason,
            'customer_description': self.customer_description,
            'image_urls': self.image_urls,
            'ai_category': self.ai_category,
            'ai_reason': self.ai_reason,
            'ai_recommendation': self.ai_recommendation,
            'ai_confidence': self.ai_confidence,
            'status': self.status,
            'original_price': self.original_price,
            'resale_price': self.resale_price,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None
        } 