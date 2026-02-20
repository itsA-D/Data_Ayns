from marshmallow import Schema, fields

class RecordSchema(Schema):
    id = fields.Int(dump_only=True)
    dataset_id = fields.Int(required=True)
    date = fields.Date()
    category = fields.Str()
    value = fields.Float()
    metadata_json = fields.Dict()
    created_at = fields.DateTime(dump_only=True)
