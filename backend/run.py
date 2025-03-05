import os
import argparse
from dotenv import load_dotenv

# 解析命令行参数
parser = argparse.ArgumentParser(description='启动Gemiturn后端服务')
parser.add_argument('--port', type=int, default=5000, help='服务端口号')
args = parser.parse_args()

# Load environment variables
load_dotenv()

# Import app factory
from app import create_app, db
from app.models import User, ReturnItem, ReturnHistory, Vendor, ProductCategory

# Create app instance
app = create_app(os.getenv('FLASK_ENV', 'development'))

@app.shell_context_processor
def make_shell_context():
    """Add objects to shell context"""
    return {
        'db': db,
        'User': User,
        'ReturnItem': ReturnItem,
        'ReturnHistory': ReturnHistory,
        'Vendor': Vendor,
        'ProductCategory': ProductCategory
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=args.port) 