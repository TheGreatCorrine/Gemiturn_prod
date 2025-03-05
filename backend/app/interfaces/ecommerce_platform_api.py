import requests
import json
from typing import Dict, List, Any, Optional
from datetime import datetime

from app.interfaces.platform_api import PlatformAPIInterface
from app.utils.logger import get_logger

logger = get_logger(__name__)

class EcommercePlatformAPI(PlatformAPIInterface):
    """
    电商平台 API 实现
    用于处理来自电商平台的webhook请求
    """
    
    def __init__(self, api_key: str = None, base_url: str = None):
        """
        初始化电商平台 API
        
        Args:
            api_key (str): API 密钥（可选）
            base_url (str): API 基础 URL（可选）
        """
        self.api_key = api_key
        self.base_url = base_url
        self.is_authenticated = False
        self.webhook_data = {}  # 存储从webhook接收的数据
        
    def set_webhook_data(self, data: Dict[str, Any]):
        """
        设置从webhook接收的数据
        
        Args:
            data (Dict[str, Any]): webhook数据
        """
        self.webhook_data = data
        logger.info(f"已设置webhook数据: {data}")
        
    def authenticate(self) -> bool:
        """
        与平台进行身份验证
        对于webhook集成，我们假设请求已经通过了验证
        
        Returns:
            bool: 身份验证是否成功
        """
        logger.info("电商平台API身份验证")
        self.is_authenticated = True
        return True
        
    def get_return_requests(self, start_date: str = None, end_date: str = None, 
                           status: str = None, limit: int = 100) -> List[Dict[str, Any]]:
        """
        获取退货请求列表
        对于webhook集成，我们只返回当前接收到的数据
        
        Returns:
            List[Dict[str, Any]]: 退货请求列表
        """
        logger.info("获取退货请求列表")
        
        if not self.webhook_data:
            return []
            
        # 将webhook数据转换为标准格式
        return_request = self._convert_webhook_to_standard_format(self.webhook_data)
        return [return_request]
    
    def get_return_details(self, return_id: str) -> Dict[str, Any]:
        """
        获取退货详情
        对于webhook集成，我们只返回当前接收到的数据
        
        Args:
            return_id (str): 退货 ID
            
        Returns:
            Dict[str, Any]: 退货详情
        """
        logger.info(f"获取退货详情: return_id={return_id}")
        
        if not self.webhook_data or self.webhook_data.get('returnId') != return_id:
            return {}
            
        return self._convert_webhook_to_standard_format(self.webhook_data)
    
    def get_return_images(self, return_id: str) -> List[str]:
        """
        获取退货图片 URL 列表
        
        Args:
            return_id (str): 退货 ID
            
        Returns:
            List[str]: 图片 URL 列表
        """
        logger.info(f"获取退货图片: return_id={return_id}")
        
        if not self.webhook_data or self.webhook_data.get('returnId') != return_id:
            return []
            
        image_url = self.webhook_data.get('image')
        return [image_url] if image_url else []
    
    def update_return_status(self, return_id: str, status: str, notes: str = None) -> bool:
        """
        更新退货状态
        对于webhook集成，我们只是记录状态更新请求，但不实际更新外部系统
        
        Args:
            return_id (str): 退货 ID
            status (str): 新状态
            notes (str): 备注（可选）
            
        Returns:
            bool: 更新是否成功
        """
        logger.info(f"更新退货状态: return_id={return_id}, status={status}, notes={notes}")
        
        # 在实际实现中，这里应该调用电商平台的API来更新状态
        # 对于webhook集成，我们只是记录请求
        return True
    
    def download_image(self, image_url: str) -> bytes:
        """
        下载图片
        
        Args:
            image_url (str): 图片 URL
            
        Returns:
            bytes: 图片数据
        """
        logger.info(f"下载图片: image_url={image_url}")
        
        try:
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()
            return response.content
        except Exception as e:
            logger.error(f"下载图片失败: {str(e)}")
            # 返回空数据
            return b""
    
    def _convert_webhook_to_standard_format(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        将webhook数据转换为标准格式
        
        Args:
            webhook_data (Dict[str, Any]): webhook数据
            
        Returns:
            Dict[str, Any]: 标准格式的退货数据
        """
        # 提取数据
        return_id = webhook_data.get('returnId')
        description = webhook_data.get('description', '')
        created_at_str = webhook_data.get('createdAt')
        image_url = webhook_data.get('image')
        
        # 提取用户数据
        user_data = webhook_data.get('user', {})
        user_id = user_data.get('userId')
        username = user_data.get('username')
        
        # 提取产品数据
        product_data = webhook_data.get('product', {})
        product_id = product_data.get('productId')
        product_name = product_data.get('name')
        product_category = product_data.get('category', 'Other')
        product_price = product_data.get('price', 0.0)
        
        # 提取订单数据
        order_data = webhook_data.get('order', {})
        order_id = order_data.get('orderId') or webhook_data.get('orderId')
        
        # 提取退货原因
        return_reason = webhook_data.get('reason', '')
        
        # 解析创建时间
        if created_at_str:
            try:
                created_at = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))
                created_at_formatted = created_at.strftime("%Y-%m-%d %H:%M:%S")
            except ValueError:
                created_at_formatted = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        else:
            created_at_formatted = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # 构建标准格式
        return {
            'id': return_id,
            'order_id': order_id,
            'product_id': product_id,
            'product_name': product_name,
            'product_category': product_category,
            'return_reason': return_reason,
            'customer_description': description,
            'customer_email': f"{username}@example.com" if username else None,
            'customer_phone': '',
            'image_urls': [image_url] if image_url else [],
            'status': 'pending',
            'original_price': product_price,
            'created_at': created_at_formatted
        } 