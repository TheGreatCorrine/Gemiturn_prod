"""
数据库迁移脚本
用于创建初始数据库表结构
"""

import os
import sys
from datetime import datetime

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models import User, ReturnItem, ReturnHistory, Vendor, ProductCategory

# 创建应用实例
app = create_app('development')

# 创建应用上下文
with app.app_context():
    # 创建所有表
    db.create_all()
    
    print("数据库表已创建")
    
    # 检查是否需要创建管理员用户
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(
            username='admin',
            email='admin@example.com',
            role='admin',
            is_active=True,
            created_at=datetime.utcnow()
        )
        admin.password = 'admin123'  # 设置密码
        db.session.add(admin)
        db.session.commit()
        print("管理员用户已创建")
    
    # 创建一些初始产品类别
    categories = [
        {'name': '电子产品', 'description': '包括手机、电脑、平板等电子设备'},
        {'name': '服装', 'description': '包括上衣、裤子、鞋子等服装'},
        {'name': '家居', 'description': '包括家具、装饰品等家居用品'},
        {'name': '食品', 'description': '包括零食、饮料等食品'},
        {'name': '美妆', 'description': '包括化妆品、护肤品等美妆产品'}
    ]
    
    for category_data in categories:
        category = ProductCategory.query.filter_by(name=category_data['name']).first()
        if not category:
            category = ProductCategory(**category_data)
            db.session.add(category)
    
    db.session.commit()
    print("初始产品类别已创建")
    
    # 创建一些初始供应商
    vendors = [
        {'name': '电子供应商A', 'contact_person': '张三', 'email': 'supplier_a@example.com', 'phone': '13800000001'},
        {'name': '服装供应商B', 'contact_person': '李四', 'email': 'supplier_b@example.com', 'phone': '13800000002'},
        {'name': '家居供应商C', 'contact_person': '王五', 'email': 'supplier_c@example.com', 'phone': '13800000003'}
    ]
    
    for vendor_data in vendors:
        vendor = Vendor.query.filter_by(name=vendor_data['name']).first()
        if not vendor:
            vendor = Vendor(**vendor_data)
            db.session.add(vendor)
    
    db.session.commit()
    print("初始供应商已创建")
    
    print("数据库初始化完成") 