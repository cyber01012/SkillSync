# 🔄 SkillSync AI

> **AI-Driven Skill Exchange & Peer Mentorship Platform**

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask/FastAPI](https://img.shields.io/badge/Backend-Python_API-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Branch](https://img.shields.io/badge/Branch-cyber-ff69b4?style=for-the-badge&logo=git&logoColor=white)
![AI Enabled](https://img.shields.io/badge/AI-Enabled-7400B8?style=for-the-badge)

SkillSync AI is an intelligent peer-to-peer skill matching platform designed to connect learners and mentors, track skill progression, and automate personalized learning journeys through AI recommendation engines.

---

## 📌 Branch Information

> 💡 **Note**: This documentation is crafted based on the **`cyber`** branch implementation (`cyber01012/SkillSync/tree/cyber`), which contains the active full-stack AI engine, database seeds, and backend services.

---

## 🌟 Features

* **🤖 Smart Skill Matching Engine**: Connects users based on complementary skill offers and requests.
* **⚡ Python REST API Backend**: Clean architecture with database seeding, file upload pipeline, and authentication module.
* **🌐 Web Dashboard**: Interactive user interfaces for skill discovery, profile management, and session scheduling.
* **📊 Developer Handoff Documentation**: Complete onboarding instructions and database seed scripts.

---

## 📁 Repository Structure

```
SkillSync/
├── backend/                                  # Python Backend Service
│   ├── app/                                  # API routes, models, services & AI logic
│   ├── seed/                                 # Initial database seed datasets
│   ├── uploads/                              # Storage for user assets & documents
│   ├── .env.example                          # Environment variables template
│   ├── requirements.txt                      # Python dependencies
│   ├── run.py                                # Application entry point
│   └── inst.md                               # Setup instructions
│
├── frontend/                                 # Web UI Frontend Client
├── docs/                                     # System documentation & specs
└── project-tree.txt                          # Comprehensive directory layout
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file from template
copy .env.example .env     # Windows
# cp .env.example .env     # Linux/macOS

# Run the backend server
python run.py
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies and start server
npm install
npm run dev
```

---

## 🧰 Tech Stack

* **Backend**: Python 3.10+, Flask / FastAPI, SQLite / PostgreSQL
* **Frontend**: HTML5, CSS3, JavaScript / React
* **AI & Algorithms**: Natural Language Skill Vectorization & Matching Engine
* **Tooling**: Python Virtual Environment (`venv`), dotenv

---

## 🤝 Contributing & Branching

1. Switch to the `cyber` branch:
   ```bash
   git checkout cyber
   ```
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request into `cyber` or `main`.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
