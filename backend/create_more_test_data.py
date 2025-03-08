import random
from datetime import datetime
from app import create_app
from app.models.return_item import ReturnItem
from app.extensions import db

# 创建Flask应用
app = create_app()

# 测试数据
test_data = [
    {
        "order_id": f"MORE-PENDING-{random.randint(10000, 99999)}",
        "product_id": f"PROD-{random.randint(1000, 9999)}",
        "product_name": "高端相机-待处理",
        "product_category": "电子产品",
        "return_reason": "功能问题",
        "customer_description": "相机自动对焦功能失效，无法正常拍摄。",
        "original_price": 2999.99,
        "ai_analysis": None,
        "status": "pending"
    },
    {
        "order_id": f"MORE-PROCESSING-{random.randint(10000, 99999)}",
        "product_id": f"PROD-{random.randint(1000, 9999)}",
        "product_name": "智能音箱-处理中",
        "product_category": "电子产品",
        "return_reason": "连接问题",
        "customer_description": "音箱无法连接到WiFi网络，重置后仍然无法解决。",
        "original_price": 599.99,
        "ai_analysis": None,
        "status": "processing"
    }
]

# 使用应用上下文
with app.app_context():
    # 添加测试数据
    for item_data in test_data:
        # 检查订单ID是否已存在
        existing_item = ReturnItem.query.filter_by(order_id=item_data["order_id"]).first()
        if existing_item:
            print(f"订单 {item_data['order_id']} 已存在，跳过")
            continue
            
        # 创建新的退货记录
        new_item = ReturnItem(
            order_id=item_data["order_id"],
            product_id=item_data["product_id"],
            product_name=item_data["product_name"],
            product_category=item_data["product_category"],
            return_reason=item_data["return_reason"],
            customer_description=item_data["customer_description"],
            original_price=item_data["original_price"],
            ai_analysis=item_data["ai_analysis"],
            status=item_data["status"],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.session.add(new_item)
    
    # 提交事务
    try:
        db.session.commit()
        print("成功添加更多测试数据")
    except Exception as e:
        db.session.rollback()
        print(f"添加测试数据失败: {str(e)}") 