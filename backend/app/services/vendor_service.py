from app import db
from app.models.vendor import Vendor
from app.utils.logger import get_logger

logger = get_logger(__name__)

class VendorService:
    """Service for managing vendors"""
    
    def get_all_vendors(self, include_inactive=False):
        """
        Get all vendors
        
        Args:
            include_inactive (bool): Whether to include inactive vendors
            
        Returns:
            list: List of vendors
        """
        query = Vendor.query
        if not include_inactive:
            query = query.filter_by(active=True)
        return query.all()
    
    def get_vendor_by_id(self, vendor_id):
        """
        Get vendor by ID
        
        Args:
            vendor_id (int): Vendor ID
            
        Returns:
            Vendor: Vendor object
        """
        return Vendor.query.get(vendor_id)
    
    def get_vendor_by_name(self, name):
        """
        Get vendor by name
        
        Args:
            name (str): Vendor name
            
        Returns:
            Vendor: Vendor object
        """
        return Vendor.query.filter_by(name=name).first()
    
    def create_vendor(self, name, contact_person=None, email=None, phone=None, 
                     address=None, return_policy=None, return_window_days=30):
        """
        Create a new vendor
        
        Args:
            name (str): Vendor name
            contact_person (str): Contact person
            email (str): Email
            phone (str): Phone
            address (str): Address
            return_policy (str): Return policy
            return_window_days (int): Return window days
            
        Returns:
            Vendor: Created vendor
        """
        try:
            # Check if vendor already exists
            existing = self.get_vendor_by_name(name)
            if existing:
                logger.warning(f"Vendor with name '{name}' already exists")
                return existing
            
            vendor = Vendor(
                name=name,
                contact_person=contact_person,
                email=email,
                phone=phone,
                address=address,
                return_policy=return_policy,
                return_window_days=return_window_days
            )
            
            db.session.add(vendor)
            db.session.commit()
            
            return vendor
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating vendor: {str(e)}")
            raise
    
    def update_vendor(self, vendor_id, **kwargs):
        """
        Update a vendor
        
        Args:
            vendor_id (int): Vendor ID
            **kwargs: Fields to update
            
        Returns:
            Vendor: Updated vendor
        """
        try:
            vendor = self.get_vendor_by_id(vendor_id)
            if not vendor:
                logger.warning(f"Vendor with ID {vendor_id} not found")
                return None
            
            for key, value in kwargs.items():
                if hasattr(vendor, key):
                    setattr(vendor, key, value)
            
            db.session.commit()
            return vendor
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating vendor: {str(e)}")
            raise
    
    def delete_vendor(self, vendor_id):
        """
        Delete a vendor
        
        Args:
            vendor_id (int): Vendor ID
            
        Returns:
            bool: True if deletion was successful
        """
        try:
            vendor = self.get_vendor_by_id(vendor_id)
            if not vendor:
                logger.warning(f"Vendor with ID {vendor_id} not found")
                return False
            
            db.session.delete(vendor)
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting vendor: {str(e)}")
            raise
    
    def deactivate_vendor(self, vendor_id):
        """
        Deactivate a vendor
        
        Args:
            vendor_id (int): Vendor ID
            
        Returns:
            Vendor: Updated vendor
        """
        return self.update_vendor(vendor_id, active=False) 