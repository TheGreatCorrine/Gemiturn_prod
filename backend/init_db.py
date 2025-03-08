from app import create_app, db
from app.models.return_item import ReturnItem

app = create_app('development')

with app.app_context():
    # 创建所有表
    db.create_all()
    print("数据库表已创建") 