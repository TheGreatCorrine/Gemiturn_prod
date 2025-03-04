import logging
import os
import sys
from logging.handlers import RotatingFileHandler
from flask import current_app

def get_logger(name, level=None):
    """
    Create a logger with the given name and level
    
    Args:
        name (str): Logger name
        level (int): Logging level (optional, defaults to app config)
        
    Returns:
        logging.Logger: Configured logger
    """
    # 如果没有指定级别，尝试从应用配置中获取
    if level is None:
        try:
            from app.config.config import Config
            level = Config.get_log_level()
        except ImportError:
            level = logging.INFO
    
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Avoid adding handlers multiple times
    if not logger.handlers:
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(level)
        console_format = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(console_format)
        logger.addHandler(console_handler)
        
        # File handler (only in non-testing environments)
        if os.environ.get('FLASK_ENV') != 'testing':
            log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'logs')
            os.makedirs(log_dir, exist_ok=True)
            
            file_handler = RotatingFileHandler(
                os.path.join(log_dir, 'gemiturn.log'),
                maxBytes=10485760,  # 10MB
                backupCount=10
            )
            file_handler.setLevel(level)
            file_format = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            file_handler.setFormatter(file_format)
            logger.addHandler(file_handler)
    
    return logger 