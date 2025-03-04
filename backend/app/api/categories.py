from flask import request
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.category_service import CategoryService
from app.utils.logger import get_logger

logger = get_logger(__name__)

api = Namespace('categories', description='Product category operations')

# Models for API documentation
category_model = api.model('Category', {
    'id': fields.Integer(readonly=True, description='Category ID'),
    'name': fields.String(required=True, description='Category name'),
    'description': fields.String(description='Category description'),
    'parent_id': fields.Integer(description='Parent category ID'),
    'default_return_policy': fields.String(description='Default return policy'),
    'default_return_window_days': fields.Integer(description='Default return window days'),
    'created_at': fields.DateTime(description='Creation timestamp'),
    'updated_at': fields.DateTime(description='Update timestamp')
})

category_input = api.model('CategoryInput', {
    'name': fields.String(required=True, description='Category name'),
    'description': fields.String(description='Category description'),
    'parent_id': fields.Integer(description='Parent category ID'),
    'default_return_policy': fields.String(description='Default return policy'),
    'default_return_window_days': fields.Integer(description='Default return window days')
})

category_update = api.model('CategoryUpdate', {
    'name': fields.String(description='Category name'),
    'description': fields.String(description='Category description'),
    'parent_id': fields.Integer(description='Parent category ID'),
    'default_return_policy': fields.String(description='Default return policy'),
    'default_return_window_days': fields.Integer(description='Default return window days')
})

@api.route('/')
class CategoryList(Resource):
    @api.doc('list_categories')
    @api.marshal_list_with(category_model)
    @jwt_required()
    def get(self):
        """List all categories"""
        service = CategoryService()
        return service.get_all_categories()
    
    @api.doc('create_category')
    @api.expect(category_input)
    @api.marshal_with(category_model, code=201)
    @jwt_required()
    def post(self):
        """Create a new category"""
        data = request.json
        service = CategoryService()
        
        category = service.create_category(
            name=data['name'],
            description=data.get('description'),
            parent_id=data.get('parent_id'),
            default_return_policy=data.get('default_return_policy'),
            default_return_window_days=data.get('default_return_window_days', 30)
        )
        
        return category, 201


@api.route('/<int:id>')
@api.param('id', 'The category identifier')
@api.response(404, 'Category not found')
class CategoryResource(Resource):
    @api.doc('get_category')
    @api.marshal_with(category_model)
    @jwt_required()
    def get(self, id):
        """Get a category by ID"""
        service = CategoryService()
        category = service.get_category_by_id(id)
        
        if not category:
            api.abort(404, f"Category with ID {id} not found")
            
        return category
    
    @api.doc('update_category')
    @api.expect(category_update)
    @api.marshal_with(category_model)
    @jwt_required()
    def put(self, id):
        """Update a category"""
        data = request.json
        service = CategoryService()
        
        category = service.update_category(id, **data)
        
        if not category:
            api.abort(404, f"Category with ID {id} not found")
            
        return category
    
    @api.doc('delete_category')
    @api.response(204, 'Category deleted')
    @jwt_required()
    def delete(self, id):
        """Delete a category"""
        service = CategoryService()
        result = service.delete_category(id)
        
        if not result:
            api.abort(404, f"Category with ID {id} not found or cannot be deleted")
            
        return '', 204


@api.route('/tree')
class CategoryTree(Resource):
    @api.doc('get_category_tree')
    @jwt_required()
    def get(self):
        """Get category tree"""
        service = CategoryService()
        return service.get_category_tree() 