from flask import request
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from app import db
from app.models.return_item import ReturnItem
from app.models.product_category import ProductCategory
from app.models.vendor import Vendor
from app.utils.logger import get_logger
from app.interfaces.ecommerce_platform_api import EcommercePlatformAPI
from app.services.import_service import ImportService
from app.services.gemini_service import GeminiService

logger = get_logger(__name__)

api = Namespace('ecommerce', description='E-commerce integration API')

# Models for API documentation
ecommerce_return_input = api.model('EcommerceReturnInput', {
    'returnId': fields.String(required=True, description='Return ID from e-commerce platform'),
    'description': fields.String(description='Return description'),
    'createdAt': fields.String(description='Creation timestamp'),
    'image': fields.String(description='Image URL'),
    'user': fields.Nested(api.model('User', {
        'userId': fields.String(description='User ID'),
        'username': fields.String(description='Username')
    })),
    'product': fields.Nested(api.model('Product', {
        'productId': fields.String(required=True, description='Product ID'),
        'name': fields.String(required=True, description='Product name'),
        'category': fields.String(description='Product category'),
        'price': fields.Float(description='Product price')
    })),
    'order': fields.Nested(api.model('Order', {
        'orderId': fields.String(required=True, description='Order ID')
    })),
    'reason': fields.String(description='Return reason')
})

ecommerce_response = api.model('EcommerceResponse', {
    'success': fields.Boolean(description='Whether the operation was successful'),
    'return_id': fields.Integer(description='Created return item ID'),
    'message': fields.String(description='Response message')
})

@api.route('/webhook')
class EcommerceWebhook(Resource):
    @api.doc('receive_ecommerce_return')
    @api.expect(ecommerce_return_input)
    @api.marshal_with(ecommerce_response)
    def post(self):
        """Receive return data from e-commerce platforms"""
        logger.info("Received return data from e-commerce platform")
        
        try:
            data = request.json
            logger.info(f"Received data: {data}")
            
            # 创建电商平台API实例
            ecommerce_api = EcommercePlatformAPI()
            ecommerce_api.set_webhook_data(data)
            
            # 创建AI服务实例
            gemini_service = GeminiService()
            
            # 创建导入服务实例
            import_service = ImportService(ecommerce_api, gemini_service)
            
            # 导入退货数据
            success_count, failed_count, error_messages = import_service.import_returns()
            
            if success_count > 0:
                # 获取刚刚创建的退货项
                return_item = ReturnItem.query.order_by(ReturnItem.id.desc()).first()
                
                return {
                    'success': True,
                    'return_id': return_item.id,
                    'message': f'Successfully created return item with ID: {return_item.id}'
                }, 201
            else:
                return {
                    'success': False,
                    'message': f'Failed to create return item: {", ".join(error_messages)}'
                }, 400
            
        except Exception as e:
            logger.error(f"Error creating return item from e-commerce data: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': f'Error creating return item: {str(e)}'
            }, 500 