from app import db
from app.models.return_history import ReturnHistory
from app.utils.logger import get_logger

logger = get_logger(__name__)

class ReturnHistoryService:
    """Service for managing return history"""
    
    def get_history_by_return_id(self, return_id):
        """
        Get history by return ID
        
        Args:
            return_id (int): Return ID
            
        Returns:
            list: List of history entries
        """
        return ReturnHistory.query.filter_by(return_item_id=return_id).order_by(ReturnHistory.created_at.desc()).all()
    
    def add_history_entry(self, return_id, status, notes=None, created_by=None):
        """
        Add a history entry
        
        Args:
            return_id (int): Return ID
            status (str): Status
            notes (str): Notes
            created_by (int): User ID who created the entry
            
        Returns:
            ReturnHistory: Created history entry
        """
        try:
            history = ReturnHistory(
                return_item_id=return_id,
                status=status,
                notes=notes,
                created_by=created_by
            )
            
            db.session.add(history)
            db.session.commit()
            
            return history
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error adding history entry: {str(e)}")
            raise
    
    def get_history_entry(self, history_id):
        """
        Get history entry by ID
        
        Args:
            history_id (int): History ID
            
        Returns:
            ReturnHistory: History entry
        """
        return ReturnHistory.query.get(history_id)
    
    def update_history_entry(self, history_id, **kwargs):
        """
        Update a history entry
        
        Args:
            history_id (int): History ID
            **kwargs: Fields to update
            
        Returns:
            ReturnHistory: Updated history entry
        """
        try:
            history = self.get_history_entry(history_id)
            if not history:
                logger.warning(f"History entry with ID {history_id} not found")
                return None
            
            for key, value in kwargs.items():
                if hasattr(history, key):
                    setattr(history, key, value)
            
            db.session.commit()
            return history
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating history entry: {str(e)}")
            raise
    
    def delete_history_entry(self, history_id):
        """
        Delete a history entry
        
        Args:
            history_id (int): History ID
            
        Returns:
            bool: True if deletion was successful
        """
        try:
            history = self.get_history_entry(history_id)
            if not history:
                logger.warning(f"History entry with ID {history_id} not found")
                return False
            
            db.session.delete(history)
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting history entry: {str(e)}")
            raise 