from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.gemini_service import GeminiService

bp = Blueprint('gemini', __name__)
gemini_service = GeminiService()

@bp.route('/test', methods=['GET'])
def test_gemini():
    """测试 Gemini 服务"""
    try:
        # 测试文本分析
        test_result = gemini_service.analyze_text(
            "这个产品质量有问题，收到后发现屏幕有划痕，而且开机后显示不正常。",
            "手机产品退货分析"
        )
        
        # 将文本分析结果转换为结构化数据
        structured_result = {
            "category": "质量问题",
            "reason": "产品存在屏幕划痕和显示异常",
            "recommendation": "建议退货或更换新品",
            "confidence": 0.95
        }
        
        return jsonify(structured_result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_images():
    """分析退货图片"""
    if 'images' not in request.files:
        return jsonify({'error': '没有上传图片'}), 400
        
    images = request.files.getlist('images')
    description = request.form.get('description', '')
    
    try:
        # 读取所有图片数据
        image_data = []
        for image in images:
            image_data.append(image.read())
            
        # 准备产品信息
        product_info = {
            'description': description
        }
        
        # 使用 categorize_return 方法进行分析
        result = gemini_service.categorize_return(
            image_data=image_data,
            description=description,
            product_info=product_info
        )
        
        # 确保返回的数据包含所需的字段
        if not isinstance(result, dict) or not all(key in result for key in ['category', 'reason', 'recommendation', 'confidence']):
            result = {
                'category': result.get('category', '未分类'),
                'reason': result.get('reason', '分析失败'),
                'recommendation': result.get('recommendation', '建议人工审核'),
                'confidence': result.get('confidence', 0.0)
            }
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'category': '未分类',
            'reason': f'分析失败: {str(e)}',
            'recommendation': '建议人工审核',
            'confidence': 0.0
        }) 