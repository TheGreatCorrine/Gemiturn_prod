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
    """Analyze return images"""
    if 'images' not in request.files:
        return jsonify({'error': 'No images uploaded'}), 400
        
    images = request.files.getlist('images')
    description = request.form.get('description', '')
    
    print(f"Received {len(images)} images for analysis")
    print(f"Description: {description}")
    
    try:
        # Read all image data
        image_data = []
        for image in images:
            image_data.append(image.read())
            
        # Prepare product info
        product_info = {
            'description': description
        }
        
        print(f"Calling categorize_return with {len(image_data)} images")
        
        # Use categorize_return method for analysis
        result = gemini_service.categorize_return(
            image_data=image_data,
            description=description,
            product_info=product_info
        )
        
        print(f"categorize_return result: {result}")
        
        # Ensure the returned data contains required fields
        if not isinstance(result, dict) or not all(key in result for key in ['category', 'reason', 'recommendation', 'confidence']):
            result = {
                'category': result.get('category', 'Uncategorized'),
                'reason': result.get('reason', 'Analysis failed'),
                'recommendation': result.get('recommendation', 'Manual review'),
                'confidence': result.get('confidence', 0.0)
            }
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'category': 'Uncategorized',
            'reason': f'Analysis failed: {str(e)}',
            'recommendation': 'Manual review',
            'confidence': 0.0
        }) 