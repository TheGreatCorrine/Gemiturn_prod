from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.return_item import ReturnItem
from app.extensions import db
from app.services.gemini_service import GeminiService
import time
from sqlalchemy import or_, text
from datetime import datetime
from app.services.storage_service import StorageService
import json

bp = Blueprint('returns', __name__)
gemini_service = GeminiService()

@bp.route('/', methods=['GET'])
@jwt_required()
def get_returns():
    """Get list of return orders"""
    returns = ReturnItem.query.all()
    return jsonify([item.to_dict() for item in returns])

@bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_return(id):
    """Get a single return order"""
    return_item = ReturnItem.query.get_or_404(id)
    return jsonify(return_item.to_dict())

@bp.route('/analyze-all', methods=['POST'])
@jwt_required()
def analyze_all_returns():
    """Batch analyze all unprocessed return records"""
    try:
        # Query all records with status pending or processing and not yet analyzed
        result = db.session.execute(
            text("""
                SELECT * FROM return_items 
                WHERE (status = 'pending' OR status = 'processing') 
                AND (ai_analysis IS NULL OR ai_analysis = 'null')
            """)
        )
        unanalyzed_returns = [ReturnItem.query.get(row.id) for row in result.fetchall()]
        
        # If no unanalyzed records found, return directly
        if not unanalyzed_returns:
            return jsonify({
                'success': True,
                'message': 'No unanalyzed return records found',
                'analyzed_count': 0
            })
        
        # Analyze each record
        analyzed_count = 0
        failed_count = 0
        for return_item in unanalyzed_returns:
            try:
                # Use Gemini service for analysis
                analysis_result = gemini_service.analyze_return(
                    product_name=return_item.product_name,
                    product_category=return_item.product_category,
                    customer_description=return_item.customer_description,
                    return_reason=return_item.return_reason,
                    images=[]  # Temporary handling of images
                )
                
                # Ensure analysis result is valid JSON format
                if isinstance(analysis_result, dict):
                    # Check if required fields exist
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
                            'category': 'Uncategorized',
                            'reason': 'Incomplete analysis result format',
                            'recommendation': 'Manual Review',
                            'confidence': 0.0
                        }
                        failed_count += 1
                else:
                    return_item.ai_analysis = {
                        'category': 'Uncategorized',
                        'reason': 'Incorrect analysis result format',
                        'recommendation': 'Manual Review',
                        'confidence': 0.0
                    }
                    failed_count += 1
            except Exception as e:
                print(f"Failed to analyze return record {return_item.id}: {str(e)}")
                return_item.ai_analysis = {
                    'category': 'Uncategorized',
                    'reason': f'Analysis failed: {str(e)}',
                    'recommendation': 'Manual Review',
                    'confidence': 0.0
                }
                failed_count += 1
        
        # Submit all changes
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Successfully analyzed {analyzed_count} return records, failed {failed_count}',
            'analyzed_count': analyzed_count,
            'failed_count': failed_count,
            'total_count': analyzed_count + failed_count
        })
    except Exception as e:
        db.session.rollback()
        print(f"Batch analysis failed: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Batch analysis failed: {str(e)}'
        }), 500

@bp.route('/', methods=['POST'])
@jwt_required()
def create_return():
    """Create return order"""
    try:
        # Check if it's form data (contains images) or JSON data
        if request.content_type and request.content_type.startswith('multipart/form-data'):
            # Handle form data
            order_id = request.form.get('order_id')
            product_id = request.form.get('product_id')
            product_name = request.form.get('product_name')
            product_category = request.form.get('product_category')
            return_reason = request.form.get('return_reason')
            customer_description = request.form.get('customer_description')
            original_price = float(request.form.get('original_price', 0))
            
            # Get images
            images = []
            image_urls = []
            if 'images' in request.files:
                storage_service = StorageService()
                
                for image in request.files.getlist('images'):
                    image_data = image.read()
                    images.append(image_data)
                    
                    # Upload image to storage and get URL
                    try:
                        image_url = storage_service.upload_file(
                            file_data=image_data,
                            original_filename=image.filename,
                            folder=f'returns/{order_id}'
                        )
                        image_urls.append(image_url)
                    except Exception as e:
                        print(f"Failed to upload image: {str(e)}")
                    
            # Front-end passed AI analysis result
            ai_analysis_str = request.form.get('ai_analysis')
            ai_analysis = None
            if ai_analysis_str:
                try:
                    print(f"AI analysis string from form: {ai_analysis_str}")
                    ai_analysis = json.loads(ai_analysis_str)
                    print(f"Parsed AI analysis: {ai_analysis}")
                except json.JSONDecodeError as e:
                    print(f"Failed to parse AI analysis JSON: {str(e)}")
        else:
            # Handle JSON data
            data = request.get_json()
            if not data:
                return jsonify({
                    'success': False,
                    'message': 'No data provided'
                }), 400
                
            order_id = data.get('order_id')
            product_id = data.get('product_id')
            product_name = data.get('product_name')
            product_category = data.get('product_category')
            return_reason = data.get('return_reason')
            customer_description = data.get('customer_description')
            original_price = float(data.get('original_price', 0))
            images = []
            image_urls = data.get('image_urls', [])
            
            # Front-end passed AI analysis result
            ai_analysis = data.get('ai_analysis')
        
        # Check if order_id already exists, if exists generate new one
        if order_id:
            existing_return = ReturnItem.query.filter_by(order_id=order_id).first()
            if existing_return:
                # Generate new unique order ID
                order_id = f"{order_id}-{int(time.time())}"
        
        # Create return order
        return_item = ReturnItem(
            order_id=order_id,
            product_id=product_id,
            product_name=product_name,
            product_category=product_category,
            return_reason=return_reason,
            customer_description=customer_description,
            original_price=original_price,
            status='pending',
            image_urls=image_urls
        )
        
        # If front-end has already passed AI analysis result, use it directly
        if ai_analysis and isinstance(ai_analysis, dict):
            try:
                # Validate required fields
                required_fields = ['category', 'reason', 'recommendation', 'confidence']
                if all(field in ai_analysis for field in required_fields):
                    return_item.ai_analysis = {
                        'category': ai_analysis.get('category', 'Uncategorized'),
                        'reason': ai_analysis.get('reason', 'Not analyzed'),
                        'recommendation': ai_analysis.get('recommendation', 'Manual review'),
                        'confidence': float(ai_analysis.get('confidence', 0.0))
                    }
                else:
                    # If missing required fields, log warning and use default values
                    missing_fields = [field for field in required_fields if field not in ai_analysis]
                    print(f"AI analysis missing required fields: {', '.join(missing_fields)}")
                    return_item.ai_analysis = {
                        'category': 'Uncategorized',
                        'reason': 'Incomplete analysis result',
                        'recommendation': 'Manual review',
                        'confidence': 0.0
                    }
            except Exception as e:
                print(f"Error processing AI analysis: {str(e)}")
                return_item.ai_analysis = {
                    'category': 'Uncategorized',
                    'reason': f'Error processing analysis: {str(e)}',
                    'recommendation': 'Manual review',
                    'confidence': 0.0
                }
        # Otherwise use Gemini for analysis
        else:
            try:
                # Use image analysis if there are images, otherwise use text analysis
                if images:
                    # Use categorize_return method for image analysis
                    product_info = {
                        'name': product_name,
                        'category': product_category,
                        'return_reason': return_reason
                    }
                    
                    analysis_result = gemini_service.categorize_return(
                        image_data=images,
                        description=customer_description,
                        product_info=product_info
                    )
                else:
                    analysis_result = gemini_service.analyze_return(
                        product_name=product_name,
                        product_category=product_category,
                        customer_description=customer_description,
                        return_reason=return_reason,
                        images=[]
                    )
                
                # Ensure analysis result is valid JSON format
                if isinstance(analysis_result, dict):
                    # Check if required fields exist
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
                            'category': 'Uncategorized',
                            'reason': 'Analysis result incomplete',
                            'recommendation': 'Manual review',
                            'confidence': 0.0
                        }
                else:
                    return_item.ai_analysis = {
                        'category': 'Uncategorized',
                        'reason': 'Analysis result format error',
                        'recommendation': 'Manual review',
                        'confidence': 0.0
                    }
            except Exception as e:
                print(f"Analysis failed: {str(e)}")
                return_item.ai_analysis = {
                    'category': 'Uncategorized',
                    'reason': f'Analysis failed: {str(e)}',
                    'recommendation': 'Manual review',
                    'confidence': 0.0
                }
        
        db.session.add(return_item)
        db.session.commit()
        
        return jsonify(return_item.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Failed to create return: {str(e)}'
        }), 500

@bp.route('/<int:id>', methods=['PATCH'])
@jwt_required()
def update_return(id):
    """Update return order"""
    return_item = ReturnItem.query.get_or_404(id)
    data = request.get_json()
    
    # Update fields
    for key, value in data.items():
        if hasattr(return_item, key):
            setattr(return_item, key, value)
    
    # If updated related fields, re-analyze
    if any(key in data for key in ['product_name', 'product_category', 'return_reason', 'customer_description']):
        try:
            analysis_result = gemini_service.analyze_return(
                product_name=return_item.product_name,
                product_category=return_item.product_category,
                customer_description=return_item.customer_description,
                return_reason=return_item.return_reason,
                images=[]
            )
            
            # Ensure analysis result is valid JSON format
            if isinstance(analysis_result, dict):
                # Check if required fields exist
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
                        'category': 'Uncategorized',
                        'reason': 'Analysis result incomplete',
                        'recommendation': 'Manual review',
                        'confidence': 0.0
                    }
            else:
                return_item.ai_analysis = {
                    'category': 'Uncategorized',
                    'reason': 'Analysis result format error',
                    'recommendation': 'Manual review',
                    'confidence': 0.0
                }
        except Exception as e:
            print(f"Analysis failed: {str(e)}")
            return_item.ai_analysis = {
                'category': 'Uncategorized',
                'reason': f'Analysis failed: {str(e)}',
                'recommendation': 'Manual review',
                'confidence': 0.0
            }
    
    db.session.commit()
    return jsonify(return_item.to_dict())

@bp.route('/<int:id>/analyze', methods=['POST'])
@jwt_required()
def analyze_return(id):
    """Analyze a return order"""
    return_item = ReturnItem.query.get_or_404(id)
    
    try:
        analysis_result = gemini_service.analyze_return(
            product_name=return_item.product_name,
            product_category=return_item.product_category,
            customer_description=return_item.customer_description,
            return_reason=return_item.return_reason,
            images=[]
        )
        
        # Ensure analysis result is valid JSON format
        if isinstance(analysis_result, dict):
            # Check if required fields exist
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
                    'category': 'Uncategorized',
                    'reason': 'Analysis result incomplete',
                    'recommendation': 'Manual review',
                    'confidence': 0.0
                }
        else:
            return_item.ai_analysis = {
                'category': 'Uncategorized',
                'reason': 'Analysis result format error',
                'recommendation': 'Manual review',
                'confidence': 0.0
            }
        
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Analysis completed successfully',
            'data': return_item.to_dict()
        })
    except Exception as e:
        print(f"Analysis failed: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Analysis failed: {str(e)}'
        }), 500 