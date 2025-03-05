from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

from app.models.user import User

def token_required(f):
    """验证JWT令牌的装饰器"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            # 验证JWT令牌
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            return {"message": f"认证失败: {str(e)}"}, 401
    return decorated

def admin_required(f):
    """验证用户是否为管理员的装饰器"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            # 验证JWT令牌
            verify_jwt_in_request()
            
            # 获取当前用户身份
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            
            # 检查用户是否为管理员
            if not user or user.role != 'admin':
                return {"message": "需要管理员权限"}, 403
                
            return f(*args, **kwargs)
        except Exception as e:
            return {"message": f"认证失败: {str(e)}"}, 401
    return decorated 