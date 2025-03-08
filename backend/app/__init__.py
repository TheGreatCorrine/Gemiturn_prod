from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from app.config.config import config
from app.extensions import db, migrate
from app.routes import auth, returns, gemini
from app.api import api_bp

# Initialize extensions
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name='development'):
    """Application factory function"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Initialize extensions with app
    CORS(app, 
         resources={r"/*": {"origins": ["http://localhost:3001", "http://localhost:3000"]}},
         allow_headers=["Content-Type", "Authorization", "Accept"],
         methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
         supports_credentials=True)
    
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Register blueprints
    app.register_blueprint(auth, url_prefix='/api/auth')
    app.register_blueprint(returns, url_prefix='/api/returns')
    app.register_blueprint(gemini, url_prefix='/api/gemini')
    
    # Register API blueprint
    app.register_blueprint(api_bp)
    
    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}, 200
    
    return app 