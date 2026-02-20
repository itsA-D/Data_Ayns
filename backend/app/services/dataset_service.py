import pandas as pd
import os
from werkzeug.utils import secure_filename
from ..models.dataset import Dataset
from ..models.record import Record
from .. import db
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class DatasetService:
    @staticmethod
    def get_all_datasets():
        logger.info("Fetching all datasets")
        return Dataset.query.order_by(Dataset.upload_time.desc()).all()

    @staticmethod
    def get_dataset_by_id(dataset_id):
        logger.info(f"Fetching dataset with id: {dataset_id}")
        return Dataset.query.get_or_404(dataset_id)

    @staticmethod
    def delete_dataset(dataset_id):
        logger.info(f"Deleting dataset with id: {dataset_id}")
        dataset = Dataset.query.get_or_404(dataset_id)
        db.session.delete(dataset)
        db.session.commit()
        return True

    @staticmethod
    def process_csv_upload(file, name, description):
        if not file:
            logger.error("No file provided for upload")
            raise ValueError("No file provided")

        filename = secure_filename(file.filename)
        logger.info(f"Initiating CSV upload sequence: {filename}")

        try:
            df = pd.read_csv(file)
            DatasetService._validate_csv(df)
            
            dataset = Dataset(
                name=name,
                description=description,
                filename=filename,
                row_count=len(df),
                column_names=df.columns.tolist()
            )

            records = DatasetService._parse_and_prepare_records(df)
            return DatasetService._persist_dataset(dataset, records)

        except ValueError as ve:
            logger.error(f"Validation failed for {filename}: {str(ve)}")
            raise ve
        except Exception as e:
            db.session.rollback()
            logger.error(f"Critical failure during CSV processing: {str(e)}")
            raise e

    @staticmethod
    def _validate_csv(df):
        """Internal validation for CSV structure."""
        if df.empty:
            raise ValueError("The uploaded CSV file contains no data.")
            
        required_columns = ['category', 'value']
        missing_cols = [col for col in required_columns if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Missing required columns in CSV: {', '.join(missing_cols)}")
        
        logger.info("CSV validation successful.")

    @staticmethod
    def _parse_and_prepare_records(df):
        """Transforms DataFrame rows into Record objects without persisting."""
        records = []
        # Pre-calculate non-metadata columns for performance
        standard_cols = {'date', 'category', 'value'}
        meta_cols = [col for col in df.columns if col not in standard_cols]

        for _, row in df.iterrows():
            record_date = None
            if 'date' in row and pd.notnull(row['date']):
                try:
                    record_date = pd.to_datetime(row['date']).date()
                except Exception:
                    logger.debug(f"Parsing skip: Invalid date format '{row['date']}'")

            category = row.get('category', 'Uncategorized')
            value = row.get('value', 0)
            
            # Efficient metadata extraction
            meta = {col: row[col] for col in meta_cols}

            records.append(Record(
                date=record_date,
                category=str(category),
                value=float(value),
                metadata_json=meta
            ))
        
        logger.info(f"Prepared {len(records)} records for persistence.")
        return records

    @staticmethod
    def _persist_dataset(dataset, records):
        """Atomic persistence of dataset and associated records."""
        try:
            db.session.add(dataset)
            db.session.flush()  # Get dataset.id

            for record in records:
                record.dataset_id = dataset.id

            db.session.bulk_save_objects(records)
            db.session.commit()
            
            logger.info(f"Successfully persisted dataset {dataset.id} with {len(records)} records.")
            return dataset
        except Exception as e:
            db.session.rollback()
            logger.error(f"Database persistence failure: {str(e)}")
            raise e
