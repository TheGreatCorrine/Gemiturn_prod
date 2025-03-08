from app import create_app
from app.models.return_item import ReturnItem
from app.extensions import db

# 创建Flask应用
app = create_app()

# 使用应用上下文
with app.app_context():
    # 删除所有测试数据
    test_records = ReturnItem.query.filter(
        ReturnItem.order_id.like('TEST-%')
    ).all()
    
    print(f"找到 {len(test_records)} 条测试记录")
    
    for record in test_records:
        db.session.delete(record)
    
    # 提交事务
    try:
        db.session.commit()
        print(f"成功删除 {len(test_records)} 条测试记录")
    except Exception as e:
        db.session.rollback()
        print(f"删除测试数据失败: {str(e)}") 