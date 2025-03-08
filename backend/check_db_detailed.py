from app import create_app
from app.models.return_item import ReturnItem
from app.extensions import db
import json
from sqlalchemy import text

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
    
    # 查询不同状态的记录
    pending_returns = ReturnItem.query.filter_by(status='pending').all()
    processing_returns = ReturnItem.query.filter_by(status='processing').all()
    completed_returns = ReturnItem.query.filter_by(status='completed').all()
    
    print(f"待处理记录数: {len(pending_returns)}")
    print(f"处理中记录数: {len(processing_returns)}")
    print(f"已完成记录数: {len(completed_returns)}")
    
    # 查询符合批量分析条件的记录
    result = db.session.execute(
        text("""
            SELECT * FROM return_items 
            WHERE (status = 'pending' OR status = 'processing') 
            AND (ai_analysis IS NULL OR ai_analysis = 'null')
        """)
    )
    eligible_returns = result.fetchall()
    print(f"符合批量分析条件的记录数: {len(eligible_returns)}")
    
    # 打印所有记录的详细信息
    print("\n所有记录详情:")
    for item in all_returns:
        print(f"ID: {item.id}, 订单ID: {item.order_id}, 产品: {item.product_name}")
        print(f"状态: {item.status}")
        print(f"AI分析: {item.ai_analysis}")
        print("-" * 50) 