import requests
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

from app.interfaces.platform_api import PlatformAPIInterface
from app.utils.logger import get_logger

logger = get_logger(__name__)

class MockPlatformAPI(PlatformAPIInterface):
    """
    模拟电商平台 API 实现
    用于开发和测试阶段，不需要真实的外部 API
    """
    
    def __init__(self, api_key: str = None, base_url: str = None):
        """
        初始化模拟 API
        
        Args:
            api_key (str): API 密钥（可选）
            base_url (str): API 基础 URL（可选）
        """
        self.api_key = api_key or "mock_api_key"
        self.base_url = base_url or "https://mock-ecommerce-api.example.com"
        self.is_authenticated = False
        
        # 模拟数据
        self.mock_returns = self._generate_mock_returns()
        
    def authenticate(self) -> bool:
        """模拟身份验证过程"""
        logger.info("模拟 API 身份验证")
        self.is_authenticated = True
        return True
        
    def get_return_requests(self, start_date: str = None, end_date: str = None, 
                           status: str = None, limit: int = 100) -> List[Dict[str, Any]]:
        """模拟获取退货请求列表"""
        logger.info(f"获取退货请求列表: start_date={start_date}, end_date={end_date}, status={status}, limit={limit}")
        
        # 过滤模拟数据
        filtered_returns = self.mock_returns
        
        if start_date:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            filtered_returns = [r for r in filtered_returns 
                               if datetime.strptime(r['created_at'], "%Y-%m-%d %H:%M:%S") >= start]
        
        if end_date:
            end = datetime.strptime(end_date, "%Y-%m-%d")
            filtered_returns = [r for r in filtered_returns 
                               if datetime.strptime(r['created_at'], "%Y-%m-%d %H:%M:%S") <= end]
        
        if status:
            filtered_returns = [r for r in filtered_returns if r['status'] == status]
        
        return filtered_returns[:limit]
    
    def get_return_details(self, return_id: str) -> Dict[str, Any]:
        """模拟获取退货详情"""
        logger.info(f"获取退货详情: return_id={return_id}")
        
        # 查找指定 ID 的退货
        for return_item in self.mock_returns:
            if return_item['id'] == return_id:
                return return_item
                
        return {}
    
    def get_return_images(self, return_id: str) -> List[str]:
        """模拟获取退货图片 URL 列表"""
        logger.info(f"获取退货图片: return_id={return_id}")
        
        # 查找指定 ID 的退货
        for return_item in self.mock_returns:
            if return_item['id'] == return_id:
                return return_item.get('image_urls', [])
                
        return []
    
    def update_return_status(self, return_id: str, status: str, notes: str = None) -> bool:
        """模拟更新退货状态"""
        logger.info(f"更新退货状态: return_id={return_id}, status={status}, notes={notes}")
        
        # 查找并更新指定 ID 的退货
        for return_item in self.mock_returns:
            if return_item['id'] == return_id:
                return_item['status'] = status
                if notes:
                    return_item['notes'] = notes
                return True
                
        return False
    
    def download_image(self, image_url: str) -> bytes:
        """模拟下载图片"""
        logger.info(f"下载图片: image_url={image_url}")
        
        # 模拟图片下载，返回一些随机数据
        # 在实际实现中，这里应该使用 requests 下载真实图片
        return b"mock_image_data"
    
    def _generate_mock_returns(self) -> List[Dict[str, Any]]:
        """生成模拟退货数据"""
        categories = ["电子产品", "服装", "家居用品", "玩具", "书籍"]
        reasons = ["质量问题", "尺寸不合适", "收到错误商品", "不喜欢", "损坏"]
        statuses = ["pending", "processing", "completed", "rejected"]
        
        mock_data = []
        now = datetime.now()
        
        for i in range(1, 21):  # 生成 20 条模拟数据
            created_at = now - timedelta(days=i % 10)
            
            return_item = {
                "id": f"RET{i:05d}",
                "order_id": f"ORD{i*2:05d}",
                "product_id": f"PROD{i*3:05d}",
                "product_name": f"测试产品 {i}",
                "product_category": categories[i % len(categories)],
                "return_reason": reasons[i % len(reasons)],
                "customer_description": f"这是客户对退货 {i} 的描述。这个产品有一些问题需要退货。",
                "customer_email": f"customer{i}@example.com",
                "customer_phone": f"1380000{i:04d}",
                "image_urls": [
                    f"https://mock-ecommerce-api.example.com/images/return_{i}_1.jpg",
                    f"https://mock-ecommerce-api.example.com/images/return_{i}_2.jpg"
                ],
                "status": statuses[i % len(statuses)],
                "original_price": 100.0 + i * 10,
                "created_at": created_at.strftime("%Y-%m-%d %H:%M:%S")
            }
            
            mock_data.append(return_item)
            
        return mock_data 