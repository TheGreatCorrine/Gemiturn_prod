from flask import Blueprint
from flask_restx import Api

from app.api.auth import api as auth_ns
from app.api.users import api as users_ns
from app.api.returns import api as returns_ns
from app.api.analytics import api as analytics_ns
from app.api.categories import api as categories_ns
from app.api.vendors import api as vendors_ns
from app.api.imports import api as imports_ns
from app.api.test import api as test_ns
from app.api.ecommerce import api as ecommerce_ns

# 创建蓝图
blueprint = Blueprint('api', __name__, url_prefix='/api')
api_bp = blueprint  # 导出为api_bp

# 创建 API 实例
api = Api(
    blueprint,
    title='Gemiturn API',
    version='1.0',
    description='退货管理系统 API',
    doc='/docs'
)

# 添加命名空间
api.add_namespace(auth_ns, path='/auth')
api.add_namespace(users_ns, path='/users')
api.add_namespace(returns_ns, path='/returns')
api.add_namespace(analytics_ns, path='/analytics')
api.add_namespace(categories_ns, path='/categories')
api.add_namespace(vendors_ns, path='/vendors')
api.add_namespace(imports_ns, path='/imports')
api.add_namespace(test_ns, path='/test')
api.add_namespace(ecommerce_ns, path='/ecommerce') 