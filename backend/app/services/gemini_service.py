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
                prompt = """Please analyze this product image in detail, including:
1. Product condition (any damage or defects)
2. Appearance features (color, shape, material)
3. Signs of use (if any)
4. Packaging condition (if visible)
Please answer in English."""
            
            # 调用 Gemini API
            response = self.vision_model.generate_content([prompt, image])
            
            # 解析响应
            result = {
                "analysis": response.text,
                "success": True
            }
            
            logger.info("Image analysis completed")
            return result
            
        except Exception as e:
            logger.error(f"Image analysis failed: {str(e)}")
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
                prompt = f"""Based on the following context and text, please analyze:

Context information:
{context}

Customer description:
{text}

Please provide:
1. Summary of the main issue
2. Analysis of possible causes
3. Handling suggestions
Please answer in English."""
            else:
                prompt = f"""Please analyze the following customer description:

{text}

Please provide:
1. Summary of the main issue
2. Analysis of possible causes
3. Handling suggestions
Please answer in English."""
            
            # 调用 Gemini API
            response = self.text_model.generate_content(prompt)
            
            # 解析响应
            result = {
                "analysis": response.text,
                "success": True
            }
            
            logger.info("Text analysis completed")
            return result
            
        except Exception as e:
            logger.error(f"Text analysis failed: {str(e)}")
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
        """Analyze return reason and provide handling recommendations"""
        
        # Build prompt
        prompt = f"""
        As a return analysis expert, please analyze the following return situation:
        
        Product information:
        - Name: {product_name}
        - Category: {product_category}
        - Return reason: {return_reason}
        - Customer description: {customer_description}
        
        Please analyze according to the following classification system:
        
        Return reason categories:
        1. Quality issues - Product damage, functional failure, manufacturing defects
        2. Size mismatch - Too big/small, inaccurate sizing
        3. Appearance difference - Color difference, style not matching description
        4. Performance below expectations - Function not as expected, performance below advertised
        5. Wrong item received - Completely different product
        6. Logistics issues - Damaged during transport, packaging damage
        7. Customer changed mind - No longer needed, found alternative
        8. Missing accessories - Missing components
        9. Allergic/adverse reaction - Allergic to materials, discomfort after use
        10. Delayed delivery - Significantly exceeded expected delivery time
        
        Recommended handling methods:
        1. Direct resale - Brand new unopened product, can be sold directly again
        2. Discounted sale - Minor flaws but fully functional, sell at reduced price after inspection
        3. Return to supplier - Serious quality issues or batch defects, return to manufacturer
        4. Repair and resell - Products with minor issues that can be fixed
        5. Parts recycling - Products that can't be repaired but have usable components
        6. Charity donation - Functional items not suitable for resale
        7. Environmental disposal - Unusable and non-recyclable products
        8. Cross-platform direct sales - Good condition items that can be sold on our marketplace
        9. Bundle sales - Combine multiple returned items into package deals
        10. Convert to sample/display item - Items with minor cosmetic issues can be used as display samples
        
        Please return the analysis result in the following format (do not use Markdown format):
        {
            "category": "Return category",
            "reason": "Specific reason",
            "recommendation": "Handling recommendation",
            "confidence": 0.95
        }
        
        Do not include any other text or explanation outside of the JSON object.
        """
        
        # Call Gemini API for analysis
        response = self.model.generate_content(prompt)
        
        try:
            # Clean response text, remove Markdown formatting
            text = response.text.strip()
            
            # Try to extract JSON from the response
            try:
                # First try direct JSON parsing
                analysis_result = json.loads(text)
            except json.JSONDecodeError:
                # If that fails, try to extract JSON from markdown code blocks
                if '```' in text:
                    # Extract code block content
                    parts = text.split('```')
                    for i in range(1, len(parts), 2):
                        if i < len(parts):
                            code_part = parts[i]
                            # If code block is marked as json, remove the marker
                            if code_part.startswith('json'):
                                code_part = code_part[4:].strip()
                            # Try to parse the code block as JSON
                            try:
                                analysis_result = json.loads(code_part)
                                break
                            except json.JSONDecodeError:
                                continue
                    else:
                        # If no valid JSON found in code blocks, try to find JSON-like structure
                        json_start = text.find('{')
                        json_end = text.rfind('}') + 1
                        if json_start >= 0 and json_end > json_start:
                            try:
                                analysis_result = json.loads(text[json_start:json_end])
                            except json.JSONDecodeError:
                                raise Exception("Could not parse JSON from response")
                        else:
                            raise Exception("No JSON structure found in response")
                else:
                    # If no code blocks, try to find JSON-like structure
                    json_start = text.find('{')
                    json_end = text.rfind('}') + 1
                    if json_start >= 0 and json_end > json_start:
                        try:
                            analysis_result = json.loads(text[json_start:json_end])
                        except json.JSONDecodeError:
                            raise Exception("Could not parse JSON from response")
                    else:
                        raise Exception("No JSON structure found in response")
            
            # Validate the analysis result
            required_fields = ['category', 'reason', 'recommendation', 'confidence']
            if not all(field in analysis_result for field in required_fields):
                missing_fields = [field for field in required_fields if field not in analysis_result]
                raise Exception(f"Missing required fields in analysis result: {', '.join(missing_fields)}")
            
            # Ensure confidence is a float
            try:
                analysis_result['confidence'] = float(analysis_result['confidence'])
            except (ValueError, TypeError):
                analysis_result['confidence'] = 0.0
                
            return analysis_result
            
        except Exception as e:
            logger.error(f"Failed to parse AI analysis result: {str(e)}")
            return {
                "category": "Uncategorized",
                "reason": f"Analysis failed: {str(e)}",
                "recommendation": "Manual review",
                "confidence": 0.0
            }
    
    def categorize_return(self, image_data: List[bytes], description: str, 
                         product_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use Gemini to categorize return items
        
        Args:
            image_data (List[bytes]): List of image data
            description (str): Customer description
            product_info (Dict[str, Any]): Product information
            
        Returns:
            Dict[str, Any]: Classification result including category, reason, recommendation and confidence
        """
        try:
            # Prepare images
            images = []
            for img in image_data:
                try:
                    images.append(Image.open(io.BytesIO(img)))
                except Exception as e:
                    logger.warning(f"Failed to open image: {str(e)}")
            
            # If no valid images, return default result
            if not images:
                logger.warning("No valid images provided for analysis")
                return {
                    "category": "Uncategorized",
                    "reason": "No valid images provided",
                    "recommendation": "Manual Review",
                    "confidence": 0.0
                }
            
            # Prepare prompt
            product_info_str = "\n".join([f"{k}: {v}" for k, v in product_info.items()])
            
            prompt = f"""As a return analysis expert, please analyze this image and provide the following information:

1. Product information:
{product_info_str}

2. Customer description:
{description}

Please analyze the return reason and categorize it into one of the following categories:
- Quality Issues
- Size Mismatch
- Appearance Difference
- Performance Below Expectations
- Wrong Item Received
- Logistics Issues
- Customer Changed Mind
- Missing Accessories
- Allergic/Adverse Reaction
- Delayed Delivery

Based on your analysis, please recommend one of the following handling methods:
- Direct Resale
- Discounted Sale
- Return to Supplier
- Repair and Resell
- Parts Recycling
- Charity Donation
- Environmental Disposal
- Cross-platform Direct Sales
- Bundle Sales
- Convert to Sample/Display Item

Please provide your analysis in the following JSON format:
{{
    "category": "Category name",
    "reason": "Detailed explanation of the return reason",
    "recommendation": "Handling method",
    "confidence": 0.95 (a number between 0 and 1)
}}

Please respond in English only. Do not include any other text or explanation outside of the JSON object.
"""
            
            # Call Gemini API
            try:
                response = self.vision_model.generate_content([prompt] + images)
                text = response.text
                logger.info(f"Gemini response: {text}")
            except Exception as e:
                logger.error(f"Gemini API call failed: {str(e)}")
                return {
                    "category": "Uncategorized",
                    "reason": f"Gemini API call failed: {str(e)}",
                    "recommendation": "Manual Review",
                    "confidence": 0.0
                }
            
            # Try to extract JSON from the response
            try:
                # First try direct JSON parsing
                result = json.loads(text)
            except json.JSONDecodeError:
                # If that fails, try to extract JSON from markdown code blocks
                if '```' in text:
                    # Extract code block content
                    parts = text.split('```')
                    for i in range(1, len(parts), 2):
                        if i < len(parts):
                            code_part = parts[i]
                            # If code block is marked as json, remove the marker
                            if code_part.startswith('json'):
                                code_part = code_part[4:].strip()
                            # Try to parse the code block as JSON
                            try:
                                result = json.loads(code_part)
                                break
                            except json.JSONDecodeError:
                                continue
                    else:
                        # If no valid JSON found in code blocks, try to find JSON-like structure
                        json_start = text.find('{')
                        json_end = text.rfind('}') + 1
                        if json_start >= 0 and json_end > json_start:
                            try:
                                result = json.loads(text[json_start:json_end])
                            except json.JSONDecodeError:
                                logger.error("Could not parse JSON from response")
                                return {
                                    "category": "Uncategorized",
                                    "reason": "Could not parse JSON from response",
                                    "recommendation": "Manual Review",
                                    "confidence": 0.0
                                }
                        else:
                            logger.error("No JSON structure found in response")
                            return {
                                "category": "Uncategorized",
                                "reason": "No JSON structure found in response",
                                "recommendation": "Manual Review",
                                "confidence": 0.0
                            }
                else:
                    # If no code blocks, try to find JSON-like structure
                    json_start = text.find('{')
                    json_end = text.rfind('}') + 1
                    if json_start >= 0 and json_end > json_start:
                        try:
                            result = json.loads(text[json_start:json_end])
                        except json.JSONDecodeError:
                            logger.error("Could not parse JSON from response")
                            return {
                                "category": "Uncategorized",
                                "reason": "Could not parse JSON from response",
                                "recommendation": "Manual Review",
                                "confidence": 0.0
                            }
                    else:
                        logger.error("No JSON structure found in response")
                        return {
                            "category": "Uncategorized",
                            "reason": "No JSON structure found in response",
                            "recommendation": "Manual Review",
                            "confidence": 0.0
                        }
            
            # Validate the result
            required_fields = ['category', 'reason', 'recommendation', 'confidence']
            if not all(field in result for field in required_fields):
                missing_fields = [field for field in required_fields if field not in result]
                logger.error(f"Missing required fields in result: {missing_fields}")
                return {
                    "category": "Uncategorized",
                    "reason": f"Missing required fields in result: {', '.join(missing_fields)}",
                    "recommendation": "Manual Review",
                    "confidence": 0.0
                }
            
            # Ensure confidence is a float
            try:
                result['confidence'] = float(result['confidence'])
            except (ValueError, TypeError):
                result['confidence'] = 0.0
            
            return result
            
        except Exception as e:
            logger.error(f"Return categorization failed: {str(e)}")
            return {
                "category": "Uncategorized",
                "reason": f"Analysis failed: {str(e)}",
                "recommendation": "Manual Review",
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
            prompt = f"""Please generate relevant tags based on the following information:

Description:
{text}

Requirements:
1. Generate 5-10 relevant tags
2. Each tag should be short and precise
3. Tags should cover product type, issue type, handling method, etc.
4. Only return the list of tags, separated by commas
5. Please answer in English

Example output:
Electronics, screen damage, within warranty, repair required, resellable"""
            
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
            
            logger.info(f"Generated {len(tags)} tags")
            return tags
            
        except Exception as e:
            logger.error(f"Tag generation failed: {str(e)}")
            return ["Analysis failed"]
    
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
            
            prompt = f"""Please suggest the best handling method based on the following return data:

{return_data_str}

Please choose one handling method from the following options and provide a confidence level:

Handling method options:
- Accept return
- Reject return
- Partial refund
- Replace product
- Repair and handle
- Manual review

Please only return in the following format:
Handling method: [your choice]
Confidence: [value between 0 and 1]"""
            
            # 调用 Gemini API
            response = self.text_model.generate_content(prompt)
            
            # 解析响应
            text = response.text.strip()
            
            action = None
            confidence = 0.0
            
            for line in text.split('\n'):
                if line.startswith('Handling method:'):
                    action = line.split(':', 1)[1].strip()
                elif line.startswith('Confidence:'):
                    try:
                        confidence = float(line.split(':', 1)[1].strip())
                    except ValueError:
                        confidence = 0.5
            
            if not action:
                action = "Manual review"
            
            logger.info(f"Suggested handling method: {action}, confidence: {confidence}")
            return action, confidence
            
        except Exception as e:
            logger.error(f"Handling suggestion generation failed: {str(e)}")
            return "Manual review", 0.0
    
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
        As a professional return analysis expert, please analyze the following images and description, and provide professional return suggestions:

        User description: {description if description else 'User did not provide a description'}

        Please provide the following information:
        1. Product condition analysis
        2. Return reason classification
        3. Handling suggestions
        4. Preventive measures

        Please answer in English and maintain professionalism.
        """
        
        # 调用 Gemini API
        response = model.generate_content([prompt, *image_parts])
        
        # 解析并返回结果
        return {
            'analysis': response.text,
            'status': 'success'
        }
        
    except Exception as e:
        logger.error(f"Error analyzing images: {str(e)}")
        raise Exception(f"Error analyzing images: {str(e)}") 