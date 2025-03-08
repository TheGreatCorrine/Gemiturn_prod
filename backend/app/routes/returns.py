from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.return_item import ReturnItem
from app.extensions import db
from app.services.gemini_service import GeminiService
import time
from sqlalchemy import or_, text
from datetime import datetime

bp = Blueprint('returns', __name__)
gemini_service = GeminiService()

@bp.route('/', methods=['GET'])
@jwt_required()
def get_returns():
    """获取退货订单列表"""
    returns = ReturnItem.query.all()
    return jsonify([item.to_dict() for item in returns])

@bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_return(id):
    """获取单个退货订单"""
    return_item = ReturnItem.query.get_or_404(id)
    return jsonify(return_item.to_dict())

@bp.route('/analyze-all', methods=['POST'])
@jwt_required()
def analyze_all_returns():
    """批量分析所有未分析的退货记录"""
    try:
        # 查询所有状态为pending或processing且尚未被AI分析的记录
        result = db.session.execute(
            text("""
                SELECT * FROM return_items 
                WHERE (status = 'pending' OR status = 'processing') 
                AND (ai_analysis IS NULL OR ai_analysis = 'null')
            """)
        )
        unanalyzed_returns = [ReturnItem.query.get(row.id) for row in result.fetchall()]
        
        # 如果没有未分析的记录，直接返回
        if not unanalyzed_returns:
            return jsonify({
                'success': True,
                'message': '没有找到未分析的退货记录',
                'analyzed_count': 0
            })
        
        # 分析每一条记录
        analyzed_count = 0
        failed_count = 0
        for return_item in unanalyzed_returns:
            try:
                # 使用Gemini服务进行分析
                analysis_result = gemini_service.analyze_return(
                    product_name=return_item.product_name,
                    product_category=return_item.product_category,
                    customer_description=return_item.customer_description,
                    return_reason=return_item.return_reason,
                    images=[]  # 暂不处理图片
                )
                
                # 确保分析结果是有效的JSON格式
                if isinstance(analysis_result, dict):
                    # 检查必要的字段是否存在
                    required_fields = ['category', 'reason', 'recommendation', 'confidence']
                    if all(field in analysis_result for field in required_fields):
                        return_item.ai_analysis = {
                            'category': analysis_result['category'],
                            'reason': analysis_result['reason'],
                            'recommendation': analysis_result['recommendation'],
                            'confidence': float(analysis_result['confidence'])
                        }
                        analyzed_count += 1
                    else:
                        return_item.ai_analysis = {
                            'category': '未分类',
                            'reason': '分析结果格式不完整',
                            'recommendation': '人工审核',
                            'confidence': 0.0
                        }
                        failed_count += 1
                else:
                    return_item.ai_analysis = {
                        'category': '未分类',
                        'reason': '分析结果格式错误',
                        'recommendation': '人工审核',
                        'confidence': 0.0
                    }
                    failed_count += 1
            except Exception as e:
                print(f"分析退货记录 {return_item.id} 失败: {str(e)}")
                return_item.ai_analysis = {
                    'category': '未分类',
                    'reason': f'分析失败: {str(e)}',
                    'recommendation': '人工审核',
                    'confidence': 0.0
                }
                failed_count += 1
        
        # 提交所有更改
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'成功分析 {analyzed_count} 条退货记录，失败 {failed_count} 条',
            'analyzed_count': analyzed_count,
            'failed_count': failed_count,
            'total_count': analyzed_count + failed_count
        })
    except Exception as e:
        db.session.rollback()
        print(f"批量分析退货记录失败: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'批量分析退货记录失败: {str(e)}'
        }), 500

@bp.route('/', methods=['POST'])
@jwt_required()
def create_return():
    """创建退货订单"""
    try:
        # 检查是否是表单数据（包含图片）或JSON数据
        if request.content_type and request.content_type.startswith('multipart/form-data'):
            # 处理表单数据
            order_id = request.form.get('order_id')
            product_id = request.form.get('product_id')
            product_name = request.form.get('product_name')
            product_category = request.form.get('product_category')
            return_reason = request.form.get('return_reason')
            customer_description = request.form.get('customer_description', '')
            original_price = float(request.form.get('original_price', 0))
            
            # 获取图片
            images = []
            if 'images' in request.files:
                image_files = request.files.getlist('images')
                for image in image_files:
                    images.append(image.read())
                    
            # 前端传递的AI分析结果
            ai_analysis = None
        else:
            # 处理JSON数据
            data = request.get_json()
            if not data:
                return jsonify({'error': '无效的请求数据'}), 400
                
            order_id = data.get('order_id')
            product_id = data.get('product_id')
            product_name = data.get('product_name')
            product_category = data.get('product_category')
            return_reason = data.get('return_reason')
            customer_description = data.get('customer_description', '')
            original_price = float(data.get('original_price', 0))
            images = []
            
            # 前端传递的AI分析结果
            ai_analysis = data.get('ai_analysis')
        
        # 检查order_id是否已存在，如果存在则生成新的
        if order_id:
            existing_return = ReturnItem.query.filter_by(order_id=order_id).first()
            if existing_return:
                # 生成新的唯一订单ID
                order_id = f"{order_id}-{int(time.time())}"
        
        # 创建退货订单
        return_item = ReturnItem(
            order_id=order_id,
            product_id=product_id,
            product_name=product_name,
            product_category=product_category,
            return_reason=return_reason,
            customer_description=customer_description,
            original_price=original_price
        )
        
        # 如果前端已经传递了AI分析结果，直接使用
        if ai_analysis and isinstance(ai_analysis, dict):
            return_item.ai_analysis = {
                'category': ai_analysis.get('category', '未分类'),
                'reason': ai_analysis.get('reason', '无具体原因'),
                'recommendation': ai_analysis.get('recommendation', '人工审核'),
                'confidence': float(ai_analysis.get('confidence', 0.0))
            }
        # 否则使用Gemini进行分析
        else:
            try:
                # 有图片时使用图片分析，否则使用文本分析
                if images:
                    # 这里假设有一个单独的API endpoint来处理AI分析
                    analysis_result = None
                else:
                    analysis_result = gemini_service.analyze_return(
                        product_name=return_item.product_name,
                        product_category=return_item.product_category,
                        customer_description=return_item.customer_description,
                        return_reason=return_item.return_reason,
                        images=[]
                    )
                
                # 确保分析结果是有效的 JSON 格式
                if isinstance(analysis_result, dict):
                    # 检查必要的字段是否存在
                    required_fields = ['category', 'reason', 'recommendation', 'confidence']
                    if all(field in analysis_result for field in required_fields):
                        return_item.ai_analysis = {
                            'category': analysis_result.get('category', '未分类'),
                            'reason': analysis_result.get('reason', '无具体原因'),
                            'recommendation': analysis_result.get('recommendation', '人工审核'),
                            'confidence': float(analysis_result.get('confidence', 0.0))
                        }
                    else:
                        return_item.ai_analysis = {
                            'category': '未分类',
                            'reason': '分析结果格式不完整',
                            'recommendation': '人工审核',
                            'confidence': 0.0
                        }
                else:
                    return_item.ai_analysis = {
                        'category': '未分类',
                        'reason': '分析结果格式错误',
                        'recommendation': '人工审核',
                        'confidence': 0.0
                    }
            except Exception as e:
                print(f"AI 分析失败: {str(e)}")
                return_item.ai_analysis = {
                    'category': '未分类',
                    'reason': f'分析失败: {str(e)}',
                    'recommendation': '人工审核',
                    'confidence': 0.0
                }
        
        db.session.add(return_item)
        db.session.commit()
        
        return jsonify(return_item.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"创建退货订单失败: {str(e)}")
        return jsonify({'error': f'创建退货订单失败: {str(e)}'}), 500

@bp.route('/<int:id>', methods=['PATCH'])
@jwt_required()
def update_return(id):
    """更新退货订单"""
    return_item = ReturnItem.query.get_or_404(id)
    data = request.get_json()
    
    for key, value in data.items():
        if hasattr(return_item, key):
            setattr(return_item, key, value)
    
    # 如果更新了相关字段，重新进行 AI 分析
    if any(key in data for key in ['product_name', 'product_category', 'return_reason', 'customer_description']):
        try:
            analysis_result = gemini_service.analyze_return(
                product_name=return_item.product_name,
                product_category=return_item.product_category,
                customer_description=return_item.customer_description,
                return_reason=return_item.return_reason,
                images=data.get('images', [])
            )
            
            # 确保分析结果是有效的 JSON 格式
            if isinstance(analysis_result, dict):
                # 检查必要的字段是否存在
                required_fields = ['category', 'reason', 'recommendation', 'confidence']
                if all(field in analysis_result for field in required_fields):
                    return_item.ai_analysis = {
                        'category': analysis_result['category'],
                        'reason': analysis_result['reason'],
                        'recommendation': analysis_result['recommendation'],
                        'confidence': float(analysis_result['confidence'])
                    }
                else:
                    return_item.ai_analysis = {
                        'category': '未分类',
                        'reason': '分析结果格式不完整',
                        'recommendation': '人工审核',
                        'confidence': 0.0
                    }
            else:
                return_item.ai_analysis = {
                    'category': '未分类',
                    'reason': '分析结果格式错误',
                    'recommendation': '人工审核',
                    'confidence': 0.0
                }
        except Exception as e:
            print(f"AI 分析失败: {str(e)}")
            return_item.ai_analysis = {
                'category': '未分类',
                'reason': f'分析失败: {str(e)}',
                'recommendation': '人工审核',
                'confidence': 0.0
            }
    
    db.session.commit()
    return jsonify(return_item.to_dict()) 