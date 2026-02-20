from flask import Blueprint, jsonify, request
from ..services.dataset_service import DatasetService
from ..schemas.dataset_schema import DatasetSchema

bp = Blueprint('upload', __name__, url_prefix='/api/upload')
dataset_schema = DatasetSchema()

@bp.route('', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    name = request.form.get('name', file.filename)
    description = request.form.get('description', '')

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if not file.filename.endswith('.csv'):
        return jsonify({"error": "Invalid file format. Only .csv files are supported."}), 400

    try:
        dataset = DatasetService.process_csv_upload(file, name, description)
        return jsonify(dataset_schema.dump(dataset)), 201
    except ValueError as ve:
        # Business logic errors (e.g. malformed CSV)
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        # System errors
        return jsonify({"error": "Internal server error during processing"}), 500
