# Backend: Core Requirements & Architecture
**Role:** Senior Python FastAPI Expert | Backend Architecture Lead

---

## 1. Framework & Foundation

### FastAPI Stack
```python
# Core dependencies
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0
python-dotenv==1.0.0
```

### Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── constants.py
│   ├── models/
│   │   ├── database.py
│   │   └── schemas.py
│   ├── routes/
│   │   ├── api_v1.py
│   │   ├── users.py
│   │   ├── agents.py
│   │   └── workflows.py
│   ├── services/
│   │   ├── agent_service.py
│   │   ├── user_service.py
│   │   └── workflow_service.py
│   ├── utils/
│   │   ├── helpers.py
│   │   └── validators.py
│   └── middleware/
│       ├── auth.py
│       └── logging.py
├── tests/
├── requirements.txt
└── docker-compose.yml
```

---

## 2. Database Abstraction Layer

### ORM Configuration
```python
# SQLAlchemy setup with async support
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "postgresql+asyncpg://user:password@localhost/db"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()
```

### Database Dependency Injection
```python
async def get_db() -> AsyncGenerator:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

---

## 3. Authentication & Authorization

### JWT Token Strategy
```python
# Security configuration
- Algorithm: HS256 (JWT)
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days
- Token storage: HTTP-only cookies
- CORS origin validation

class TokenData(BaseModel):
    sub: str  # user_id
    exp: datetime
    iat: datetime
    scopes: List[str]
```

### Role-Based Access Control (RBAC)
```python
class Role(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"
    VIEWER = "viewer"

# Dependency for protecting endpoints
async def require_role(roles: List[Role]):
    async def role_checker(current_user = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403)
        return current_user
    return role_checker
```

---

## 4. API Design & Endpoints

### RESTful Conventions
```
GET    /api/v1/agents              - List all agents
GET    /api/v1/agents/{id}         - Get agent details
POST   /api/v1/agents              - Create agent
PUT    /api/v1/agents/{id}         - Update agent
DELETE /api/v1/agents/{id}         - Delete agent
GET    /api/v1/agents/{id}/runs    - Agent execution history
```

### Request/Response Schemas
```python
class AgentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    system_prompt: str
    model: str
    temperature: float = 0.7
    max_tokens: int = 2000

class AgentResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

### Error Response Standard
```python
class ErrorResponse(BaseModel):
    error_code: str
    message: str
    details: Optional[Dict]
    timestamp: datetime

# HTTP Status Code Mapping
200 - OK
201 - Created
400 - Bad Request
401 - Unauthorized
403 - Forbidden
404 - Not Found
422 - Validation Error
429 - Rate Limited
500 - Internal Server Error
```

---

## 5. Business Logic Layer

### Service Layer Pattern
```python
class AgentService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_agent(self, agent_data: AgentCreate, user_id: str) -> Agent:
        """Business logic for agent creation"""
        agent = Agent(**agent_data.dict(), owner_id=user_id)
        self.db.add(agent)
        await self.db.commit()
        return agent
    
    async def get_agent(self, agent_id: UUID) -> Optional[Agent]:
        """Fetch agent with caching consideration"""
        result = await self.db.execute(
            select(Agent).where(Agent.id == agent_id)
        )
        return result.scalar_one_or_none()
```

### Dependency Injection
```python
from fastapi import Depends

@router.post("/agents")
async def create_agent(
    agent_data: AgentCreate,
    current_user = Depends(get_current_user),
    db = Depends(get_db),
    service = Depends(AgentService)
):
    return await service.create_agent(agent_data, current_user.id)
```

---

## 6. Data Validation & Sanitization

### Pydantic Validators
```python
from pydantic import field_validator, model_validator

class AgentCreate(BaseModel):
    name: str
    temperature: float
    
    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
    
    @field_validator('temperature')
    @classmethod
    def valid_temperature(cls, v):
        if not 0 <= v <= 2:
            raise ValueError('Temperature must be between 0 and 2')
        return v
```

### Input Sanitization
```python
import bleach
from html import escape

def sanitize_input(text: str) -> str:
    """Remove dangerous characters and scripts"""
    return bleach.clean(text, tags=[], strip=True)
```

---

## 7. Error Handling & Logging

### Custom Exception Handling
```python
class AgentNotFoundException(Exception):
    pass

class InvalidAgentConfiguration(Exception):
    pass

@app.exception_handler(AgentNotFoundException)
async def agent_not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "error_code": "AGENT_NOT_FOUND",
            "message": str(exc),
            "timestamp": datetime.utcnow().isoformat()
        }
    )
```

### Structured Logging
```python
import logging
from pythonjsonlogger import jsonlogger

logger = logging.getLogger(__name__)
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)

logger.info("Agent created", extra={
    "agent_id": agent_id,
    "user_id": user_id,
    "timestamp": datetime.utcnow()
})
```

---

## 8. Rate Limiting & Throttling

### Implementation
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/agents")
@limiter.limit("100/minute")
async def list_agents(request: Request):
    pass
```

### Strategy
- Anonymous users: 10 requests/minute
- Authenticated users: 100 requests/minute
- Premium users: 1000 requests/minute

---

## 9. Caching Strategy

### Redis Integration
```python
import redis.asyncio as redis

class CacheService:
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
    
    async def get(self, key: str):
        return await self.redis.get(key)
    
    async def set(self, key: str, value: str, ttl: int = 3600):
        await self.redis.setex(key, ttl, value)
```

### Caching Layers
- **Query caching**: Frequently accessed agents (TTL: 30 min)
- **User session cache**: User preferences (TTL: 24 hours)
- **Agent execution cache**: Recent execution results (TTL: 1 hour)

---

## 10. Background Tasks & Job Queue

### Celery Setup (Optional for heavy processing)
```python
from celery import Celery

celery_app = Celery(
    "anttigravity",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

@celery_app.task
async def execute_agent_workflow(agent_id: str, params: dict):
    # Long-running agent execution
    pass
```

### FastAPI Background Tasks (Simple)
```python
from fastapi import BackgroundTasks

@app.post("/agents/{agent_id}/execute")
async def execute_agent(agent_id: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(run_agent_async, agent_id)
    return {"message": "Agent execution started"}
```

---

## 11. Testing Strategy

### Unit Tests
```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_agent(client: AsyncClient, user_token: str):
    response = await client.post(
        "/api/v1/agents",
        json={"name": "Test Agent", "system_prompt": "..."},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 201
```

### Integration Tests
```python
@pytest.mark.asyncio
async def test_agent_workflow_execution(db: AsyncSession):
    # Test complete workflow from creation to execution
    pass
```

---

## 12. API Documentation

### Auto-generated Docs
```python
# FastAPI auto-generates:
# - Swagger UI: /docs
# - ReDoc: /redoc
# - OpenAPI schema: /openapi.json

# Configure with metadata
app = FastAPI(
    title="Anttigravity API",
    description="AI Agent Management System",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)
```

---

## 13. Security Headers & CORS

### CORS Configuration
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Security Headers
```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["domain.com"])

# Add headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
```

---

## 14. Environment Configuration

### .env Structure
```env
# Database
DATABASE_URL=postgresql+asyncpg://user:pwd@localhost/anttigravity
MONGODB_URL=mongodb://localhost:27017/anttigravity

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15

# API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...

# Environment
DEBUG=False
ENVIRONMENT=production
LOG_LEVEL=INFO
```

---

## 15. Performance Optimization

### Query Optimization
```python
# Eager loading
agents = await db.execute(
    select(Agent).options(joinedload(Agent.workflows))
)

# Pagination
skip = (page - 1) * limit
agents = await db.execute(
    select(Agent).offset(skip).limit(limit)
)
```

### Connection Pooling
```python
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True
)
```

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] Redis cache operational
- [ ] JWT secret keys generated
- [ ] CORS origins configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Error tracking setup (Sentry)
- [ ] Health check endpoints ready
- [ ] Database backups configured
- [ ] API documentation verified
- [ ] Load testing completed
