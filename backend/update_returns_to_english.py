from app import create_app
from app.models.return_item import ReturnItem
from app.extensions import db
import json

# 中英文对照表
translations = {
    # AI分析结果分类
    "外观差异": "Appearance Difference",
    "质量问题": "Quality Issues",
    "尺寸不合": "Size Mismatch",
    "性能不达标": "Performance Below Expectations",
    "收到错误商品": "Wrong Item Received",
    "物流问题": "Logistics Issues",
    "客户改变主意": "Customer Changed Mind",
    "配件缺失": "Missing Accessories",
    "过敏/不良反应": "Allergic/Adverse Reaction",
    "延迟交付": "Delayed Delivery",
    "未分类": "Uncategorized",
    
    # 处理建议
    "直接转售": "Direct Resale",
    "折扣销售": "Discounted Sale",
    "退回供应商": "Return to Supplier",
    "修复并转售": "Repair and Resell",
    "零件回收": "Parts Recycling",
    "慈善捐赠": "Charity Donation",
    "环保处理": "Environmental Disposal",
    "跨平台直销": "Cross-platform Direct Sales",
    "捆绑销售": "Bundle Sales",
    "转为样品/展示品": "Convert to Sample/Display Item",
    "人工审核": "Manual Review",
    
    # 状态
    "待处理": "Pending",
    "处理中": "Processing",
    "已完成": "Completed",
    "已拒绝": "Rejected",
    
    # 退货原因
    "质量问题": "Quality Issues",
    "尺寸不合": "Size Mismatch",
    "外观与描述不符": "Appearance Different from Description",
    "性能不达标": "Performance Below Expectations",
    "收到错误商品": "Wrong Item Received",
    "物流损坏": "Damaged During Shipping",
    "不再需要": "No Longer Needed",
    "配件缺失": "Missing Accessories",
    "过敏反应": "Allergic Reaction",
    "延迟交付": "Delayed Delivery",
    
    # 常见AI分析原因短语
    "图像显示产品外观符合预期，但缺乏客户描述，无法确定具体原因": 
    "The image shows the product appearance meets expectations, but lack of customer description makes it difficult to determine the specific reason",
    "可能是客户对颜色或图案的感知与预期不符": 
    "The customer's perception of color or pattern may not match expectations",
    "分析结果格式不完整": "Incomplete analysis result format",
    "分析结果格式错误": "Incorrect analysis result format",
    "分析失败": "Analysis failed"
}

# 创建Flask应用
app = create_app()

# 使用应用上下文
with app.app_context():
    # 获取所有退货订单
    all_returns = ReturnItem.query.all()
    
    print(f"找到 {len(all_returns)} 条退货订单记录")
    
    # 确认更新
    confirmation = input("确定要将所有退货订单和AI分析结果从中文改为英文吗？(y/n): ")
    
    if confirmation.lower() == 'y':
        updated_count = 0
        
        for return_item in all_returns:
            # 更新退货原因
            if return_item.return_reason in translations:
                return_item.return_reason = translations[return_item.return_reason]
            
            # 更新AI分析结果
            if return_item.ai_analysis:
                ai_analysis = return_item.ai_analysis
                
                # 更新分类
                if 'category' in ai_analysis and ai_analysis['category'] in translations:
                    ai_analysis['category'] = translations[ai_analysis['category']]
                
                # 更新建议
                if 'recommendation' in ai_analysis and ai_analysis['recommendation'] in translations:
                    ai_analysis['recommendation'] = translations[ai_analysis['recommendation']]
                
                # 更新原因
                if 'reason' in ai_analysis:
                    reason = ai_analysis['reason']
                    # 尝试直接翻译
                    if reason in translations:
                        ai_analysis['reason'] = translations[reason]
                    else:
                        # 尝试部分匹配翻译
                        for zh, en in translations.items():
                            if zh in reason and len(zh) > 5:  # 只替换较长的短语，避免误替换
                                reason = reason.replace(zh, en)
                        ai_analysis['reason'] = reason
                
                # 更新AI分析结果
                return_item.ai_analysis = ai_analysis
            
            updated_count += 1
        
        # 提交事务
        try:
            db.session.commit()
            print(f"成功更新 {updated_count} 条退货订单记录")
        except Exception as e:
            db.session.rollback()
            print(f"更新退货订单失败: {str(e)}")
    else:
        print("操作已取消，没有更新任何记录") 