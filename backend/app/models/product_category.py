from datetime import datetime
from app import db

class ProductCategory(db.Model):
    """Model for product categories"""
    __tablename__ = 'product_categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True, index=True)
    description = db.Column(db.Text)
    parent_id = db.Column(db.Integer, db.ForeignKey('product_categories.id'), nullable=True)
    default_return_policy = db.Column(db.Text)  # 默认退货政策
    default_return_window_days = db.Column(db.Integer, default=30)  # 默认退货窗口期（天）
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 自引用关系
    children = db.relationship('ProductCategory', 
                              backref=db.backref('parent', remote_side=[id]),
                              lazy='dynamic')
    
    def __repr__(self):
        return f'<ProductCategory {self.id} - {self.name}>'
    
    def to_dict(self, include_children=False):
        """Convert object to dictionary"""
        result = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'parent_id': self.parent_id,
            'default_return_policy': self.default_return_policy,
            'default_return_window_days': self.default_return_window_days,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_children:
            result['children'] = [child.to_dict(False) for child in self.children]
            
        return result 