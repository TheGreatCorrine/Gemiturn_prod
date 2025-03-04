from flask import request
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.vendor_service import VendorService
from app.utils.logger import get_logger

logger = get_logger(__name__)

api = Namespace('vendors', description='Vendor operations')

# Models for API documentation
vendor_model = api.model('Vendor', {
    'id': fields.Integer(readonly=True, description='Vendor ID'),
    'name': fields.String(required=True, description='Vendor name'),
    'contact_person': fields.String(description='Contact person'),
    'email': fields.String(description='Email'),
    'phone': fields.String(description='Phone'),
    'address': fields.String(description='Address'),
    'return_policy': fields.String(description='Return policy'),
    'return_window_days': fields.Integer(description='Return window days'),
    'active': fields.Boolean(description='Whether the vendor is active'),
    'created_at': fields.DateTime(description='Creation timestamp'),
    'updated_at': fields.DateTime(description='Update timestamp')
})

vendor_input = api.model('VendorInput', {
    'name': fields.String(required=True, description='Vendor name'),
    'contact_person': fields.String(description='Contact person'),
    'email': fields.String(description='Email'),
    'phone': fields.String(description='Phone'),
    'address': fields.String(description='Address'),
    'return_policy': fields.String(description='Return policy'),
    'return_window_days': fields.Integer(description='Return window days')
})

vendor_update = api.model('VendorUpdate', {
    'name': fields.String(description='Vendor name'),
    'contact_person': fields.String(description='Contact person'),
    'email': fields.String(description='Email'),
    'phone': fields.String(description='Phone'),
    'address': fields.String(description='Address'),
    'return_policy': fields.String(description='Return policy'),
    'return_window_days': fields.Integer(description='Return window days'),
    'active': fields.Boolean(description='Whether the vendor is active')
})

@api.route('/')
class VendorList(Resource):
    @api.doc('list_vendors')
    @api.marshal_list_with(vendor_model)
    @jwt_required()
    def get(self):
        """List all vendors"""
        include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
        service = VendorService()
        return service.get_all_vendors(include_inactive=include_inactive)
    
    @api.doc('create_vendor')
    @api.expect(vendor_input)
    @api.marshal_with(vendor_model, code=201)
    @jwt_required()
    def post(self):
        """Create a new vendor"""
        data = request.json
        service = VendorService()
        
        vendor = service.create_vendor(
            name=data['name'],
            contact_person=data.get('contact_person'),
            email=data.get('email'),
            phone=data.get('phone'),
            address=data.get('address'),
            return_policy=data.get('return_policy'),
            return_window_days=data.get('return_window_days', 30)
        )
        
        return vendor, 201


@api.route('/<int:id>')
@api.param('id', 'The vendor identifier')
@api.response(404, 'Vendor not found')
class VendorResource(Resource):
    @api.doc('get_vendor')
    @api.marshal_with(vendor_model)
    @jwt_required()
    def get(self, id):
        """Get a vendor by ID"""
        service = VendorService()
        vendor = service.get_vendor_by_id(id)
        
        if not vendor:
            api.abort(404, f"Vendor with ID {id} not found")
            
        return vendor
    
    @api.doc('update_vendor')
    @api.expect(vendor_update)
    @api.marshal_with(vendor_model)
    @jwt_required()
    def put(self, id):
        """Update a vendor"""
        data = request.json
        service = VendorService()
        
        vendor = service.update_vendor(id, **data)
        
        if not vendor:
            api.abort(404, f"Vendor with ID {id} not found")
            
        return vendor
    
    @api.doc('delete_vendor')
    @api.response(204, 'Vendor deleted')
    @jwt_required()
    def delete(self, id):
        """Delete a vendor"""
        service = VendorService()
        result = service.delete_vendor(id)
        
        if not result:
            api.abort(404, f"Vendor with ID {id} not found")
            
        return '', 204


@api.route('/<int:id>/deactivate')
@api.param('id', 'The vendor identifier')
@api.response(404, 'Vendor not found')
class VendorDeactivate(Resource):
    @api.doc('deactivate_vendor')
    @api.marshal_with(vendor_model)
    @jwt_required()
    def put(self, id):
        """Deactivate a vendor"""
        service = VendorService()
        vendor = service.deactivate_vendor(id)
        
        if not vendor:
            api.abort(404, f"Vendor with ID {id} not found")
            
        return vendor 