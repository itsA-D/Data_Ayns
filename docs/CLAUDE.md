# AI Assistant Guidance - Data Analytics Dashboard

## Project Architecture

This is a Flask + React Data Analytics Dashboard with PostgreSQL.

## Tech Stack
- Backend: Flask, SQLAlchemy, Marshmallow, Pandas
- Frontend: React, Vite, Recharts
- Database: PostgreSQL (SQLite for dev)

## Layer Separation Rules

### Routes (backend/app/routes/)
- Handle HTTP requests/responses ONLY
- Delegate business logic to services
- No direct database queries in routes
- Use schemas for validation

### Services (backend/app/services/)
- All business logic lives here
- Data processing with Pandas
- Database operations via models
- Return plain Python dicts

### Models (backend/app/models/)
- SQLAlchemy ORM classes
- Define table structure
- No business logic

### Schemas (backend/app/schemas/)
- Marshmallow schemas for serialization
- Input validation
- Output formatting

## Coding Standards

1. **Type Hints**: Use Python type hints everywhere
2. **Error Handling**: Return proper HTTP status codes
3. **Validation**: Always validate input with schemas
4. **Testing**: pytest for backend, Jest for frontend
5. **Logging**: Use structured logging with app.logger

## File Upload Rules

1. Use secure_filename() always
2. Validate file extensions (.csv only)
3. Limit file size (MAX_CONTENT_LENGTH)
4. Parse and validate before database insert

## React Guidelines

1. Functional components with hooks
2. Separate API calls to services/
3. Handle loading and error states
4. Use Recharts for visualizations
