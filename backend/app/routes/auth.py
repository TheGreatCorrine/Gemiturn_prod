from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_required, get_jwt

bp = Blueprint('auth', __name__)

@bp.route('/login', methods=['POST'])
def login():
    """用户登录"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # 简单的测试账号验证
    if username == 'admin' and password == 'admin123':
        # 创建访问令牌和刷新令牌
        access_token = create_access_token(identity=username)
        refresh_token = create_refresh_token(identity=username)
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'username': username
        })
    
    return jsonify({'error': '用户名或密码错误'}), 401

@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """刷新访问令牌"""
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    return jsonify({'access_token': new_access_token})

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    """获取当前用户信息"""
    current_user = get_jwt_identity()
    return jsonify({
        'username': current_user
    }) 