import os
import base64
import json
import requests
from typing import Dict, List, Any, Optional, Tuple
import google.generativeai as genai
from PIL import Image
import io
import logging

from app.interfaces.ai_service import AIServiceInterface
from app.utils.logger import get_logger
from app.config.config import Config

logger = logging.getLogger(__name__)

class GeminiService(AIServiceInterface):
    """
    使用 Google Gemini API 的 AI 服务实现
    """
    
    def __init__(self):
        """
        初始化 Gemini 服务
        """
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        genai.configure(api_key=api_key)
        
        # 使用最新的 flash 模型
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.vision_model = genai.GenerativeModel('gemini-1.5-flash')
        self.text_model = genai.GenerativeModel('gemini-1.5-flash')
        
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
                prompt = """请详细分析这张图片中的产品，包括：
1. 产品状况（是否有损坏、缺陷）
2. 外观特征（颜色、形状、材质）
3. 使用痕迹（如果有）
4. 包装情况（如果可见）
请用中文回答。"""
            
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
                prompt = f"""基于以下上下文和文本进行分析：

上下文信息：
{context}

客户描述：
{text}

请提供：
1. 主要问题概述
2. 可能的原因分析
3. 处理建议
请用中文回答。"""
            else:
                prompt = f"""请分析以下客户描述：

{text}

请提供：
1. 主要问题概述
2. 可能的原因分析
3. 处理建议
请用中文回答。"""
            
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
    
    def analyze_return(
        self,
        product_name: str,
        product_category: str,
        customer_description: str,
        return_reason: str,
        images: List[str] = None
    ) -> Dict[str, Any]:
        """分析退货原因并提供处理建议"""
        
        # 构建提示词
        prompt = f"""
        作为退货分析专家，请分析以下退货情况：
        
        商品信息：
        - 名称：{product_name}
        - 类别：{product_category}
        - 退货原因：{return_reason}
        - 客户描述：{customer_description}
        
        请根据以下分类系统进行分析：
        
        退货原因分类：
        1. 质量问题 - 产品损坏、功能故障、制造缺陷
        2. 尺寸不合适 - 太大/太小、尺寸不准确
        3. 外观差异 - 颜色差异、款式与描述不符
        4. 性能不达标 - 功能不符合预期、性能低于广告宣传
        5. 收到错误商品 - 完全不同的产品
        6. 物流问题 - 运输过程中损坏、包装损坏
        7. 客户改变主意 - 不再需要、找到替代品
        8. 配件缺失 - 缺少组件
        9. 过敏/不良反应 - 对材料过敏、使用后不适
        10. 延迟交付 - 显著超出预期交付时间
        
        建议处理方法：
        1. 直接转售 - 全新未开封产品，可直接再次销售
        2. 折价销售 - 轻微瑕疵但功能完好，检查后降价销售
        3. 退回供应商 - 严重质量问题或批次缺陷，退回制造商
        4. 维修后销售 - 小问题可修复的产品
        5. 零件回收 - 无法修复但有可用组件的产品
        6. 慈善捐赠 - 功能正常但不适合转售的物品
        7. 环保处理 - 无法使用且不可回收的产品
        8. 跨平台直接销售 - 完好商品可在我们的市场直接销售
        9. 打包销售 - 将多个退货商品组合成套装销售
        10. 转为样品/展示品 - 轻微外观问题可用作展示样品
        
        请以以下格式返回分析结果（不要使用 Markdown 格式）：
        {{
            "category": "退货类别",
            "reason": "具体原因",
            "recommendation": "处理建议",
            "confidence": 0.95
        }}
        """
        
        # 调用Gemini API进行分析
        response = self.model.generate_content(prompt)
        
        try:
            # 清理响应文本，移除 Markdown 格式
            text = response.text.strip()
            if text.startswith('```'):
                text = text.split('```')[1]
                if text.startswith('json'):
                    text = text[4:]
            text = text.strip()
            
            # 解析 JSON 字符串
            analysis_result = json.loads(text)
            return analysis_result
            
        except Exception as e:
            logger.error(f"解析 AI 分析结果失败: {str(e)}")
            return {
                "category": "未分类",
                "reason": f"分析失败: {str(e)}",
                "recommendation": "人工审核",
                "confidence": 0.0
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
            
            prompt = f"""作为退货分析专家，请分析这张图片并提供以下信息：

产品信息:
{product_info_str}

客户描述:
{description}

请提供以下分析（JSON格式）：

1. 退货原因分类（参考以下类别）：
   - 质量问题
   - 尺寸不合适
   - 外观差异
   - 性能不达标
   - 收到错误商品
   - 物流问题
   - 客户改变主意
   - 配件缺失
   - 过敏/不良反应
   - 延迟交付

2. 建议处理方式（参考以下方法）：
   - 直接转售
   - 折价销售
   - 退回供应商
   - 维修后销售
   - 零件回收
   - 慈善捐赠
   - 环保处理
   - 跨平台直接销售
   - 打包销售
   - 转为样品/展示品

请以JSON格式返回结果：
{{
    "category": "退货类别",
    "reason": "具体原因",
    "recommendation": "处理建议",
    "confidence": 0.95
}}"""
            
            # 调用 Gemini API
            response = self.vision_model.generate_content([prompt] + images)
            
            # 尝试从响应中提取 JSON
            try:
                # 清理响应文本，识别和处理可能的Markdown代码块
                text = response.text.strip()
                
                # 检查是否有Markdown代码块，如：```json {...} ```
                if '```' in text:
                    # 提取代码块内容
                    parts = text.split('```')
                    for i in range(1, len(parts), 2):  # 奇数索引包含代码块内容
                        if i < len(parts):
                            code_part = parts[i]
                            # 如果代码块标记为json或未标记，尝试解析
                            if code_part.startswith('json'):
                                code_part = code_part[4:].strip()  # 删除'json'标记
                            elif code_part.startswith('{') and '}' in code_part:
                                code_part = code_part.strip()
                                
                            # 尝试解析JSON
                            if code_part.startswith('{') and '}' in code_part:
                                json_start = code_part.find('{')
                                json_end = code_part.rfind('}') + 1
                                json_str = code_part[json_start:json_end]
                                result = json.loads(json_str)
                                break
                else:
                    # 没有Markdown代码块，直接查找JSON对象
                    json_start = text.find('{')
                    json_end = text.rfind('}') + 1
                    
                    if json_start >= 0 and json_end > json_start:
                        json_str = text[json_start:json_end]
                        result = json.loads(json_str)
                    else:
                        # 如果没有找到JSON，尝试结构化分析文本
                        result = self._extract_structured_data(text)
            except json.JSONDecodeError as e:
                # 如果JSON解析失败，记录错误并尝试结构化分析文本
                logger.error(f"JSON解析失败: {str(e)}，原始文本: {text}")
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
            prompt = f"""请根据以下信息生成相关标签：

描述:
{text}

要求：
1. 生成5-10个相关标签
2. 每个标签应该简短精确
3. 标签应该涵盖产品类型、问题类型、处理方式等
4. 只返回标签列表，用逗号分隔
5. 请用中文回答

示例输出：
电子产品,屏幕损坏,保修期内,需要维修,二手可用"""
            
            content.append(prompt)
            
            # 如果有图像，添加到内容中
            if image_data:
                images = [Image.open(io.BytesIO(img)) for img in image_data]
                content.extend(images)
            
            # 调用 Gemini API
            response = self.vision_model.generate_content(content)
            
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
            
            prompt = f"""请根据以下退货数据，建议最佳处理方式：

{return_data_str}

请从以下选项中选择一个处理方式，并给出置信度：

处理方式选项：
- 接受退货
- 拒绝退货
- 部分退款
- 更换商品
- 维修处理
- 人工审核

请只返回以下格式：
处理方式: [你的选择]
置信度: [0-1之间的数值]"""
            
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

def init_gemini():
    """初始化 Gemini API"""
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    logger.info("Gemini 服务初始化完成")
    return model

def analyze_return_images(images, description=""):
    """分析退货图片并给出建议
    
    Args:
        images: 上传的图片文件列表
        description: 用户描述的问题
        
    Returns:
        dict: 包含分析结果的字典
    """
    try:
        model = init_gemini()
        
        # 处理图片
        image_parts = []
        for image in images:
            img = Image.open(image)
            image_parts.append(img)
            
        # 构建提示词
        prompt = f"""
        作为一个专业的退货分析专家，请分析以下图片和描述，给出专业的退货建议：

        用户描述：{description if description else '用户未提供描述'}

        请提供以下信息：
        1. 产品状况分析
        2. 退货原因分类
        3. 处理建议
        4. 预防措施

        请用中文回答，并保持专业性。
        """
        
        # 调用 Gemini API
        response = model.generate_content([prompt, *image_parts])
        
        # 解析并返回结果
        return {
            'analysis': response.text,
            'status': 'success'
        }
        
    except Exception as e:
        logger.error(f"分析图片时出错: {str(e)}")
        raise Exception(f"分析图片时出错: {str(e)}") 