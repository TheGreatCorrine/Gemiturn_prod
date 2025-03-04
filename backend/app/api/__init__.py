from flask import Blueprint
from flask_restx import Api

api_bp = Blueprint('api', __name__)
api = Api(
    api_bp,
    version='1.0',
    title='Gemiturn API',
    description='API for Gemiturn - AI-driven return management system',
    doc='/docs'
)

# Import and register namespaces
from app.api.returns import api as returns_ns
from app.api.auth import api as auth_ns
from app.api.analytics import api as analytics_ns

api.add_namespace(returns_ns)
api.add_namespace(auth_ns)
api.add_namespace(analytics_ns) 