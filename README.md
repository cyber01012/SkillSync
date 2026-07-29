# 🔄 SkillSync AI — Dual-Database Freelance Platform & Skill DNA Engine
<img width="1366" height="681" alt="image" src="https://github.com/user-attachments/assets/5a3d9491-40f2-4e6c-9d94-5d7667cc2e22" />

> **Database Systems Project featuring Hybrid Relational & Document Data Architecture (SQL Server & MongoDB) with SkillScore Calculation Engine**

![SQL Server](https://img.shields.io/badge/Microsoft%20SQL%20Server-CC292B?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Skill DNA Engine](https://img.shields.io/badge/Skill%20DNA-SkillScore%20Algorithms-7400B8?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Branch](https://img.shields.io/badge/Branch-cyber-ff69b4?style=for-the-badge&logo=git&logoColor=white)

SkillSync AI is a database-driven **Freelance Platform & Skill DNA Analytics Engine**. Rather than relying on static portfolio uploads, SkillSync dynamically constructs a **Freelancer Skill DNA** profile through algorithmic **SkillScore** calculations, proficiency weighting, and dynamic assessment logs.

---

## 🧬 Freelancer Skill DNA & SkillScore Engine

* **📊 Algorithmic SkillScore**: Calculates dynamic competency ratings based on assessment results, task execution speed, and peer evaluations.
* **🧬 Dynamic Skill DNA**: Synthesizes multi-dimensional skill vectors (technical depth, consistency, problem-solving score) into a living JSON document profile.
* **🎯 Precise Job Matching**: Queries Skill DNA vectors against client job requirements to find the highest-scoring freelancers automatically.

---

## 💾 Dual-Database Architecture (SQL Server + MongoDB)

| Database System | Data Domain & Architectural Role | Storage Highlights |
| :--- | :--- | :--- |
| **Microsoft SQL Server** | **Relational Data & Transactions** | Manages ACID-compliant transactions, client & freelancer user accounts, financial contracts, milestone payments, and relational integrity with T-SQL procedures & foreign keys. |
| **MongoDB** | **Skill DNA & SkillScore Document Store** | Stores complex, schema-less Freelancer Skill DNA documents, JSON SkillScore breakdown vectors, assessment logs, and dynamic competency matrices for rapid NoSQL querying. |

---

## 📌 Branch Information

> 💡 **Note**: This documentation is based on the **`cyber`** branch implementation (`cyber01012/SkillSync/tree/cyber`), containing the active database models, SQL/NoSQL connection drivers, seed benchmarks, and SkillScore calculation scripts.

---

## 📁 Repository Structure

```
SkillSync/
├── backend/                                  # Python Backend & Skill Engine
│   ├── app/                                  # SkillScore algorithms, Skill DNA models, SQL/Mongo drivers
│   ├── seed/                                 # Initial database seeds (SkillScore benchmarks, test gigs)
│   ├── .env.example                          # SQL Server & MongoDB connection variables
│   ├── requirements.txt                      # Dependencies (pyodbc, pymongo, etc.)
│   ├── run.py                                # API server entry point
│   └── inst.md                               # Setup instructions
│
├── frontend/                                 # Client & Freelancer Portal
├── docs/                                     # Skill DNA algorithms, ER diagrams, MongoDB schema design
└── project-tree.txt                          # Project structure reference
```

---

## 🚀 Quick Start Guide

### 1. Database Configuration

Set **Microsoft SQL Server** and **MongoDB** credentials in `backend/.env`:

```env
SQL_SERVER_HOST=localhost
SQL_SERVER_DB=SkillSyncDB
SQL_SERVER_USER=sa
SQL_SERVER_PASSWORD=YourPassword

MONGODB_URI=mongodb://localhost:27017/skillsync_docs
```

### 2. Backend & Skill Engine Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
# source venv/bin/activate

pip install -r requirements.txt

# Run seed scripts to generate SkillScore benchmarks & DB tables
python seed/seed_databases.py

python run.py
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🧰 Tech Stack

* **Databases**: Microsoft SQL Server (Relational RDBMS), MongoDB (NoSQL Document Store)
* **Algorithms**: Freelancer Skill DNA Synthesis & SkillScore Calculation Engine
* **Backend**: Python 3.10+, PyODBC, PyMongo, Flask / FastAPI
* **Frontend**: HTML5, CSS3, JavaScript / React

IMAGES
<img width="1366" height="681" alt="image" src="https://github.com/user-attachments/assets/df8cd81f-32e3-4a7b-b77d-c83089c9fc19" />
<img width="1366" height="660" alt="image" src="https://github.com/user-attachments/assets/4707e8a3-52c6-4134-a39a-a411a45fd64a" />
<img width="1366" height="636" alt="image" src="https://github.com/user-attachments/assets/d7403c0c-71ad-484d-91c2-07eadfedaeb4" />

---

