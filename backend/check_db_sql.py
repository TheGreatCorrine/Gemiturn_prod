from app import create_app
from app.extensions import db
from sqlalchemy import text
import json

# 创建Flask应用
app = create_app()

# 使用应用上下文
with app.app_context():
    # 使用SQL语句查询所有记录
    result = db.session.execute(text("SELECT * FROM return_items"))
    rows = result.fetchall()
    print(f"总记录数: {len(rows)}")
    
    # 使用SQL语句查询未分析的记录
    result = db.session.execute(text("SELECT * FROM return_items WHERE ai_analysis IS NULL"))
    unanalyzed_rows = result.fetchall()
    print(f"未分析记录数: {len(unanalyzed_rows)}")
    
    # 打印所有记录的详细信息
    print("\n所有记录详情:")
    for row in rows:
        print(f"ID: {row.id}, 订单ID: {row.order_id}, 产品: {row.product_name}")
        print(f"AI分析: {row.ai_analysis}")
        print("-" * 50)
        
    # 打印未分析记录的详细信息
    print("\n未分析记录详情:")
    for row in unanalyzed_rows:
        print(f"ID: {row.id}, 订单ID: {row.order_id}, 产品: {row.product_name}")
        print(f"AI分析: {row.ai_analysis}")
        print("-" * 50) 