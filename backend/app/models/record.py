from datetime import datetime
from .. import db

class Record(db.Model):
    __tablename__ = 'records'

    id = db.Column(db.Integer, primary_key=True)
    dataset_id = db.Column(db.Integer, db.ForeignKey('datasets.id', ondelete='CASCADE'), nullable=False)
    date = db.Column(db.Date)
    category = db.Column(db.String(255))
    value = db.Column(db.Numeric(15, 2))
    metadata_json = db.Column(db.JSON)  # Renamed from metadata to avoid conflict with SQLAlchemy metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Record {self.category}: {self.value}>'
