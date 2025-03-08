from app import create_app
from app.models.return_item import ReturnItem
from app.extensions import db
import json

# 创建Flask应用
app = create_app()

# 使用应用上下文
with app.app_context():
    # 查询所有记录
    all_returns = ReturnItem.query.all()
    print(f"总记录数: {len(all_returns)}")
    
    # 查询未分析的记录
    unanalyzed_returns = ReturnItem.query.filter(ReturnItem.ai_analysis == None).all()
    print(f"未分析记录数: {len(unanalyzed_returns)}")
    
    # 打印所有记录的详细信息
    print("\n所有记录详情:")
    for item in all_returns:
        print(f"ID: {item.id}, 订单ID: {item.order_id}, 产品: {item.product_name}")
        print(f"AI分析: {item.ai_analysis}")
        print("-" * 50) 