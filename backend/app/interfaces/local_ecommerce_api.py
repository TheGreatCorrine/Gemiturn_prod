import requests
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

from app.interfaces.platform_api import PlatformAPIInterface
from app.utils.logger import get_logger

logger = get_logger(__name__)

class LocalEcommerceAPI(PlatformAPIInterface):
    """
    本地电商平台 API 实现
    用于连接本地运行的电商平台系统
    """
    
    def __init__(self, api_key: str = None, base_url: str = None):
        """
        初始化本地电商平台 API
        
        Args:
            api_key (str): API 密钥（可选）
            base_url (str): API 基础 URL，默认为本地地址
        """
        self.api_key = api_key or os.environ.get('LOCAL_ECOMMERCE_API_KEY', '')
        self.base_url = base_url or os.environ.get('LOCAL_ECOMMERCE_API_URL', 'http://localhost:8080/api')
        self.is_authenticated = False
        self.headers = {}
        
    def authenticate(self) -> bool:
        """
        与本地电商平台进行身份验证
        
        Returns:
            bool: 身份验证是否成功
        """
        logger.info("尝试连接本地电商平台")
        
        if not self.api_key:
            logger.warning("未设置 API 密钥")
            return False
            
        try:
            # 构建认证请求
            auth_url = f"{self.base_url}/auth"
            payload = {"api_key": self.api_key}
            
            response = requests.post(auth_url, json=payload, timeout=10)
            
            if response.status_code == 200:
                auth_data = response.json()
                # 保存认证令牌
                self.headers = {
                    "Authorization": f"Bearer {auth_data.get('token')}",
                    "Content-Type": "application/json"
                }
                self.is_authenticated = True
                logger.info("本地电商平台认证成功")
                return True
            else:
                logger.error(f"认证失败: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"连接本地电商平台时出错: {str(e)}")
            return False
        
    def get_return_requests(self, start_date: str = None, end_date: str = None, 
                           status: str = None, limit: int = 100) -> List[Dict[str, Any]]:
        """
        从本地电商平台获取退货请求列表
        
        Args:
            start_date (str): 开始日期（可选）
            end_date (str): 结束日期（可选）
            status (str): 退货状态（可选）
            limit (int): 返回结果数量限制
            
        Returns:
            List[Dict[str, Any]]: 退货请求列表
        """
        logger.info(f"从本地电商平台获取退货请求: start_date={start_date}, end_date={end_date}, status={status}, limit={limit}")
        
        if not self.is_authenticated:
            success = self.authenticate()
            if not success:
                logger.error("未认证，无法获取退货请求")
                return []
        
        try:
            # 构建请求参数
            params = {}
            if start_date:
                params['start_date'] = start_date
            if end_date:
                params['end_date'] = end_date
            if status:
                params['status'] = status
            if limit:
                params['limit'] = limit
                
            # 发送请求
            url = f"{self.base_url}/returns"
            response = requests.get(url, params=params, headers=self.headers, timeout=30)
            
            if response.status_code == 200:
                return_data = response.json()
                logger.info(f"成功获取 {len(return_data)} 条退货请求")
                return return_data
            else:
                logger.error(f"获取退货请求失败: {response.status_code} - {response.text}")
                return []
                
        except Exception as e:
            logger.error(f"获取退货请求时出错: {str(e)}")
            return []
    
    def get_return_details(self, return_id: str) -> Dict[str, Any]:
        """
        获取退货详情
        
        Args:
            return_id (str): 退货 ID
            
        Returns:
            Dict[str, Any]: 退货详情
        """
        logger.info(f"获取退货详情: return_id={return_id}")
        
        if not self.is_authenticated:
            success = self.authenticate()
            if not success:
                logger.error("未认证，无法获取退货详情")
                return {}
        
        try:
            url = f"{self.base_url}/returns/{return_id}"
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                return_data = response.json()
                logger.info(f"成功获取退货详情: {return_id}")
                return return_data
            else:
                logger.error(f"获取退货详情失败: {response.status_code} - {response.text}")
                return {}
                
        except Exception as e:
            logger.error(f"获取退货详情时出错: {str(e)}")
            return {}
    
    def get_return_images(self, return_id: str) -> List[str]:
        """
        获取退货图片 URL 列表
        
        Args:
            return_id (str): 退货 ID
            
        Returns:
            List[str]: 图片 URL 列表
        """
        logger.info(f"获取退货图片: return_id={return_id}")
        
        if not self.is_authenticated:
            success = self.authenticate()
            if not success:
                logger.error("未认证，无法获取退货图片")
                return []
        
        try:
            url = f"{self.base_url}/returns/{return_id}/images"
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                image_data = response.json()
                image_urls = image_data.get('image_urls', [])
                logger.info(f"成功获取 {len(image_urls)} 张退货图片")
                return image_urls
            else:
                logger.error(f"获取退货图片失败: {response.status_code} - {response.text}")
                return []
                
        except Exception as e:
            logger.error(f"获取退货图片时出错: {str(e)}")
            return []
    
    def update_return_status(self, return_id: str, status: str, notes: str = None) -> bool:
        """
        更新退货状态
        
        Args:
            return_id (str): 退货 ID
            status (str): 新状态
            notes (str): 备注（可选）
            
        Returns:
            bool: 更新是否成功
        """
        logger.info(f"更新退货状态: return_id={return_id}, status={status}, notes={notes}")
        
        if not self.is_authenticated:
            success = self.authenticate()
            if not success:
                logger.error("未认证，无法更新退货状态")
                return False
        
        try:
            url = f"{self.base_url}/returns/{return_id}/status"
            payload = {"status": status}
            if notes:
                payload["notes"] = notes
                
            response = requests.put(url, json=payload, headers=self.headers, timeout=10)
            
            if response.status_code in [200, 201, 204]:
                logger.info(f"成功更新退货状态: {return_id}")
                return True
            else:
                logger.error(f"更新退货状态失败: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"更新退货状态时出错: {str(e)}")
            return False
    
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
            # 如果是相对URL，添加基础URL
            if not image_url.startswith(('http://', 'https://')):
                if image_url.startswith('/'):
                    image_url = f"{self.base_url.split('/api')[0]}{image_url}"
                else:
                    image_url = f"{self.base_url.split('/api')[0]}/{image_url}"
            
            response = requests.get(image_url, headers=self.headers, timeout=30)
            
            if response.status_code == 200:
                logger.info(f"成功下载图片: {len(response.content)} 字节")
                return response.content
            else:
                logger.error(f"下载图片失败: {response.status_code}")
                return b""
                
        except Exception as e:
            logger.error(f"下载图片时出错: {str(e)}")
            return b"" 