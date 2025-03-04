import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import app factory
from app import create_app, db
from app.models import User, ReturnItem

# Create app instance
app = create_app(os.getenv('FLASK_ENV', 'development'))

@app.shell_context_processor
def make_shell_context():
    """Add objects to shell context"""
    return {
        'db': db,
        'User': User,
        'ReturnItem': ReturnItem
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000))) 