from flask import Blueprint, request, jsonify
from app.services.gemini_service import GeminiService
import json

bp = Blueprint('analyze', __name__)
gemini_service = GeminiService()

@bp.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        # 获取上传的文件
        if 'image' not in request.files:
            return jsonify({'error': '没有上传图片'}), 400
        
        image_file = request.files['image']
        if not image_file:
            return jsonify({'error': '图片文件为空'}), 400
        
        # 读取图片数据
        image_data = image_file.read()
        
        # 获取其他数据
        description = request.form.get('description', '')
        product_info = json.loads(request.form.get('product_info', '{}'))
        
        # 分析图片
        result = gemini_service.analyze_image(image_data)
        
        # 如果有描述，也进行文本分析
        if description:
            text_result = gemini_service.analyze_text(description)
            result['text_analysis'] = text_result.get('analysis', '')
        
        # 生成标签
        tags = gemini_service.generate_tags(description, [image_data] if image_data else None)
        result['tags'] = tags
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500 