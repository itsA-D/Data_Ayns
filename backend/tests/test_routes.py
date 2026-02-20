import pytest
import io
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models.dataset import Dataset
from app.models.record import Record


@pytest.fixture
def app():
    """Create and configure a test app instance."""
    app = create_app('development')
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['WTF_CSRF_ENABLED'] = False

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create a test client."""
    return app.test_client()


@pytest.fixture
def sample_csv():
    """Create a sample CSV file for testing."""
    csv_content = """date,category,value
2024-01-15,Electronics,1000
2024-01-20,Clothing,500
2024-02-05,Electronics,800
2024-02-14,Groceries,200
2024-03-10,Clothing,600
"""
    return (io.BytesIO(csv_content.encode('utf-8')), 'test_data.csv')


class TestDatasetRoutes:
    """Test suite for dataset API endpoints."""

    def test_get_datasets_empty(self, client):
        """Test GET /api/datasets returns empty list initially."""
        response = client.get('/api/datasets')
        assert response.status_code == 200
        data = response.get_json()
        assert 'datasets' in data
        assert data['datasets'] == []
        assert data['total'] == 0

    def test_get_dataset_not_found(self, client):
        """Test GET /api/datasets/<id> returns 404 for non-existent dataset."""
        response = client.get('/api/datasets/999')
        assert response.status_code == 404

    def test_delete_dataset_not_found(self, client):
        """Test DELETE /api/datasets/<id> returns 404 for non-existent dataset."""
        response = client.delete('/api/datasets/999')
        assert response.status_code == 404

    def test_upload_without_file(self, client):
        """Test POST /api/upload without file returns 400."""
        response = client.post('/api/upload')
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data

    def test_upload_empty_filename(self, client):
        """Test POST /api/upload with empty filename returns 400."""
        response = client.post(
            '/api/upload',
            data={'file': (io.BytesIO(b''), '')},
            content_type='multipart/form-data'
        )
        assert response.status_code == 400

    def test_upload_invalid_file_type(self, client):
        """Test POST /api/upload with non-CSV file returns 400."""
        response = client.post(
            '/api/upload',
            data={'file': (io.BytesIO(b'test data'), 'test.txt')},
            content_type='multipart/form-data'
        )
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert 'csv' in data['error'].lower()

    def test_upload_valid_csv(self, client, sample_csv):
        """Test POST /api/upload with valid CSV creates dataset."""
        response = client.post(
            '/api/upload',
            data={'file': sample_csv, 'name': 'Test Dataset'},
            content_type='multipart/form-data'
        )
        assert response.status_code == 201
        data = response.get_json()
        assert 'id' in data
        assert data['name'] == 'Test Dataset'
        assert data['row_count'] == 5

    def test_get_dataset_after_upload(self, client, sample_csv):
        """Test GET /api/datasets/<id> returns dataset after upload."""
        upload_response = client.post(
            '/api/upload',
            data={'file': sample_csv, 'name': 'Test Dataset'},
            content_type='multipart/form-data'
        )
        dataset_id = upload_response.get_json()['id']

        response = client.get(f'/api/datasets/{dataset_id}')
        assert response.status_code == 200
        data = response.get_json()
        assert data['name'] == 'Test Dataset'
        assert data['row_count'] == 5

    def test_delete_dataset(self, client, sample_csv):
        """Test DELETE /api/datasets/<id> removes dataset."""
        upload_response = client.post(
            '/api/upload',
            data={'file': sample_csv, 'name': 'Test Dataset'},
            content_type='multipart/form-data'
        )
        dataset_id = upload_response.get_json()['id']

        response = client.delete(f'/api/datasets/{dataset_id}')
        assert response.status_code == 200

        get_response = client.get(f'/api/datasets/{dataset_id}')
        assert get_response.status_code == 404


class TestAnalyticsRoutes:
    """Test suite for analytics API endpoints."""

    def test_get_summary_no_data(self, client):
        """Test GET /api/datasets/<id>/summary returns stats for empty dataset."""
        upload_response = client.post(
            '/api/upload',
            data={'file': (io.BytesIO(b'date,category,value\n'), 'empty.csv'), 'name': 'Empty'},
            content_type='multipart/form-data'
        )
        dataset_id = upload_response.get_json()['id']

        response = client.get(f'/api/datasets/{dataset_id}/summary')
        assert response.status_code == 200
        data = response.get_json()
        assert 'total_records' in data
        assert 'total_value' in data

    def test_get_summary_with_data(self, client, sample_csv):
        """Test GET /api/datasets/<id>/summary returns correct stats."""
        upload_response = client.post(
            '/api/upload',
            data={'file': sample_csv, 'name': 'Test'},
            content_type='multipart/form-data'
        )
        dataset_id = upload_response.get_json()['id']

        response = client.get(f'/api/datasets/{dataset_id}/summary')
        assert response.status_code == 200
        data = response.get_json()
        assert data['total_records'] == 5
        assert data['category_count'] == 3
        assert data['total_value'] == 3100.0

    def test_get_chart_data(self, client, sample_csv):
        """Test GET /api/datasets/<id>/chart-data returns chart data."""
        upload_response = client.post(
            '/api/upload',
            data={'file': sample_csv, 'name': 'Test'},
            content_type='multipart/form-data'
        )
        dataset_id = upload_response.get_json()['id']

        response = client.get(f'/api/datasets/{dataset_id}/chart-data')
        assert response.status_code == 200
        data = response.get_json()
        assert 'bar_chart' in data
        assert 'line_chart' in data
        assert 'pie_chart' in data


class TestModels:
    """Test suite for database models."""

    def test_dataset_creation(self, app):
        """Test creating a Dataset model."""
        with app.app_context():
            dataset = Dataset(
                name='Test',
                description='Test description',
                filename='test.csv',
                row_count=100,
                column_names=['date', 'value']
            )
            db.session.add(dataset)
            db.session.commit()

            assert dataset.id is not None
            assert dataset.name == 'Test'
            assert dataset.row_count == 100

    def test_record_relationship(self, app):
        """Test Record relationship with Dataset."""
        with app.app_context():
            dataset = Dataset(
                name='Test',
                filename='test.csv',
                row_count=1
            )
            db.session.add(dataset)
            db.session.commit()

            record = Record(
                dataset_id=dataset.id,
                category='Test',
                value=100.0
            )
            db.session.add(record)
            db.session.commit()

            assert record.dataset.name == 'Test'
            assert len(dataset.records) == 1

    def test_cascade_delete(self, app):
        """Test that deleting dataset deletes related records."""
        with app.app_context():
            dataset = Dataset(
                name='Test',
                filename='test.csv',
                row_count=2
            )
            db.session.add(dataset)
            db.session.commit()

            record1 = Record(dataset_id=dataset.id, category='A', value=100)
            record2 = Record(dataset_id=dataset.id, category='B', value=200)
            db.session.add_all([record1, record2])
            db.session.commit()

            dataset_id = dataset.id
            db.session.delete(dataset)
            db.session.commit()

            records = Record.query.filter_by(dataset_id=dataset_id).all()
            assert len(records) == 0
