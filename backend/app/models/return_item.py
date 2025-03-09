from datetime import datetime
from app.extensions import db

class ReturnItem(db.Model):
    """Return order model"""
    __tablename__ = 'return_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(50), unique=True, nullable=False)
    product_id = db.Column(db.String(50), nullable=False)
    product_name = db.Column(db.String(100), nullable=False)
    product_category = db.Column(db.String(50), nullable=False)
    return_reason = db.Column(db.String(500), nullable=False)
    customer_description = db.Column(db.Text)
    original_price = db.Column(db.Float, nullable=False)
    
    # AI analysis results
    ai_analysis = db.Column(db.JSON)
    
    # Image URLs
    image_urls = db.Column(db.JSON, default=list)
    
    # Status tracking
    status = db.Column(db.String(20), default='pending')  # pending, processing, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<ReturnItem {self.order_id}>'
        
    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'product_name': self.product_name,
            'product_category': self.product_category,
            'return_reason': self.return_reason,
            'customer_description': self.customer_description,
            'original_price': self.original_price,
            'ai_analysis': self.ai_analysis,
            'image_urls': self.image_urls,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 