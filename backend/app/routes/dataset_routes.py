from flask import Blueprint, jsonify, request
from ..services.dataset_service import DatasetService
from ..services.analytics_service import AnalyticsService
from ..schemas.dataset_schema import DatasetSchema, DatasetSummarySchema

bp = Blueprint('datasets', __name__, url_prefix='/api/datasets')
dataset_schema = DatasetSchema()
datasets_schema = DatasetSchema(many=True)
summary_schema = DatasetSummarySchema()

@bp.route('', methods=['GET'])
def get_datasets():
    datasets = DatasetService.get_all_datasets()
    return jsonify({
        "datasets": datasets_schema.dump(datasets),
        "total": len(datasets)
    })

@bp.route('/<int:id>', methods=['GET'])
def get_dataset(id):
    dataset = DatasetService.get_dataset_by_id(id)
    return jsonify(dataset_schema.dump(dataset))

@bp.route('/<int:id>', methods=['DELETE'])
def delete_dataset(id):
    DatasetService.delete_dataset(id)
    return jsonify({"message": "Dataset deleted successfully"}), 200

@bp.route('/<int:id>/summary', methods=['GET'])
def get_summary(id):
    summary = AnalyticsService.get_summary_statistics(id)
    return jsonify(summary_schema.dump(summary))

@bp.route('/<int:id>/chart-data', methods=['GET'])
def get_chart_data(id):
    chart_data = AnalyticsService.get_chart_data(id)
    return jsonify(chart_data)
