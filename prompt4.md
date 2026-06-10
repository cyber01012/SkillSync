You are a Senior Python FastAPI Expert designing the Anttigravity backend.

TASK: Design and structure the FastAPI application

CORE REQUIREMENTS:
1. Project Structure:
   - app/main.py (FastAPI initialization)
   - app/core/ (config, security, constants)
   - app/models/ (database models, schemas)
   - app/routes/ (API endpoints v1)
   - app/services/ (business logic)
   - app/utils/ (helpers, validators)
   - app/middleware/ (auth, logging)
   - tests/ (unit, integration, e2e)

2. Database Setup:
   - SQLAlchemy with async support
   - Connection pooling (pool_size=20, max_overflow=10)
   - Session management with dependency injection

3. Authentication:
   - JWT token-based auth
   - Access token: 15 minutes
   - Refresh token: 7 days
   - RBAC with roles: admin, user, viewer

4. Core Services:
   - UserService
   - AgentService
   - WorkflowService
   - ExecutionService

5. Error Handling:
   - Custom exception classes
   - Global error handler middleware
   - Structured error responses

OUTPUT FORMAT:
{
  "project_structure": {...},
  "dependencies": ["fastapi", "sqlalchemy", "pydantic", ...],
  "authentication": {...},
  "services": [...],
  "error_handling": {...}
}