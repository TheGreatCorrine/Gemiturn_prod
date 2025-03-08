from flask import request, current_app
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
import os

from app.services.import_service import ImportService
from app.interfaces.mock_platform_api import MockPlatformAPI
from app.interfaces.local_ecommerce_api import LocalEcommerceAPI
from app.services.gemini_service import GeminiService
from app.utils.logger import get_logger

logger = get_logger(__name__)

api = Namespace('imports', description='导入操作 API')

# 导入请求模型
import_request = api.model('ImportRequest', {
    'start_date': fields.String(description='开始日期 (YYYY-MM-DD)'),
    'end_date': fields.String(description='结束日期 (YYYY-MM-DD)'),
    'status': fields.String(description='退货状态'),
    'limit': fields.Integer(description='返回结果数量限制', default=100)
})

# 导入响应模型
import_response = api.model('ImportResponse', {
    'success': fields.Boolean(description='是否成功'),
    'imported_count': fields.Integer(description='导入成功数量'),
    'failed_count': fields.Integer(description='导入失败数量'),
    'errors': fields.List(fields.String, description='错误消息列表')
})

# 单个处理请求模型
process_request = api.model('ProcessRequest', {
    'return_id': fields.String(required=True, description='退货 ID')
})

# 单个处理响应模型
process_response = api.model('ProcessResponse', {
    'success': fields.Boolean(description='是否成功'),
    'return_id': fields.String(description='退货 ID'),
    'ai_analysis': fields.Raw(description='AI 分析结果'),
    'tags': fields.List(fields.String, description='标签列表'),
    'suggested_action': fields.String(description='建议处理方式'),
    'confidence': fields.Float(description='置信度'),
    'error': fields.String(description='错误消息')
})

def get_platform_api():
    """
    根据配置获取适当的平台API实现
    
    Returns:
        PlatformAPIInterface: 平台API接口实现
    """
    # 检查是否配置了本地电商平台API
    api_key = os.environ.get('LOCAL_ECOMMERCE_API_KEY')
    api_url = os.environ.get('LOCAL_ECOMMERCE_API_URL')
    
    if api_key and api_url:
        logger.info(f"使用本地电商平台API: {api_url}")
        return LocalEcommerceAPI(api_key=api_key, base_url=api_url)
    else:
        logger.info("使用模拟平台API")
        return MockPlatformAPI()

@api.route('/returns')
class ImportReturns(Resource):
    @api.doc('import_returns')
    @api.expect(import_request)
    @api.marshal_with(import_response)
    @jwt_required()
    def post(self):
        """从外部平台导入退货数据"""
        user_id = get_jwt_identity()
        logger.info(f"用户 {user_id} 请求导入退货数据")
        
        # 获取请求参数
        data = request.json or {}
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        status = data.get('status')
        limit = data.get('limit', 100)
        
        # 创建服务实例
        platform_api = get_platform_api()
        ai_service = GeminiService()
        import_service = ImportService(platform_api, ai_service)
        
        # 执行导入
        imported_count, failed_count, errors = import_service.import_returns(
            start_date=start_date,
            end_date=end_date,
            status=status,
            limit=limit
        )
        
        # 返回结果
        return {
            'success': imported_count > 0,
            'imported_count': imported_count,
            'failed_count': failed_count,
            'errors': errors
        }

@api.route('/process')
class ProcessReturn(Resource):
    @api.doc('process_return')
    @api.expect(process_request)
    @api.marshal_with(process_response)
    @jwt_required()
    def post(self):
        """处理单个退货请求"""
        user_id = get_jwt_identity()
        logger.info(f"用户 {user_id} 请求处理单个退货")
        
        # 获取请求参数
        data = request.json
        return_id = data.get('return_id')
        
        if not return_id:
            return {'success': False, 'error': '缺少退货 ID'}, 400
        
        # 创建服务实例
        platform_api = get_platform_api()
        ai_service = GeminiService()
        import_service = ImportService(platform_api, ai_service)
        
        # 执行处理
        result = import_service.process_single_return(return_id)
        
        return result 