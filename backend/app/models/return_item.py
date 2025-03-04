from datetime import datetime
from app import db

class ReturnItem(db.Model):
    """Model for return items"""
    __tablename__ = 'return_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(50), nullable=False, index=True)
    product_id = db.Column(db.String(50), nullable=False, index=True)
    product_name = db.Column(db.String(255), nullable=False)
    
    # 关联到产品类别模型
    product_category_id = db.Column(db.Integer, db.ForeignKey('product_categories.id'), nullable=True)
    product_category = db.Column(db.String(100), nullable=False)  # 保留原字段用于兼容性
    
    # 关联到供应商模型
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendors.id'), nullable=True)
    
    return_reason = db.Column(db.String(255))
    customer_description = db.Column(db.Text)
    customer_email = db.Column(db.String(120))  # 添加客户联系信息
    customer_phone = db.Column(db.String(20))
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
    refund_amount = db.Column(db.Float)  # 退款金额
    shipping_cost = db.Column(db.Float)  # 运费
    restocking_fee = db.Column(db.Float)  # 重新上架费用
    
    # 处理信息
    notes = db.Column(db.Text)  # 处理备注
    processed_by = db.Column(db.Integer, db.ForeignKey('users.id'))  # 处理人员
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    processed_at = db.Column(db.DateTime)
    
    # 关系
    category = db.relationship('ProductCategory', backref='returns')
    vendor = db.relationship('Vendor', backref='returns')
    processor = db.relationship('User', backref='processed_returns')
    
    def __repr__(self):
        return f'<ReturnItem {self.id} - {self.product_name}>'
    
    def to_dict(self, include_history=False):
        """Convert object to dictionary"""
        result = {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'product_name': self.product_name,
            'product_category': self.product_category,
            'product_category_id': self.product_category_id,
            'vendor_id': self.vendor_id,
            'vendor_name': self.vendor.name if self.vendor else None,
            'return_reason': self.return_reason,
            'customer_description': self.customer_description,
            'customer_email': self.customer_email,
            'customer_phone': self.customer_phone,
            'image_urls': self.image_urls,
            'ai_category': self.ai_category,
            'ai_reason': self.ai_reason,
            'ai_recommendation': self.ai_recommendation,
            'ai_confidence': self.ai_confidence,
            'status': self.status,
            'original_price': self.original_price,
            'resale_price': self.resale_price,
            'refund_amount': self.refund_amount,
            'shipping_cost': self.shipping_cost,
            'restocking_fee': self.restocking_fee,
            'notes': self.notes,
            'processed_by': self.processed_by,
            'processor_name': self.processor.username if self.processor else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None
        }
        
        if include_history and hasattr(self, 'history'):
            result['history'] = [h.to_dict() for h in self.history.order_by(db.desc('created_at')).all()]
            
        return result 