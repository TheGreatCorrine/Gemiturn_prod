from flask import request
from flask_restx import Namespace, Resource, fields
from app.models.user import User
from app.utils.auth import token_required, admin_required

api = Namespace('users', description='用户管理')

# 用户模型
user_model = api.model('User', {
    'id': fields.Integer(readonly=True, description='用户ID'),
    'username': fields.String(required=True, description='用户名'),
    'email': fields.String(required=True, description='电子邮件'),
    'role': fields.String(description='用户角色'),
    'created_at': fields.DateTime(description='创建时间')
})

# 用户列表
@api.route('/')
class UserList(Resource):
    @token_required
    @admin_required
    @api.marshal_list_with(user_model)
    def get(self):
        """获取所有用户"""
        users = User.query.all()
        return users

# 用户详情
@api.route('/<int:id>')
@api.param('id', '用户ID')
class UserDetail(Resource):
    @token_required
    @admin_required
    @api.marshal_with(user_model)
    def get(self, id):
        """获取特定用户"""
        user = User.query.get_or_404(id)
        return user 