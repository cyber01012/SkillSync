# Anttigravity - Project Baseline
**Final Project Structure & Compilation Guide**

---

## 1. Project Directory Structure

```
anttigravity/
│
├── README.md                    # Project overview
├── CONTRIBUTING.md              # Contribution guidelines
├── LICENSE                      # License file
├── docker-compose.yml           # Local development environment
├── .gitignore
├── .env.example
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI app initialization
│   │   ├── core/               # Core configurations
│   │   │   ├── config.py       # Settings (Pydantic)
│   │   │   ├── security.py     # JWT, encryption
│   │   │   └── constants.py    # App constants
│   │   ├── models/             # Database models & schemas
│   │   │   ├── database.py     # SQLAlchemy models
│   │   │   ├── schemas.py      # Pydantic schemas
│   │   │   └── enums.py        # Enum definitions
│   │   ├── routes/             # API endpoints (v1)
│   │   │   ├── __init__.py
│   │   │   ├── api_v1.py       # Main router
│   │   │   ├── users.py        # User endpoints
│   │   │   ├── agents.py       # Agent endpoints
│   │   │   ├── workflows.py    # Workflow endpoints
│   │   │   └── executions.py   # Execution endpoints
│   │   ├── services/           # Business logic
│   │   │   ├── agent_service.py
│   │   │   ├── user_service.py
│   │   │   ├── workflow_service.py
│   │   │   ├── execution_service.py
│   │   │   └── cache_service.py
│   │   ├── utils/              # Utility functions
│   │   │   ├── helpers.py
│   │   │   ├── validators.py
│   │   │   ├── formatters.py
│   │   │   └── exceptions.py
│   │   ├── middleware/         # Custom middleware
│   │   │   ├── auth.py
│   │   │   ├── logging.py
│   │   │   └── error_handler.py
│   │   └── db/                 # Database utilities
│   │       ├── base.py         # Base models
│   │       ├── session.py      # Session management
│   │       └── migrations/     # Alembic migrations
│   │
│   ├── tests/                  # Test suite
│   │   ├── conftest.py         # Pytest configuration
│   │   ├── unit/
│   │   │   ├── test_services.py
│   │   │   └── test_utils.py
│   │   ├── integration/
│   │   │   ├── test_api.py
│   │   │   └── test_workflows.py
│   │   └── e2e/
│   │       └── test_agent_execution.py
│   │
│   ├── requirements.txt         # Python dependencies
│   ├── requirements-dev.txt     # Development dependencies
│   ├── Dockerfile              # Container image
│   ├── pyproject.toml          # Python project config
│   └── .env.example
│
├── frontend/                   # React/Vue application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── features/
│   │   │   └── layout/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Agents.jsx
│   │   │   ├── Workflows.jsx
│   │   │   └── Settings.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useFetch.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   └── styles/
│   │       └── theme.css
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js          # Build config
│   ├── .env.example
│   └── Dockerfile
│
├── docs/                       # Project documentation
│   ├── README.md               # Doc index
│   ├── architecture.md         # System architecture
│   ├── api.md                  # API documentation
│   ├── deployment.md           # Deployment guide
│   ├── contributing.md         # Contributing guide
│   └── faq.md                  # FAQ
│

├── config/                     # Configuration files
│   ├── logging.yaml           # Logging configuration
│   ├── example.env            # Example environment
│   └── nginx.conf             # Nginx config (if needed)
│
└── .github/                    # GitHub specific
    ├── workflows/
    │   ├── tests.yml          # CI/CD for tests
    │   └── deploy.yml         # CI/CD for deployment
    └── ISSUE_TEMPLATE/
        └── bug_report.md
```

---

## 2. Technology Stack

### Backend
```
Core Framework:     FastAPI 0.104+
Python Version:     3.10+
Async Driver:       asyncpg (PostgreSQL) or aioodbc (SQL Server)
ORM:                SQLAlchemy 2.0 (async)
Database (Primary): SQL Server OR PostgreSQL
Database (Cache):   MongoDB (optional)
Cache:              Redis
Task Queue:         Celery (optional) or FastAPI background tasks
Authentication:     JWT with FastAPI Security
Validation:         Pydantic v2
Testing:            pytest with pytest-asyncio
Logging:            Python logging + structlog
Monitoring:         Prometheus metrics
```

### Frontend
```
Framework:          React 18+ or Vue 3+
Build Tool:         Vite
State Management:   Zustand or Pinia
HTTP Client:        Axios or Fetch
UI Framework:       Tailwind CSS
Form Handling:      React Hook Form / VeeValidate
Testing:            Vitest + React Testing Library
End-to-End:         Cypress or Playwright
```

### Infrastructure
```
Containerization:   Docker
Orchestration:      Docker Compose (dev) / Kubernetes (prod)
Reverse Proxy:      Nginx
Monitoring:         Prometheus + Grafana
Logging:            ELK Stack or Loki (optional)
Database Backup:    Automated scripts
CI/CD:              GitHub Actions
```

---



---

## 3. Configuration Management

### Environment Variables

```env
# Backend Configuration
DATABASE_URL=postgresql+asyncpg://user:pwd@localhost/anttigravity
MONGODB_URL=mongodb://localhost:27017/anttigravity
REDIS_URL=redis://localhost:6379/0

# JWT Configuration
SECRET_KEY=your-secret-key-here-generate-securely
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# API Configuration
API_V1_PREFIX=/api/v1
API_TITLE=Anttigravity API
API_VERSION=1.0.0

# External APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...

# Environment
DEBUG=false
ENVIRONMENT=production
LOG_LEVEL=INFO
CORS_ORIGINS=https://domain.com

# Optional Features
ENABLE_MONITORING=true
ENABLE_BACKGROUND_TASKS=true
MAX_WORKERS=4
```

### Frontend Configuration

```javascript
// .env files
VITE_API_URL=http://localhost:8000
VITE_API_PREFIX=/api/v1
VITE_ENV=development
VITE_LOG_LEVEL=debug

// Production
VITE_API_URL=https://api.domain.com
VITE_ENV=production
VITE_LOG_LEVEL=warn
```

---

## 4. Database Initialization

### SQL Server Setup

```sql
-- Create database
CREATE DATABASE [anttigravity]
COLLATE SQL_Latin1_General_CP1_CI_AS;

-- Create login
CREATE LOGIN [anttigravity_user] WITH PASSWORD = 'ComplexPassword123!';

-- Create user
USE [anttigravity];
CREATE USER [anttigravity_user] FOR LOGIN [anttigravity_user];

-- Grant permissions
GRANT CONNECT TO [anttigravity_user];
GRANT CREATE TABLE TO [anttigravity_user];
GRANT ALTER ON SCHEMA::[dbo] TO [anttigravity_user];
```

### Run Migrations

```bash
# Generate migration (if using Alembic)
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head

# Verify
alembic current
```

### MongoDB Setup

```bash
# If using Docker
docker run -d -p 27017:27017 --name anttigravity-mongo mongo:latest

# Create database and indexes
mongosh
> use anttigravity
> db.createCollection("users")
> db.users.createIndex({email: 1}, {unique: true})
```



### Run Tests

```bash
# Backend unit tests
cd backend
pytest tests/unit -v --cov

# Backend integration tests
pytest tests/integration -v

# Frontend unit tests
cd ../frontend
npm run test

# E2E tests
npm run test:e2e

# Code coverage report
pytest --cov=app --cov-report=html
```

### Code Quality

```bash
# Backend
pylint app/
black --check app/
isort --check-only app/
mypy app/

# Frontend
npm run lint
npm run format:check
```

---





### Git Branching Strategy

```
main
├── stable, production-ready
├── protection rules enabled
└── deploy from here

develop
├── integration branch
├── feature branches merge here
└── release branches split from here

feature/[feature-name]
├── feature/user-authentication
├── feature/workflow-builder
└── merge to develop via PR

bugfix/[bug-name]
├── bugfix/auth-token-expiry
└── merge to develop via PR

release/v[version]
├── version bumping
├── final testing
└── merge to main & develop
```

### Pull Request Workflow

```
1. Create feature branch from develop
2. Commit changes with clear messages
3. Open PR with description
4. Code review (minimum 1 approval)
5. Run CI/CD checks (all must pass)
6. Merge with "Squash and merge"
7. Delete feature branch
8. Deploy to staging for testing
9. When ready, release to production
```

---




## 7. Versioning & Release

### Version Format: MAJOR.MINOR.PATCH

```
1.0.0
├── MAJOR: Breaking changes
├── MINOR: New features
└── PATCH: Bug fixes

Example:
1.0.0  → Initial release
1.1.0  → Add new feature
1.1.1  → Bug fix
2.0.0  → Major breaking changes
```

### Release Process

```bash
# 1. Update version
vim backend/app/core/config.py  # Update VERSION
vim package.json                 # Update version

# 2. Update CHANGELOG
vim CHANGELOG.md                # Add v1.1.0 section

# 3. Create release commit
git checkout -b release/v1.1.0
git add .
git commit -m "Release v1.1.0"
git push origin release/v1.1.0

# 4. Create PR to main
# 5. Merge after approval
# 6. Tag release
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0

# 7. Create GitHub release with notes
```

---

## 8. Documentation

### Essential Documents

```
README.md               - Project overview, setup
API.md                  - Endpoint documentation
ARCHITECTURE.md         - System design
DEPLOYMENT.md           - Production deployment
CONTRIBUTING.md         - Contribution guidelines
CHANGELOG.md            - Version history
SECURITY.md             - Security guidelines
TROUBLESHOOTING.md      - Common issues & solutions
```

### API Documentation

```
Generated by FastAPI Swagger UI:
- http://localhost:8000/docs (Swagger)
- http://localhost:8000/redoc (ReDoc)
- http://localhost:8000/openapi.json (OpenAPI spec)

Include in docs:
- Endpoint descriptions
- Request/response examples
- Authentication requirements
- Rate limits
- Error codes
```

---



---


