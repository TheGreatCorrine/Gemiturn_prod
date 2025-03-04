from flask import request, current_app
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.datastructures import FileStorage

from app import db
from app.models.return_item import ReturnItem
from app.services.gemini_service import GeminiService
from app.services.storage_service import StorageService
from app.utils.logger import get_logger
from app.services.return_history_service import ReturnHistoryService

logger = get_logger(__name__)

api = Namespace('returns', description='Return item operations')

# Models for API documentation
return_item_model = api.model('ReturnItem', {
    'id': fields.Integer(readonly=True, description='Return item ID'),
    'order_id': fields.String(required=True, description='Order ID'),
    'product_id': fields.String(required=True, description='Product ID'),
    'product_name': fields.String(required=True, description='Product name'),
    'product_category': fields.String(required=True, description='Product category'),
    'return_reason': fields.String(description='Return reason'),
    'customer_description': fields.String(description='Customer description'),
    'image_urls': fields.List(fields.String, description='Image URLs'),
    'status': fields.String(description='Status'),
    'original_price': fields.Float(description='Original price'),
    'resale_price': fields.Float(description='Resale price'),
    'created_at': fields.DateTime(description='Creation timestamp'),
    'updated_at': fields.DateTime(description='Update timestamp'),
    'processed_at': fields.DateTime(description='Processing timestamp')
})

return_item_input = api.model('ReturnItemInput', {
    'order_id': fields.String(required=True, description='Order ID'),
    'product_id': fields.String(required=True, description='Product ID'),
    'product_name': fields.String(required=True, description='Product name'),
    'product_category': fields.String(required=True, description='Product category'),
    'return_reason': fields.String(description='Return reason'),
    'customer_description': fields.String(description='Customer description'),
    'original_price': fields.Float(description='Original price')
})

ai_analysis_model = api.model('AIAnalysis', {
    'ai_category': fields.String(description='AI-detected category'),
    'ai_reason': fields.String(description='AI-detected reason'),
    'ai_recommendation': fields.String(description='AI recommendation'),
    'ai_confidence': fields.Float(description='AI confidence level')
})

status_update_model = api.model('StatusUpdate', {
    'status': fields.String(required=True, description='New status'),
    'resale_price': fields.Float(description='Resale price')
})

# File upload parser
upload_parser = api.parser()
upload_parser.add_argument('file', location='files', type=FileStorage, required=True)

# 添加历史记录模型
return_history_model = api.model('ReturnHistory', {
    'id': fields.Integer(readonly=True, description='History ID'),
    'return_item_id': fields.Integer(description='Return item ID'),
    'status': fields.String(description='Status'),
    'notes': fields.String(description='Notes'),
    'created_by': fields.Integer(description='User ID who created the entry'),
    'created_at': fields.DateTime(description='Creation timestamp'),
    'user': fields.String(description='Username who created the entry')
})

history_input = api.model('HistoryInput', {
    'notes': fields.String(required=True, description='Notes')
})

@api.route('/')
class ReturnItemList(Resource):
    @api.doc('list_return_items')
    @api.marshal_list_with(return_item_model)
    @jwt_required()
    def get(self):
        """List all return items"""
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', current_app.config['ITEMS_PER_PAGE'], type=int)
        status = request.args.get('status')
        
        query = ReturnItem.query
        
        if status:
            query = query.filter_by(status=status)
        
        items = query.order_by(ReturnItem.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return items.items
    
    @api.doc('create_return_item')
    @api.expect(return_item_input)
    @api.marshal_with(return_item_model, code=201)
    @jwt_required()
    def post(self):
        """Create a new return item"""
        data = request.json
        
        return_item = ReturnItem(
            order_id=data['order_id'],
            product_id=data['product_id'],
            product_name=data['product_name'],
            product_category=data['product_category'],
            return_reason=data.get('return_reason'),
            customer_description=data.get('customer_description'),
            original_price=data.get('original_price'),
            image_urls=[],
            status='pending'
        )
        
        db.session.add(return_item)
        db.session.commit()
        
        return return_item, 201


@api.route('/<int:id>')
@api.param('id', 'The return item identifier')
@api.response(404, 'Return item not found')
class ReturnItemResource(Resource):
    @api.doc('get_return_item')
    @api.marshal_with(return_item_model)
    @jwt_required()
    def get(self, id):
        """Get a return item by ID"""
        return_item = ReturnItem.query.get_or_404(id)
        return return_item
    
    @api.doc('update_return_item_status')
    @api.expect(status_update_model)
    @api.marshal_with(return_item_model)
    @jwt_required()
    def patch(self, id):
        """Update a return item's status"""
        return_item = ReturnItem.query.get_or_404(id)
        data = request.json
        user_id = get_jwt_identity()
        
        # 更新状态
        old_status = return_item.status
        return_item.status = data['status']
        if 'resale_price' in data:
            return_item.resale_price = data['resale_price']
        
        if data['status'] == 'completed':
            return_item.processed_at = db.func.now()
            return_item.processed_by = user_id
        
        db.session.commit()
        
        # 添加历史记录
        if old_status != return_item.status:
            history_service = ReturnHistoryService()
            history_service.add_history_entry(
                return_id=id,
                status=return_item.status,
                notes=f"Status changed from {old_status} to {return_item.status}",
                created_by=user_id
            )
        
        return return_item
    
    @api.doc('delete_return_item')
    @api.response(204, 'Return item deleted')
    @jwt_required()
    def delete(self, id):
        """Delete a return item"""
        return_item = ReturnItem.query.get_or_404(id)
        
        # Delete associated images
        if return_item.image_urls:
            storage_service = StorageService()
            for url in return_item.image_urls:
                storage_service.delete_file(url)
        
        db.session.delete(return_item)
        db.session.commit()
        return '', 204


@api.route('/<int:id>/images')
@api.param('id', 'The return item identifier')
@api.response(404, 'Return item not found')
class ReturnItemImages(Resource):
    @api.doc('upload_return_item_image')
    @api.expect(upload_parser)
    @api.marshal_with(return_item_model)
    @jwt_required()
    def post(self, id):
        """Upload an image for a return item"""
        return_item = ReturnItem.query.get_or_404(id)
        
        args = upload_parser.parse_args()
        file = args['file']
        
        # Upload to Cloud Storage
        storage_service = StorageService()
        file_url = storage_service.upload_file(
            file.read(),
            original_filename=file.filename,
            folder=f'returns/{id}'
        )
        
        # Update return item
        if not return_item.image_urls:
            return_item.image_urls = []
        
        return_item.image_urls.append(file_url)
        db.session.commit()
        
        return return_item


@api.route('/<int:id>/analyze')
@api.param('id', 'The return item identifier')
@api.response(404, 'Return item not found')
class ReturnItemAnalysis(Resource):
    @api.doc('analyze_return_item')
    @api.marshal_with(return_item_model)
    @jwt_required()
    def post(self, id):
        """Analyze a return item using Gemini AI"""
        return_item = ReturnItem.query.get_or_404(id)
        
        # Skip if already analyzed
        if return_item.ai_category and return_item.ai_reason:
            return return_item
        
        try:
            # Analyze with Gemini
            gemini_service = GeminiService()
            analysis = gemini_service.analyze_return(
                return_item.customer_description,
                return_item.image_urls
            )
            
            # Update return item with analysis results
            return_item.ai_category = analysis.get('category')
            return_item.ai_reason = analysis.get('reason')
            return_item.ai_recommendation = analysis.get('recommendation')
            return_item.ai_confidence = analysis.get('confidence')
            
            db.session.commit()
            return return_item
            
        except Exception as e:
            logger.error(f"Error analyzing return item {id}: {str(e)}")
            api.abort(500, f"Error analyzing return item: {str(e)}")


@api.route('/batch-analyze')
class BatchAnalysis(Resource):
    @api.doc('batch_analyze_return_items')
    @jwt_required()
    def post(self):
        """Analyze multiple pending return items in batch"""
        try:
            # Get pending items without AI analysis
            items = ReturnItem.query.filter_by(status='pending') \
                .filter(ReturnItem.ai_category.is_(None)) \
                .limit(10).all()
            
            if not items:
                return {'message': 'No pending items to analyze'}, 200
            
            gemini_service = GeminiService()
            processed = []
            
            for item in items:
                analysis = gemini_service.analyze_return(
                    item.customer_description,
                    item.image_urls
                )
                
                item.ai_category = analysis.get('category')
                item.ai_reason = analysis.get('reason')
                item.ai_recommendation = analysis.get('recommendation')
                item.ai_confidence = analysis.get('confidence')
                
                processed.append(item.id)
            
            db.session.commit()
            return {'message': f'Processed {len(processed)} items', 'items': processed}, 200
            
        except Exception as e:
            logger.error(f"Error in batch analysis: {str(e)}")
            api.abort(500, f"Error in batch analysis: {str(e)}")


@api.route('/batch-approve')
class BatchApprove(Resource):
    @api.doc('batch_approve_return_items')
    @jwt_required()
    def post(self):
        """Approve multiple return items based on AI recommendations"""
        try:
            # Get items with high confidence AI recommendations
            items = ReturnItem.query.filter_by(status='pending') \
                .filter(ReturnItem.ai_confidence >= 0.8) \
                .limit(20).all()
            
            if not items:
                return {'message': 'No items to approve'}, 200
            
            processed = []
            
            for item in items:
                # Set status based on AI recommendation
                if item.ai_recommendation == 'resell_as_new':
                    item.status = 'approved'
                    item.resale_price = item.original_price
                elif item.ai_recommendation == 'discount':
                    item.status = 'approved'
                    # Apply 20% discount
                    item.resale_price = item.original_price * 0.8
                elif item.ai_recommendation == 'return_to_vendor':
                    item.status = 'return_to_vendor'
                else:
                    item.status = 'manual_review'
                
                item.processed_at = db.func.now()
                processed.append(item.id)
            
            db.session.commit()
            return {'message': f'Processed {len(processed)} items', 'items': processed}, 200
            
        except Exception as e:
            logger.error(f"Error in batch approval: {str(e)}")
            api.abort(500, f"Error in batch approval: {str(e)}")


@api.route('/<int:id>/history')
@api.param('id', 'The return item identifier')
@api.response(404, 'Return item not found')
class ReturnItemHistory(Resource):
    @api.doc('get_return_item_history')
    @api.marshal_list_with(return_history_model)
    @jwt_required()
    def get(self, id):
        """Get history for a return item"""
        # 确保返回项目存在
        return_item = ReturnItem.query.get_or_404(id)
        
        # 获取历史记录
        history_service = ReturnHistoryService()
        history = history_service.get_history_by_return_id(id)
        
        return history
    
    @api.doc('add_return_item_history')
    @api.expect(history_input)
    @api.marshal_with(return_history_model, code=201)
    @jwt_required()
    def post(self, id):
        """Add history entry for a return item"""
        # 确保返回项目存在
        return_item = ReturnItem.query.get_or_404(id)
        
        data = request.json
        user_id = get_jwt_identity()
        
        # 添加历史记录
        history_service = ReturnHistoryService()
        history = history_service.add_history_entry(
            return_id=id,
            status=return_item.status,
            notes=data.get('notes'),
            created_by=user_id
        )
        
        return history, 201 