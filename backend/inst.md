# 1. Open terminal, go to backend folder
cd skillsync/backend

# 2. Create virtual environment (first time only)
python -m venv venv

# 3. Activate virtual environment
venv\Scripts\activate        # Windows


# 4. Install dependencies
pip install -r requirements.txt

# 5. Create .env file (paste your values)
# Use Notepad/VS Code: backend/.env

# 6. Seed databases (first time only, or when schema changes)
cd seed
python seed_all.py

# 7. Start backend server
cd ..
python run.py


# usual run
cd skillsync/backend
venv\Scripts\activate
python run.py