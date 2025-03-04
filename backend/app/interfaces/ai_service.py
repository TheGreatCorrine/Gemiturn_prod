from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional, Tuple

class AIServiceInterface(ABC):
    """
    AI 服务的抽象接口
    定义了与 AI 服务交互所需的方法
    可以根据不同的 AI 服务提供商进行实现
    """
    
    @abstractmethod
    def analyze_image(self, image_data: bytes, prompt: str = None) -> Dict[str, Any]:
        """
        分析图像
        
        Args:
            image_data (bytes): 图像数据
            prompt (str): 提示词（可选）
            
        Returns:
            Dict[str, Any]: 分析结果
        """
        pass
    
    @abstractmethod
    def analyze_text(self, text: str, context: str = None) -> Dict[str, Any]:
        """
        分析文本
        
        Args:
            text (str): 要分析的文本
            context (str): 上下文信息（可选）
            
        Returns:
            Dict[str, Any]: 分析结果
        """
        pass
    
    @abstractmethod
    def categorize_return(self, image_data: List[bytes], description: str, 
                         product_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        对退货进行分类
        
        Args:
            image_data (List[bytes]): 图像数据列表
            description (str): 客户描述
            product_info (Dict[str, Any]): 产品信息
            
        Returns:
            Dict[str, Any]: 分类结果，包括类别、原因、建议和置信度
        """
        pass
    
    @abstractmethod
    def generate_tags(self, text: str, image_data: List[bytes] = None) -> List[str]:
        """
        生成标签
        
        Args:
            text (str): 文本描述
            image_data (List[bytes]): 图像数据列表（可选）
            
        Returns:
            List[str]: 标签列表
        """
        pass
    
    @abstractmethod
    def suggest_action(self, return_data: Dict[str, Any]) -> Tuple[str, float]:
        """
        建议处理方式
        
        Args:
            return_data (Dict[str, Any]): 退货数据
            
        Returns:
            Tuple[str, float]: 建议的处理方式和置信度
        """
        pass 