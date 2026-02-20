from ..models.record import Record
from ..models.dataset import Dataset
from .. import db
import pandas as pd
from sqlalchemy import func
import logging
import time

logger = logging.getLogger(__name__)

class AnalyticsService:
    @staticmethod
    def get_summary_statistics(dataset_id):
        logger.info(f"Calculating summary statistics for dataset: {dataset_id}")
        start_time = time.time()
        # Using SQLAlchemy for basic stats
        stats = db.session.query(
            func.count(Record.id).label('total_records'),
            func.sum(Record.value).label('total_value'),
            func.avg(Record.value).label('avg_value'),
            func.min(Record.value).label('min_value'),
            func.max(Record.value).label('max_value'),
            func.min(Record.date).label('min_date'),
            func.max(Record.date).label('max_date')
        ).filter(Record.dataset_id == dataset_id).first()

        category_count = db.session.query(func.count(func.distinct(Record.category))).filter(Record.dataset_id == dataset_id).scalar()

        elapsed = time.time() - start_time
        logger.info(f"Summary calculated in {elapsed:.4f}s for {stats.total_records or 0} records.")

        return {
            "dataset_id": dataset_id,
            "total_records": stats.total_records or 0,
            "date_range": {
                "min": str(stats.min_date) if stats.min_date else None,
                "max": str(stats.max_date) if stats.max_date else None
            },
            "category_count": category_count or 0,
            "total_value": float(stats.total_value or 0),
            "avg_value": float(stats.avg_value or 0),
            "min_value": float(stats.min_value or 0),
            "max_value": float(stats.max_value or 0)
        }

    @staticmethod
    def get_chart_data(dataset_id):
        logger.info(f"Generating visualization vectors for dataset: {dataset_id}")
        start_time = time.time()
        
        # Bar Chart: Value by Category
        bar_data = db.session.query(
            Record.category,
            func.sum(Record.value).label('value')
        ).filter(Record.dataset_id == dataset_id).group_by(Record.category).all()
        
        logger.debug(f"Categorical distribution fetch complete: {len(bar_data)} classes found.")

        # Line Chart: Value over Time (Monthly aggregation)
        # Note: This syntax might vary slightly between SQLite and PostgreSQL
        # For simplicity in this demo, we'll fetch all and aggregate with Pandas or just simple group by if date exists
        line_data_raw = db.session.query(
            Record.date,
            func.sum(Record.value).label('value')
        ).filter(Record.dataset_id == dataset_id, Record.date != None).group_by(Record.date).order_by(Record.date).all()

        # Format line data
        line_chart = []
        if line_data_raw:
            df = pd.DataFrame(line_data_raw, columns=['date', 'value'])
            df['date'] = pd.to_datetime(df['date'])
            
            try:
                # Pandas 2.2.0+ uses 'ME' for month-end
                df_monthly = df.resample('ME', on='date').sum().reset_index()
            except ValueError:
                # Older pandas use 'M'
                df_monthly = df.resample('M', on='date').sum().reset_index()
                
            line_chart = [{"date": row['date'].strftime('%Y-%m'), "value": float(row['value'])} for _, row in df_monthly.iterrows()]
            logger.info(f"Time-series resampled to {len(line_chart)} monthly buckets.")

        elapsed = time.time() - start_time
        logger.info(f"Visualization pipeline complete in {elapsed:.4f}s.")

        return {
            "bar_chart": [{"category": row.category, "value": float(row.value)} for row in bar_data],
            "line_chart": line_chart,
            "pie_chart": [{"category": row.category, "value": float(row.value)} for row in bar_data] # Reuse bar data for pie
        }
