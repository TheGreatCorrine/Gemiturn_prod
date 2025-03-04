import os
import requests
import tempfile
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime

from app.interfaces.platform_api import PlatformAPIInterface
from app.interfaces.ai_service import AIServiceInterface
from app.models.return_item import ReturnItem
from app.models.vendor import Vendor
from app.models.product_category import ProductCategory
from app.services.category_service import CategoryService
from app.services.vendor_service import VendorService
from app.utils.logger import get_logger
from app import db

logger = get_logger(__name__)

class ImportService:
    """
    导入服务，用于处理来自外部平台的数据
    """
    
    def __init__(self, platform_api: PlatformAPIInterface, ai_service: AIServiceInterface):
        """
        初始化导入服务
        
        Args:
            platform_api (PlatformAPIInterface): 外部平台 API 接口
            ai_service (AIServiceInterface): AI 服务接口
        """
        self.platform_api = platform_api
        self.ai_service = ai_service
        self.category_service = CategoryService()
        self.vendor_service = VendorService()
        
        logger.info("导入服务初始化完成")
    
    def import_returns(self, start_date: str = None, end_date: str = None, 
                      status: str = None, limit: int = 100) -> Tuple[int, int, List[str]]:
        """
        从外部平台导入退货数据
        
        Args:
            start_date (str): 开始日期（可选）
            end_date (str): 结束日期（可选）
            status (str): 退货状态（可选）
            limit (int): 返回结果数量限制
            
        Returns:
            Tuple[int, int, List[str]]: 导入成功数量、失败数量和错误消息列表
        """
        logger.info(f"开始导入退货数据: start_date={start_date}, end_date={end_date}, status={status}, limit={limit}")
        
        # 验证平台 API
        if not self.platform_api.authenticate():
            logger.error("平台 API 身份验证失败")
            return 0, 0, ["平台 API 身份验证失败"]
        
        # 获取退货请求列表
        return_requests = self.platform_api.get_return_requests(
            start_date=start_date, 
            end_date=end_date, 
            status=status, 
            limit=limit
        )
        
        if not return_requests:
            logger.info("未找到退货请求")
            return 0, 0, ["未找到退货请求"]
        
        success_count = 0
        failed_count = 0
        error_messages = []
        
        # 处理每个退货请求
        for request in return_requests:
            try:
                # 检查是否已存在
                existing_return = ReturnItem.query.filter_by(
                    order_id=request.get('order_id'),
                    product_id=request.get('product_id')
                ).first()
                
                if existing_return:
                    logger.info(f"退货请求已存在: order_id={request.get('order_id')}, product_id={request.get('product_id')}")
                    continue
                
                # 获取详细信息
                return_details = self.platform_api.get_return_details(request.get('id'))
                
                # 获取图片
                image_urls = self.platform_api.get_return_images(request.get('id'))
                image_data = []
                
                # 下载图片
                for url in image_urls:
                    try:
                        image_bytes = self.platform_api.download_image(url)
                        image_data.append(image_bytes)
                    except Exception as e:
                        logger.warning(f"下载图片失败: {url}, 错误: {str(e)}")
                
                # 准备产品信息
                product_info = {
                    "product_id": request.get('product_id'),
                    "product_name": request.get('product_name'),
                    "product_category": request.get('product_category', ''),
                    "original_price": request.get('original_price', 0)
                }
                
                # 使用 AI 分析
                if image_data:
                    ai_result = self.ai_service.categorize_return(
                        image_data=image_data,
                        description=request.get('customer_description', ''),
                        product_info=product_info
                    )
                    
                    # 生成标签
                    tags = self.ai_service.generate_tags(
                        text=request.get('customer_description', ''),
                        image_data=image_data
                    )
                else:
                    # 如果没有图片，只分析文本
                    ai_result = self.ai_service.analyze_text(
                        text=request.get('customer_description', ''),
                        context=f"产品: {request.get('product_name')}, 类别: {request.get('product_category')}"
                    )
                    
                    # 生成标签
                    tags = self.ai_service.generate_tags(
                        text=request.get('customer_description', '')
                    )
                
                # 查找或创建类别
                category = None
                if request.get('product_category'):
                    category = self.category_service.get_category_by_name(request.get('product_category'))
                    if not category:
                        category = self.category_service.create_category(
                            name=request.get('product_category'),
                            description=f"从外部平台导入的类别: {request.get('product_category')}"
                        )
                
                # 创建退货记录
                new_return = ReturnItem(
                    order_id=request.get('order_id'),
                    product_id=request.get('product_id'),
                    product_name=request.get('product_name'),
                    product_category=request.get('product_category', ''),
                    product_category_id=category.id if category else None,
                    return_reason=request.get('return_reason', ''),
                    customer_description=request.get('customer_description', ''),
                    customer_email=request.get('customer_email', ''),
                    customer_phone=request.get('customer_phone', ''),
                    image_urls=image_urls,
                    status=request.get('status', 'pending'),
                    original_price=request.get('original_price', 0),
                    
                    # AI 分析结果
                    ai_category=ai_result.get('category', '未分类'),
                    ai_reason=ai_result.get('reason', ''),
                    ai_recommendation=ai_result.get('recommendation', '人工审核'),
                    ai_confidence=ai_result.get('confidence', 0.0),
                    
                    # 时间戳
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                
                db.session.add(new_return)
                db.session.commit()
                
                logger.info(f"成功导入退货请求: id={new_return.id}, order_id={new_return.order_id}")
                success_count += 1
                
            except Exception as e:
                logger.error(f"导入退货请求失败: {str(e)}")
                error_messages.append(f"导入失败: {request.get('id')} - {str(e)}")
                failed_count += 1
                db.session.rollback()
        
        logger.info(f"导入完成: 成功={success_count}, 失败={failed_count}")
        return success_count, failed_count, error_messages
    
    def process_single_return(self, return_id: str) -> Dict[str, Any]:
        """
        处理单个退货请求
        
        Args:
            return_id (str): 退货 ID
            
        Returns:
            Dict[str, Any]: 处理结果
        """
        logger.info(f"处理单个退货请求: return_id={return_id}")
        
        # 获取退货详情
        return_details = self.platform_api.get_return_details(return_id)
        
        if not return_details:
            logger.error(f"未找到退货请求: return_id={return_id}")
            return {"success": False, "error": "未找到退货请求"}
        
        # 获取图片
        image_urls = self.platform_api.get_return_images(return_id)
        image_data = []
        
        # 下载图片
        for url in image_urls:
            try:
                image_bytes = self.platform_api.download_image(url)
                image_data.append(image_bytes)
            except Exception as e:
                logger.warning(f"下载图片失败: {url}, 错误: {str(e)}")
        
        # 准备产品信息
        product_info = {
            "product_id": return_details.get('product_id'),
            "product_name": return_details.get('product_name'),
            "product_category": return_details.get('product_category', ''),
            "original_price": return_details.get('original_price', 0)
        }
        
        # 使用 AI 分析
        if image_data:
            ai_result = self.ai_service.categorize_return(
                image_data=image_data,
                description=return_details.get('customer_description', ''),
                product_info=product_info
            )
            
            # 生成标签
            tags = self.ai_service.generate_tags(
                text=return_details.get('customer_description', ''),
                image_data=image_data
            )
        else:
            # 如果没有图片，只分析文本
            ai_result = self.ai_service.analyze_text(
                text=return_details.get('customer_description', ''),
                context=f"产品: {return_details.get('product_name')}, 类别: {return_details.get('product_category')}"
            )
            
            # 生成标签
            tags = self.ai_service.generate_tags(
                text=return_details.get('customer_description', '')
            )
        
        # 建议处理方式
        action, confidence = self.ai_service.suggest_action({
            **return_details,
            **ai_result
        })
        
        # 返回结果
        result = {
            "return_id": return_id,
            "ai_analysis": ai_result,
            "tags": tags,
            "suggested_action": action,
            "confidence": confidence,
            "success": True
        }
        
        logger.info(f"退货请求处理完成: return_id={return_id}")
        return result 