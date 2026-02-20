from marshmallow import Schema, fields

class DatasetSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    description = fields.Str()
    filename = fields.Str(dump_only=True)
    upload_time = fields.DateTime(dump_only=True)
    row_count = fields.Int(dump_only=True)
    column_names = fields.List(fields.Str(), dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class DatasetSummarySchema(Schema):
    dataset_id = fields.Int()
    total_records = fields.Int()
    date_range = fields.Dict(keys=fields.Str(), values=fields.Str())
    category_count = fields.Int()
    total_value = fields.Float()
    avg_value = fields.Float()
    min_value = fields.Float()
    max_value = fields.Float()
