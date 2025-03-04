from app import db
from app.models.product_category import ProductCategory
from app.utils.logger import get_logger

logger = get_logger(__name__)

class CategoryService:
    """Service for managing product categories"""
    
    def get_all_categories(self, include_inactive=False):
        """
        Get all top-level categories
        
        Args:
            include_inactive (bool): Whether to include inactive categories
            
        Returns:
            list: List of top-level categories
        """
        query = ProductCategory.query.filter_by(parent_id=None)
        return query.all()
    
    def get_category_by_id(self, category_id):
        """
        Get category by ID
        
        Args:
            category_id (int): Category ID
            
        Returns:
            ProductCategory: Category object
        """
        return ProductCategory.query.get(category_id)
    
    def get_category_by_name(self, name):
        """
        Get category by name
        
        Args:
            name (str): Category name
            
        Returns:
            ProductCategory: Category object
        """
        return ProductCategory.query.filter_by(name=name).first()
    
    def create_category(self, name, description=None, parent_id=None, 
                       default_return_policy=None, default_return_window_days=30):
        """
        Create a new category
        
        Args:
            name (str): Category name
            description (str): Category description
            parent_id (int): Parent category ID
            default_return_policy (str): Default return policy
            default_return_window_days (int): Default return window days
            
        Returns:
            ProductCategory: Created category
        """
        try:
            # Check if category already exists
            existing = self.get_category_by_name(name)
            if existing:
                logger.warning(f"Category with name '{name}' already exists")
                return existing
            
            category = ProductCategory(
                name=name,
                description=description,
                parent_id=parent_id,
                default_return_policy=default_return_policy,
                default_return_window_days=default_return_window_days
            )
            
            db.session.add(category)
            db.session.commit()
            
            return category
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating category: {str(e)}")
            raise
    
    def update_category(self, category_id, **kwargs):
        """
        Update a category
        
        Args:
            category_id (int): Category ID
            **kwargs: Fields to update
            
        Returns:
            ProductCategory: Updated category
        """
        try:
            category = self.get_category_by_id(category_id)
            if not category:
                logger.warning(f"Category with ID {category_id} not found")
                return None
            
            for key, value in kwargs.items():
                if hasattr(category, key):
                    setattr(category, key, value)
            
            db.session.commit()
            return category
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating category: {str(e)}")
            raise
    
    def delete_category(self, category_id):
        """
        Delete a category
        
        Args:
            category_id (int): Category ID
            
        Returns:
            bool: True if deletion was successful
        """
        try:
            category = self.get_category_by_id(category_id)
            if not category:
                logger.warning(f"Category with ID {category_id} not found")
                return False
            
            # Check if category has children
            if category.children.count() > 0:
                logger.warning(f"Cannot delete category with ID {category_id} because it has children")
                return False
            
            db.session.delete(category)
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting category: {str(e)}")
            raise
    
    def get_category_tree(self):
        """
        Get category tree
        
        Returns:
            list: List of categories with their children
        """
        top_level = self.get_all_categories()
        return [category.to_dict(include_children=True) for category in top_level] 