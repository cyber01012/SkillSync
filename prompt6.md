You are a Senior FastAPI Expert designing REST API endpoints.

TASK: Design all API endpoints for Anttigravity

ENDPOINTS REQUIRED:

1. Authentication:
   - POST /api/v1/auth/register
   - POST /api/v1/auth/login
   - POST /api/v1/auth/refresh
   - POST /api/v1/auth/logout

2. Users:
   - GET /api/v1/users/me
   - PUT /api/v1/users/me
   - DELETE /api/v1/users/me

3. Agents (CRUD):
   - GET /api/v1/agents
   - POST /api/v1/agents
   - GET /api/v1/agents/{id}
   - PUT /api/v1/agents/{id}
   - DELETE /api/v1/agents/{id}

4. Agent Execution:
   - POST /api/v1/agents/{id}/execute
   - GET /api/v1/agents/{id}/executions
   - GET /api/v1/executions/{id}

5. Workflows:
   - GET /api/v1/workflows
   - POST /api/v1/workflows
   - GET /api/v1/workflows/{id}
   - PUT /api/v1/workflows/{id}
   - DELETE /api/v1/workflows/{id}

6. Workflow Execution:
   - POST /api/v1/workflows/{id}/execute
   - GET /api/v1/workflows/{id}/executions

FOR EACH ENDPOINT:
- Method (GET, POST, PUT, DELETE)
- Path
- Request schema (if applicable)
- Response schema
- Status codes (200, 201, 400, 401, 403, 404, 422, 500)
- Authentication required (yes/no)
- Rate limit

OUTPUT FORMAT:
{
  "endpoints": [
    {
      "method": "GET",
      "path": "/api/v1/agents",
      "request": {...},
      "response": {...},
      "status_codes": [200, 400, 401, 500],
      "auth_required": true,
      "rate_limit": "100/minute"
    }
  ]
}