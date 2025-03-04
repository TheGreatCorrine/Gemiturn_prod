from flask import request, jsonify
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import (
    create_access_token, 
    jwt_required, 
    get_jwt_identity,
    get_jwt
)
from datetime import datetime

from app import db
from app.models.user import User
from app.utils.logger import get_logger

logger = get_logger(__name__)

api = Namespace('auth', description='Authentication operations')

# Models for API documentation
user_model = api.model('User', {
    'id': fields.Integer(readonly=True, description='User ID'),
    'username': fields.String(required=True, description='Username'),
    'email': fields.String(required=True, description='Email address'),
    'role': fields.String(description='User role'),
    'is_active': fields.Boolean(description='Is user active'),
    'created_at': fields.DateTime(description='Creation timestamp'),
    'last_login': fields.DateTime(description='Last login timestamp')
})

login_model = api.model('Login', {
    'username': fields.String(required=True, description='Username'),
    'password': fields.String(required=True, description='Password')
})

register_model = api.model('Register', {
    'username': fields.String(required=True, description='Username'),
    'email': fields.String(required=True, description='Email address'),
    'password': fields.String(required=True, description='Password')
})

token_model = api.model('Token', {
    'access_token': fields.String(description='JWT access token'),
    'token_type': fields.String(description='Token type')
})


@api.route('/register')
class Register(Resource):
    @api.doc('register_user')
    @api.expect(register_model)
    @api.marshal_with(user_model, code=201)
    def post(self):
        """Register a new user"""
        data = request.json
        
        # Check if username or email already exists
        if User.query.filter_by(username=data['username']).first():
            api.abort(400, "Username already exists")
        
        if User.query.filter_by(email=data['email']).first():
            api.abort(400, "Email already exists")
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email']
        )
        user.password = data['password']  # This will hash the password
        
        db.session.add(user)
        db.session.commit()
        
        logger.info(f"New user registered: {user.username}")
        return user, 201


@api.route('/login')
class Login(Resource):
    @api.doc('login_user')
    @api.expect(login_model)
    @api.response(200, 'Login successful', token_model)
    @api.response(401, 'Authentication failed')
    def post(self):
        """Login and get access token"""
        data = request.json
        
        # Find user by username
        user = User.query.filter_by(username=data['username']).first()
        
        # Check if user exists and password is correct
        if not user or not user.verify_password(data['password']):
            logger.warning(f"Failed login attempt for username: {data['username']}")
            api.abort(401, "Invalid username or password")
        
        # Check if user is active
        if not user.is_active:
            logger.warning(f"Login attempt for inactive user: {user.username}")
            api.abort(401, "Account is inactive")
        
        # Update last login timestamp
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(
            identity=user.id,
            additional_claims={'role': user.role}
        )
        
        logger.info(f"User logged in: {user.username}")
        return {
            'access_token': access_token,
            'token_type': 'bearer',
            'user': user.to_dict()
        }


@api.route('/me')
class UserInfo(Resource):
    @api.doc('get_user_info')
    @api.marshal_with(user_model)
    @jwt_required()
    def get(self):
        """Get current user information"""
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        return user 