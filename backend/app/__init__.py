from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from .config import config

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    with app.app_context():
        from .routes import dataset_routes, upload_routes
        app.register_blueprint(dataset_routes.bp)
        app.register_blueprint(upload_routes.bp)

    return app
