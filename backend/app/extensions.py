from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# 初始化数据库对象
db = SQLAlchemy()

# 初始化迁移对象
migrate = Migrate() 