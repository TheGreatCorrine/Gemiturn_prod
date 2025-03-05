from flask import request
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required
from sqlalchemy import func, desc
from datetime import datetime, timedelta

from app import db
from app.models.return_item import ReturnItem
from app.utils.logger import get_logger

logger = get_logger(__name__)

api = Namespace('analytics', description='Analytics operations')

# Models for API documentation
summary_model = api.model('Summary', {
    'total_returns': fields.Integer(description='Total number of returns'),
    'total_amount': fields.Float(description='Total return amount'),
    'recovery_rate': fields.Float(description='Recovery rate percentage'),
    'avg_processing_time': fields.Float(description='Average processing time in days')
})

dashboard_summary_model = api.model('DashboardSummary', {
    'pending_count': fields.Integer(description='Number of pending returns'),
    'processing_count': fields.Integer(description='Number of processing returns'),
    'completed_count': fields.Integer(description='Number of completed returns'),
    'rejected_count': fields.Integer(description='Number of rejected returns'),
    'total_count': fields.Integer(description='Total number of returns'),
    'avg_processing_time': fields.Float(description='Average processing time in days'),
    'total_refund_amount': fields.Float(description='Total refund amount')
})

category_stats_model = api.model('CategoryStats', {
    'category': fields.String(description='Product category'),
    'count': fields.Integer(description='Number of returns'),
    'percentage': fields.Float(description='Percentage of total returns')
})

reason_stats_model = api.model('ReasonStats', {
    'reason': fields.String(description='Return reason'),
    'count': fields.Integer(description='Number of returns'),
    'percentage': fields.Float(description='Percentage of total returns')
})

time_series_model = api.model('TimeSeries', {
    'date': fields.String(description='Date'),
    'count': fields.Integer(description='Number of returns'),
    'amount': fields.Float(description='Return amount')
})


@api.route('/summary')
class SummaryStats(Resource):
    @api.doc('get_summary_stats')
    @api.marshal_with(summary_model)
    @jwt_required()
    def get(self):
        """Get summary statistics"""
        # Total returns
        total_returns = ReturnItem.query.count()
        
        # Total amount
        total_amount_result = db.session.query(func.sum(ReturnItem.original_price)).scalar()
        total_amount = total_amount_result if total_amount_result else 0
        
        # Recovery rate
        recovery_amount_result = db.session.query(func.sum(ReturnItem.resale_price)).scalar()
        recovery_amount = recovery_amount_result if recovery_amount_result else 0
        recovery_rate = (recovery_amount / total_amount * 100) if total_amount > 0 else 0
        
        # Average processing time
        completed_items = ReturnItem.query.filter(
            ReturnItem.status == 'completed',
            ReturnItem.processed_at.isnot(None)
        ).all()
        
        if completed_items:
            total_days = sum(
                (item.processed_at - item.created_at).total_seconds() / 86400
                for item in completed_items
            )
            avg_processing_time = total_days / len(completed_items)
        else:
            avg_processing_time = 0
        
        return {
            'total_returns': total_returns,
            'total_amount': total_amount,
            'recovery_rate': recovery_rate,
            'avg_processing_time': avg_processing_time
        }


@api.route('/dashboard-summary')
class DashboardSummary(Resource):
    @api.doc('get_dashboard_summary')
    @api.marshal_with(dashboard_summary_model)
    def get(self):
        """获取仪表板摘要数据"""
        # 各状态计数
        pending_count = ReturnItem.query.filter_by(status='pending').count()
        processing_count = ReturnItem.query.filter_by(status='processing').count()
        completed_count = ReturnItem.query.filter_by(status='completed').count()
        rejected_count = ReturnItem.query.filter_by(status='rejected').count()
        total_count = ReturnItem.query.count()
        
        # 平均处理时间
        completed_items = ReturnItem.query.filter(
            ReturnItem.status == 'completed',
            ReturnItem.processed_at.isnot(None)
        ).all()
        
        if completed_items:
            total_days = sum(
                (item.processed_at - item.created_at).total_seconds() / 86400
                for item in completed_items if item.processed_at
            )
            avg_processing_time = total_days / len(completed_items)
        else:
            avg_processing_time = 0
        
        # 总退款金额
        total_refund_result = db.session.query(func.sum(ReturnItem.refund_amount)).scalar()
        total_refund_amount = total_refund_result if total_refund_result else 0
        
        return {
            'pending_count': pending_count,
            'processing_count': processing_count,
            'completed_count': completed_count,
            'rejected_count': rejected_count,
            'total_count': total_count,
            'avg_processing_time': avg_processing_time,
            'total_refund_amount': total_refund_amount
        }


@api.route('/categories')
class CategoryStats(Resource):
    @api.doc('get_category_stats')
    @api.marshal_list_with(category_stats_model)
    @jwt_required()
    def get(self):
        """Get return statistics by product category"""
        # Get category counts
        category_counts = db.session.query(
            ReturnItem.product_category_id,
            func.count(ReturnItem.id).label('count')
        ).group_by(ReturnItem.product_category_id).all()
        
        # Calculate total
        total_returns = ReturnItem.query.count()
        
        # Format results
        results = []
        for category_id, count in category_counts:
            if category_id:
                from app.models.product_category import ProductCategory
                category = ProductCategory.query.get(category_id)
                category_name = category.name if category else "Unknown"
            else:
                category_name = "Uncategorized"
                
            percentage = (count / total_returns * 100) if total_returns > 0 else 0
            results.append({
                'category': category_name,
                'count': count,
                'percentage': percentage
            })
        
        # Sort by count descending
        results.sort(key=lambda x: x['count'], reverse=True)
        
        return results


@api.route('/reasons')
class ReasonStats(Resource):
    @api.doc('get_reason_stats')
    @api.marshal_list_with(reason_stats_model)
    @jwt_required()
    def get(self):
        """Get return statistics by return reason"""
        # Get reason counts (using AI-detected reasons)
        reason_counts = db.session.query(
            ReturnItem.ai_reason,
            func.count(ReturnItem.id).label('count')
        ).filter(ReturnItem.ai_reason.isnot(None)).group_by(ReturnItem.ai_reason).all()
        
        # Calculate total
        total_returns = ReturnItem.query.filter(ReturnItem.ai_reason.isnot(None)).count()
        
        # Format results
        results = []
        for reason, count in reason_counts:
            percentage = (count / total_returns * 100) if total_returns > 0 else 0
            results.append({
                'reason': reason,
                'count': count,
                'percentage': percentage
            })
        
        # Sort by count descending
        results.sort(key=lambda x: x['count'], reverse=True)
        
        return results


@api.route('/time-series')
class TimeSeriesStats(Resource):
    @api.doc('get_time_series_stats')
    @api.marshal_list_with(time_series_model)
    @jwt_required()
    def get(self):
        """Get time series data for returns"""
        # Get parameters
        days = request.args.get('days', 30, type=int)
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Query data by day
        results = []
        current_date = start_date.date()
        
        while current_date <= end_date.date():
            next_date = current_date + timedelta(days=1)
            
            # Count returns for this day
            count = ReturnItem.query.filter(
                ReturnItem.created_at >= current_date,
                ReturnItem.created_at < next_date
            ).count()
            
            # Sum amount for this day
            amount_result = db.session.query(func.sum(ReturnItem.original_price)).filter(
                ReturnItem.created_at >= current_date,
                ReturnItem.created_at < next_date
            ).scalar()
            amount = amount_result if amount_result else 0
            
            results.append({
                'date': current_date.isoformat(),
                'count': count,
                'amount': amount
            })
            
            current_date = next_date
        
        return results 