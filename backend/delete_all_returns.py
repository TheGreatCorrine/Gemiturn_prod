import sys
import os

# 添加父目录到路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.models.return_item import ReturnItem
from app.extensions import db

# 创建Flask应用
app = create_app()

# 使用应用上下文
with app.app_context():
    # 获取所有退货订单
    all_returns = ReturnItem.query.all()
    
    print(f"找到 {len(all_returns)} 条退货订单记录")
    
    # 确认删除
    confirmation = input("确定要删除所有退货订单吗？这个操作不可恢复！(y/n): ")
    
    if confirmation.lower() == 'y':
        # 删除所有退货订单
        for record in all_returns:
            db.session.delete(record)
        
        # 提交事务
        try:
            db.session.commit()
            print(f"成功删除 {len(all_returns)} 条退货订单记录")
        except Exception as e:
            db.session.rollback()
            print(f"删除退货订单失败: {str(e)}")
    else:
        print("操作已取消，没有删除任何记录") 