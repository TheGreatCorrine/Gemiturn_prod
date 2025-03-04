import os
from datetime import timedelta
import logging

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key-please-change-in-production')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-dev-key-please-change')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    
    # Database
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Google Cloud
    GCP_PROJECT_ID = os.environ.get('GCP_PROJECT_ID')
    GCP_STORAGE_BUCKET = os.environ.get('GCP_STORAGE_BUCKET')
    GCP_REGION = os.environ.get('GCP_REGION', 'us-central1')
    GCP_CREDENTIALS_FILE = os.environ.get('GCP_CREDENTIALS_FILE')
    
    # Gemini API
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    
    # App settings
    ITEMS_PER_PAGE = int(os.environ.get('ITEMS_PER_PAGE', 10))
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    
    # 获取日志级别
    @staticmethod
    def get_log_level():
        log_level = os.environ.get('LOG_LEVEL', 'INFO').upper()
        if log_level == 'DEBUG':
            return logging.DEBUG
        elif log_level == 'INFO':
            return logging.INFO
        elif log_level == 'WARNING':
            return logging.WARNING
        elif log_level == 'ERROR':
            return logging.ERROR
        else:
            return logging.INFO


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
        'sqlite:///dev-gemiturn.db'


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL') or \
        'sqlite:///test-gemiturn.db'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=5)


class ProductionConfig(Config):
    """Production configuration"""
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    
    # Override these in production
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    
    # 生产环境日志级别默认为 WARNING
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'WARNING')


config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
} 