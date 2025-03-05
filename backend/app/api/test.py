from flask import request
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
import random
from datetime import datetime

from app import db
from app.models.return_item import ReturnItem
from app.models.product_category import ProductCategory
from app.models.vendor import Vendor
from app.utils.logger import get_logger

logger = get_logger(__name__)

api = Namespace('test', description='测试操作 API')

# 测试响应模型
test_response = api.model('TestResponse', {
    'success': fields.Boolean(description='是否成功'),
    'return_id': fields.Integer(description='创建的退货ID'),
    'message': fields.String(description='消息')
})

@api.route('/create-return')
class CreateTestReturn(Resource):
    @api.doc('create_test_return')
    @api.marshal_with(test_response)
    def post(self):
        """创建测试退货数据"""
        user_id = 1
        logger.info(f"用户 {user_id} 请求创建测试退货数据")
        
        try:
            # 获取随机类别和供应商
            categories = ProductCategory.query.all()
            vendors = Vendor.query.all()
            
            if not categories or not vendors:
                return {
                    'success': False,
                    'message': '无法创建测试数据：缺少产品类别或供应商'
                }, 400
            
            # 随机选择类别和供应商
            category = random.choice(categories)
            vendor = random.choice(vendors)
            
            # 生成随机订单号和产品ID
            order_id = f"ORD{random.randint(10000, 99999)}"
            product_id = f"PROD{random.randint(10000, 99999)}"
            
            # 随机退货原因
            reasons = ["质量问题", "尺寸不合适", "收到错误商品", "不喜欢", "损坏", "功能不符合预期"]
            return_reason = random.choice(reasons)
            
            # 随机状态
            statuses = ["pending", "processing", "completed", "rejected"]
            status = random.choice(statuses)
            
            # 随机价格
            original_price = round(random.uniform(50, 500), 2)
            refund_amount = round(original_price * random.uniform(0.7, 1.0), 2) if status == "completed" else 0
            
            # 创建测试退货项
            test_return = ReturnItem(
                order_id=order_id,
                product_id=product_id,
                product_name=f"测试产品 {product_id}",
                product_category_id=category.id,
                product_category=category.name,
                vendor_id=vendor.id,
                return_reason=return_reason,
                customer_description=f"这是一个测试退货项，创建于 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}。退货原因：{return_reason}。",
                customer_email="test@example.com",
                customer_phone="13800000000",
                image_urls=["https://via.placeholder.com/300", "https://via.placeholder.com/300"],
                status=status,
                original_price=original_price,
                refund_amount=refund_amount,
                notes="这是一个自动生成的测试退货项",
                processed_by=user_id if status in ["completed", "rejected"] else None,
                processed_at=datetime.utcnow() if status in ["completed", "rejected"] else None,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.session.add(test_return)
            db.session.commit()
            
            return {
                'success': True,
                'return_id': test_return.id,
                'message': f'成功创建测试退货数据，ID: {test_return.id}'
            }
            
        except Exception as e:
            logger.error(f"创建测试退货数据失败: {str(e)}")
            db.session.rollback()
            return {
                'success': False,
                'message': f'创建测试退货数据失败: {str(e)}'
            }, 500 