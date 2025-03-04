from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional

class PlatformAPIInterface(ABC):
    """
    外部电商平台 API 的抽象接口
    这个接口定义了与外部电商平台交互所需的方法
    具体实现可以根据不同的平台进行定制
    """
    
    @abstractmethod
    def authenticate(self) -> bool:
        """
        与平台进行身份验证
        
        Returns:
            bool: 身份验证是否成功
        """
        pass
    
    @abstractmethod
    def get_return_requests(self, start_date: str = None, end_date: str = None, 
                           status: str = None, limit: int = 100) -> List[Dict[str, Any]]:
        """
        获取退货请求列表
        
        Args:
            start_date (str): 开始日期（可选）
            end_date (str): 结束日期（可选）
            status (str): 退货状态（可选）
            limit (int): 返回结果数量限制
            
        Returns:
            List[Dict[str, Any]]: 退货请求列表
        """
        pass
    
    @abstractmethod
    def get_return_details(self, return_id: str) -> Dict[str, Any]:
        """
        获取退货详情
        
        Args:
            return_id (str): 退货 ID
            
        Returns:
            Dict[str, Any]: 退货详情
        """
        pass
    
    @abstractmethod
    def get_return_images(self, return_id: str) -> List[str]:
        """
        获取退货图片 URL 列表
        
        Args:
            return_id (str): 退货 ID
            
        Returns:
            List[str]: 图片 URL 列表
        """
        pass
    
    @abstractmethod
    def update_return_status(self, return_id: str, status: str, 
                            notes: str = None) -> bool:
        """
        更新退货状态
        
        Args:
            return_id (str): 退货 ID
            status (str): 新状态
            notes (str): 备注（可选）
            
        Returns:
            bool: 更新是否成功
        """
        pass
    
    @abstractmethod
    def download_image(self, image_url: str) -> bytes:
        """
        下载图片
        
        Args:
            image_url (str): 图片 URL
            
        Returns:
            bytes: 图片数据
        """
        pass 