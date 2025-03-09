import os
from datetime import timedelta
import logging
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # CORS Configuration
    CORS_HEADERS = 'Content-Type'
    
    # Database
    SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Google Cloud
    GCP_PROJECT_ID = os.getenv('GCP_PROJECT_ID', '')
    GCP_STORAGE_BUCKET = os.getenv('GCP_STORAGE_BUCKET', '')
    GCP_REGION = os.environ.get('GCP_REGION', 'us-central1')
    GCP_CREDENTIALS_FILE = os.environ.get('GCP_CREDENTIALS_FILE')
    
    # Local Storage
    USE_LOCAL_STORAGE = os.getenv('USE_LOCAL_STORAGE', 'True').lower() in ('true', '1', 't')
    LOCAL_STORAGE_PATH = os.getenv('LOCAL_STORAGE_PATH', 'uploads')
    
    # Gemini API
    GOOGLE_API_KEY = os.environ.get('GEMINI_API_KEY')
    
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

    # 文件上传配置
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    CORS_ORIGINS = ['http://localhost:3000']  # 前端开发服务器地址


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test-gemiturn.db'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=5)


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    CORS_ORIGINS = ['https://your-production-domain.com']  # 生产环境前端地址
    
    # Google Cloud SQL配置
    # 使用环境变量获取连接信息
    DB_USER = os.environ.get('DB_USER', 'gemiturn')
    DB_PASS = os.environ.get('DB_PASS', 'your-password')
    DB_NAME = os.environ.get('DB_NAME', 'gemiturn')
    CLOUD_SQL_CONNECTION_NAME = os.environ.get('CLOUD_SQL_CONNECTION_NAME', 'your-project:your-region:your-instance')
    
    # MySQL
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USER}:{DB_PASS}@/{DB_NAME}?unix_socket=/cloudsql/{CLOUD_SQL_CONNECTION_NAME}"
    
    # 或者使用PostgreSQL
    # SQLALCHEMY_DATABASE_URI = f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@/{DB_NAME}?host=/cloudsql/{CLOUD_SQL_CONNECTION_NAME}"


config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
} 