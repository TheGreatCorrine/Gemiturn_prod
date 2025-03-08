import os
from dotenv import load_dotenv
from app import create_app, db
from app.models.return_item import ReturnItem
from app.services.gemini_service import GeminiService
from datetime import datetime

# 加载环境变量
load_dotenv()

# 创建应用上下文
app = create_app()

def test_return_analysis():
    with app.app_context():
        try:
            # 读取测试图片
            image_path = 'test_images/Screenshot 2025-03-07 at 7.41.28 PM.png'
            with open(image_path, 'rb') as f:
                image_data = f.read()
            
            # 创建退货订单
            return_item = ReturnItem(
                order_id='TEST001',
                product_id='PROD001',
                product_name='测试产品',
                product_category='电子产品',
                return_reason='质量问题',
                customer_description='产品出现问题，需要退货',
                image_urls=[image_path],  # 临时使用本地路径
                status='pending',
                original_price=999.99,
                created_at=datetime.utcnow()
            )
            
            # 保存到数据库
            db.session.add(return_item)
            db.session.commit()
            print(f"创建退货订单成功，ID: {return_item.id}")
            
            # 使用 Gemini 服务分析
            gemini_service = GeminiService()
            
            # 分析图片
            image_analysis = gemini_service.analyze_image(image_data)
            print("\n图片分析结果:")
            print("-" * 50)
            print(image_analysis.get('analysis', '分析失败'))
            
            # 分类退货原因
            analysis = gemini_service.categorize_return(
                [image_data],
                return_item.customer_description,
                {
                    'name': return_item.product_name,
                    'category': return_item.product_category,
                    'price': return_item.original_price
                }
            )
            
            # 更新退货订单
            return_item.ai_category = analysis.get('category')
            return_item.ai_reason = analysis.get('reason')
            return_item.ai_recommendation = analysis.get('recommendation')
            return_item.ai_confidence = analysis.get('confidence')
            
            db.session.commit()
            
            print("\nAI 分析结果:")
            print("-" * 50)
            print(f"分类: {return_item.ai_category}")
            print(f"原因: {return_item.ai_reason}")
            print(f"建议: {return_item.ai_recommendation}")
            print(f"置信度: {return_item.ai_confidence}")
            
        except Exception as e:
            print(f"错误: {str(e)}")
            db.session.rollback()

if __name__ == '__main__':
    test_return_analysis() 