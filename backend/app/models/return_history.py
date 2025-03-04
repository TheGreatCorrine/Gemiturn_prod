from datetime import datetime
from app import db

class ReturnHistory(db.Model):
    """Model for tracking return item history"""
    __tablename__ = 'return_history'
    
    id = db.Column(db.Integer, primary_key=True)
    return_item_id = db.Column(db.Integer, db.ForeignKey('return_items.id'), nullable=False, index=True)
    status = db.Column(db.String(50), nullable=False)  # 状态变更
    notes = db.Column(db.Text)  # 处理备注
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))  # 操作人员
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关系
    return_item = db.relationship('ReturnItem', backref=db.backref('history', lazy='dynamic'))
    user = db.relationship('User', backref=db.backref('actions', lazy='dynamic'))
    
    def __repr__(self):
        return f'<ReturnHistory {self.id} - {self.status}>'
    
    def to_dict(self):
        """Convert object to dictionary"""
        return {
            'id': self.id,
            'return_item_id': self.return_item_id,
            'status': self.status,
            'notes': self.notes,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user': self.user.username if self.user else None
        } 