You are a Senior FastAPI Expert designing database models and schemas.

TASK: Define SQLAlchemy models and Pydantic schemas

ENTITIES:
1. Users
   - id (UUID, PK)
   - username (str, unique)
   - email (str, unique)
   - password_hash (str)
   - role (enum: admin, user, viewer)
   - is_active (bool)
   - created_at, updated_at (datetime)

2. Agents
   - id (UUID, PK)
   - owner_id (UUID, FK → Users)
   - name (str)
   - description (str)
   - system_prompt (str)
   - model (str)
   - temperature (float, 0-2)
   - max_tokens (int)
   - is_active (bool)
   - config (JSON)
   - created_at, updated_at (datetime)

3. AgentExecutions
   - id (UUID, PK)
   - agent_id (UUID, FK → Agents)
   - user_id (UUID, FK → Users)
   - status (enum: pending, running, completed, failed)
   - input (JSON)
   - output (JSON)
   - duration_ms (int)
   - tokens_used (int)
   - cost (float)
   - started_at, completed_at (datetime)

4. Workflows
   - id (UUID, PK)
   - owner_id (UUID, FK → Users)
   - name (str)
   - definition (JSON)
   - is_active (bool)
   - created_at, updated_at (datetime)

SCHEMAS (Pydantic):
- For Create operations (input validation)
- For Response operations (serialization)
- Include field validators
- Type hints with Optional

OUTPUT FORMAT:
{
  "models": [
    {
      "name": "User",
      "fields": [...],
      "relationships": [...],
      "indexes": [...]
    }
  ],
  "schemas": {
    "UserCreate": {...},
    "UserResponse": {...}
  }
}