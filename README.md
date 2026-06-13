# SkillSync AI — Member 1 Handoff

## Quick Start

### 1. Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Copy env file and update credentials
copy .env.example .env
# Edit .env with your SQL Server & MongoDB credentials

# Seed databases
cd seed
python seed_all.py

# Start server
cd ..
python run.py