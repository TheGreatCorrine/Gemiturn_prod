import os
from app import create_app

# 创建应用实例
app = create_app(os.getenv('FLASK_ENV', 'development'))

if __name__ == '__main__':
    # 本地开发时使用
    app.run(host='0.0.0.0', port=5002, debug=True) 