import os
import base64
import json
import requests
from typing import Dict, List, Any, Optional, Tuple
import google.generativeai as genai
from PIL import Image
import io

from app.interfaces.ai_service import AIServiceInterface
from app.utils.logger import get_logger
from app.config.config import Config

logger = get_logger(__name__)

class GeminiService(AIServiceInterface):
    """
    使用 Google Gemini API 的 AI 服务实现
    """
    
    def __init__(self, api_key: str = None):
        """
        初始化 Gemini 服务
        
        Args:
            api_key (str): Gemini API 密钥（可选，默认从配置中获取）
        """
        self.api_key = api_key or Config.GEMINI_API_KEY
        if not self.api_key:
            logger.warning("未提供 Gemini API 密钥，服务可能无法正常工作")
        
        # 配置 Gemini API
        genai.configure(api_key=self.api_key)
        
        # 获取模型
        self.vision_model = genai.GenerativeModel('gemini-pro-vision')
        self.text_model = genai.GenerativeModel('gemini-pro')
        
        logger.info("Gemini 服务初始化完成")
    
    def analyze_image(self, image_data: bytes, prompt: str = None) -> Dict[str, Any]:
        """
        使用 Gemini 分析图像
        
        Args:
            image_data (bytes): 图像数据
            prompt (str): 提示词（可选）
            
        Returns:
            Dict[str, Any]: 分析结果
        """
        try:
            # 将字节数据转换为 PIL 图像
            image = Image.open(io.BytesIO(image_data))
            
            # 准备提示词
            if not prompt:
                prompt = "请详细分析这张图片中的产品，特别是任何可见的损坏、缺陷或问题。"
            
            # 调用 Gemini API
            response = self.vision_model.generate_content([prompt, image])
            
            # 解析响应
            result = {
                "analysis": response.text,
                "success": True
            }
            
            logger.info("图像分析完成")
            return result
            
        except Exception as e:
            logger.error(f"图像分析失败: {str(e)}")
            return {
                "analysis": "",
                "error": str(e),
                "success": False
            }
    
    def analyze_text(self, text: str, context: str = None) -> Dict[str, Any]:
        """
        使用 Gemini 分析文本
        
        Args:
            text (str): 要分析的文本
            context (str): 上下文信息（可选）
            
        Returns:
            Dict[str, Any]: 分析结果
        """
        try:
            # 准备提示词
            if context:
                prompt = f"上下文: {context}\n\n文本: {text}\n\n请分析上述文本，提取关键信息并分类。"
            else:
                prompt = f"请分析以下文本，提取关键信息并分类：\n\n{text}"
            
            # 调用 Gemini API
            response = self.text_model.generate_content(prompt)
            
            # 解析响应
            result = {
                "analysis": response.text,
                "success": True
            }
            
            logger.info("文本分析完成")
            return result
            
        except Exception as e:
            logger.error(f"文本分析失败: {str(e)}")
            return {
                "analysis": "",
                "error": str(e),
                "success": False
            }
    
    def categorize_return(self, image_data: List[bytes], description: str, 
                         product_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        使用 Gemini 对退货进行分类
        
        Args:
            image_data (List[bytes]): 图像数据列表
            description (str): 客户描述
            product_info (Dict[str, Any]): 产品信息
            
        Returns:
            Dict[str, Any]: 分类结果，包括类别、原因、建议和置信度
        """
        try:
            # 准备图像
            images = [Image.open(io.BytesIO(img)) for img in image_data]
            
            # 准备提示词
            product_info_str = "\n".join([f"{k}: {v}" for k, v in product_info.items()])
            
            prompt = f"""
            请分析以下退货请求：
            
            产品信息:
            {product_info_str}
            
            客户描述:
            {description}
            
            请根据图片和描述，提供以下信息（JSON格式）：
            1. 退货类别（例如：质量问题、尺寸不合适、收到错误商品等）
            2. 具体原因
            3. 处理建议（接受退货、拒绝退货、部分退款等）
            4. 置信度（0-1之间的数值）
            
            请以JSON格式返回结果，格式如下：
            {{
                "category": "类别",
                "reason": "具体原因",
                "recommendation": "处理建议",
                "confidence": 0.95
            }}
            """
            
            # 调用 Gemini API
            response = self.vision_model.generate_content([prompt] + images)
            
            # 尝试从响应中提取 JSON
            try:
                # 查找 JSON 部分
                text = response.text
                json_start = text.find('{')
                json_end = text.rfind('}') + 1
                
                if json_start >= 0 and json_end > json_start:
                    json_str = text[json_start:json_end]
                    result = json.loads(json_str)
                else:
                    # 如果没有找到 JSON，尝试结构化分析文本
                    result = self._extract_structured_data(text)
            except json.JSONDecodeError:
                # 如果 JSON 解析失败，尝试结构化分析文本
                result = self._extract_structured_data(response.text)
            
            logger.info("退货分类完成")
            return result
            
        except Exception as e:
            logger.error(f"退货分类失败: {str(e)}")
            return {
                "category": "未分类",
                "reason": f"分析失败: {str(e)}",
                "recommendation": "人工审核",
                "confidence": 0.0
            }
    
    def generate_tags(self, text: str, image_data: List[bytes] = None) -> List[str]:
        """
        使用 Gemini 生成标签
        
        Args:
            text (str): 文本描述
            image_data (List[bytes]): 图像数据列表（可选）
            
        Returns:
            List[str]: 标签列表
        """
        try:
            content = []
            
            # 准备提示词
            prompt = f"""
            请根据以下信息生成相关标签（最多10个）：
            
            描述:
            {text}
            
            请只返回标签列表，每个标签用逗号分隔，不要包含其他内容。
            """
            content.append(prompt)
            
            # 如果有图像，添加到内容中
            if image_data:
                images = [Image.open(io.BytesIO(img)) for img in image_data]
                content.extend(images)
                model = self.vision_model
            else:
                model = self.text_model
            
            # 调用 Gemini API
            response = model.generate_content(content)
            
            # 解析响应
            tags_text = response.text.strip()
            tags = [tag.strip() for tag in tags_text.split(',')]
            
            logger.info(f"生成了 {len(tags)} 个标签")
            return tags
            
        except Exception as e:
            logger.error(f"标签生成失败: {str(e)}")
            return ["分析失败"]
    
    def suggest_action(self, return_data: Dict[str, Any]) -> Tuple[str, float]:
        """
        使用 Gemini 建议处理方式
        
        Args:
            return_data (Dict[str, Any]): 退货数据
            
        Returns:
            Tuple[str, float]: 建议的处理方式和置信度
        """
        try:
            # 准备提示词
            return_data_str = json.dumps(return_data, ensure_ascii=False, indent=2)
            
            prompt = f"""
            请根据以下退货数据，建议最佳处理方式：
            
            {return_data_str}
            
            请只返回以下格式的结果：
            处理方式: [接受退货/拒绝退货/部分退款/更换商品/其他]
            置信度: [0-1之间的数值]
            """
            
            # 调用 Gemini API
            response = self.text_model.generate_content(prompt)
            
            # 解析响应
            text = response.text.strip()
            
            action = None
            confidence = 0.0
            
            for line in text.split('\n'):
                if line.startswith('处理方式:'):
                    action = line.split(':', 1)[1].strip()
                elif line.startswith('置信度:'):
                    try:
                        confidence = float(line.split(':', 1)[1].strip())
                    except ValueError:
                        confidence = 0.5
            
            if not action:
                action = "人工审核"
            
            logger.info(f"建议处理方式: {action}, 置信度: {confidence}")
            return action, confidence
            
        except Exception as e:
            logger.error(f"处理建议生成失败: {str(e)}")
            return "人工审核", 0.0
    
    def _extract_structured_data(self, text: str) -> Dict[str, Any]:
        """
        从非结构化文本中提取结构化数据
        
        Args:
            text (str): 非结构化文本
            
        Returns:
            Dict[str, Any]: 结构化数据
        """
        result = {
            "category": "未分类",
            "reason": "",
            "recommendation": "人工审核",
            "confidence": 0.5
        }
        
        # 尝试提取类别
        if "类别" in text or "退货类别" in text or "category" in text.lower():
            for line in text.split('\n'):
                if "类别" in line or "category" in line.lower():
                    parts = line.split(':', 1) if ':' in line else line.split('：', 1)
                    if len(parts) > 1:
                        result["category"] = parts[1].strip()
                        break
        
        # 尝试提取原因
        if "原因" in text or "具体原因" in text or "reason" in text.lower():
            for line in text.split('\n'):
                if "原因" in line or "reason" in line.lower():
                    parts = line.split(':', 1) if ':' in line else line.split('：', 1)
                    if len(parts) > 1:
                        result["reason"] = parts[1].strip()
                        break
        
        # 尝试提取建议
        if "建议" in text or "处理建议" in text or "recommendation" in text.lower():
            for line in text.split('\n'):
                if "建议" in line or "recommendation" in line.lower():
                    parts = line.split(':', 1) if ':' in line else line.split('：', 1)
                    if len(parts) > 1:
                        result["recommendation"] = parts[1].strip()
                        break
        
        # 尝试提取置信度
        if "置信度" in text or "confidence" in text.lower():
            for line in text.split('\n'):
                if "置信度" in line or "confidence" in line.lower():
                    parts = line.split(':', 1) if ':' in line else line.split('：', 1)
                    if len(parts) > 1:
                        try:
                            result["confidence"] = float(parts[1].strip())
                        except ValueError:
                            pass
                        break
        
        return result 