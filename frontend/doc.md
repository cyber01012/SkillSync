skillsync/
├── README.md                          # Project setup guide for all members
├── docs/
│   └── member-handoff.md              # What each member receives/hands off
│
├── frontend/                          # React + Vite + Tailwind
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   ├── public/
│   │   └── images/
│   │       └── logo.png               # Your SkillSync logo
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css                  # Your existing design system
│       │
│       ├── api/
│       │   ├── auth.js                # API calls: login, register, profile
│       │   ├── baseline.js            # API calls: challenge, submit
│       │   └── dna.js                 # API calls: skill scores, trust score
│       │
│       ├── pages/
│       │   ├── LandingPage.jsx        # ✅ YOU ALREADY HAVE THIS
│       │   ├── LoginPage.jsx          # Login form page
│       │   ├── SignupPage.jsx         # Signup form page
│       │   ├── FreelancerDashboard.jsx
│       │   ├── ClientDashboard.jsx
│       │   └── BaselineChallenge.jsx  # Skill verification task
│       │
│       ├── components/
│       │   ├── authentication/
│       │   │   ├── AuthModal.jsx      # ✅ YOU ALREADY HAVE THIS
│       │   │   ├── AuthLayout.jsx     # ✅ YOU ALREADY HAVE THIS
│       │   │   ├── RoleSelection.jsx  # ✅ YOU ALREADY HAVE THIS
│       │   │   ├── ForgotWindow.jsx   # ✅ YOU ALREADY HAVE THIS
│       │   │   └── form/
│       │   │       ├── LoginForm.jsx  # ✅ YOU ALREADY HAVE THIS
│       │   │       ├── SignupForm.jsx # ✅ YOU ALREADY HAVE THIS
│       │   │       └── PasswordStrength.js # ✅ YOU ALREADY HAVE THIS
│       │   │
│       │   ├── ui/
│       │   │   └── SmartInput.jsx     # ✅ YOU ALREADY HAVE THIS
│       │   │
│       │   ├── common/
│       │   │   ├── Navbar.jsx         # ✅ YOU ALREADY HAVE THIS
│       │   │   ├── Footer.jsx         # ✅ YOU ALREADY HAVE THIS
│       │   │   ├── Button.jsx         # ✅ YOU ALREADY HAVE THIS
│       │   │   └── ScrollToTop.jsx    # ✅ YOU ALREADY HAVE THIS
│       │   │
│       │   ├── landing/               # ✅ ALL YOUR LANDING COMPONENTS
│       │   │   ├── Infographic.jsx
│       │   │   ├── Guide.jsx
│       │   │   ├── Features.jsx
│       │   │   ├── FAQ.jsx
│       │   │   ├── Reviews.jsx
│       │   │   ├── CTA.jsx
│       │   │   ├── RightAnimation.jsx
│       │   │   ├── AvatarCircles.jsx
│       │   │   └── TrustScoreAnimation.jsx
│       │   │
│       │   ├── dashboard/
│       │   │   ├── SkillDNACard.jsx   # Visual bar chart for DNA
│       │   │   ├── TrustScoreRing.jsx # Circular trust score display
│       │   │   └── DNATimeline.jsx    # Historical DNA growth
│       │   │
│       │   ├── animation/
│       │   │   └── ScrollAnimationWrapper.jsx # ✅ YOU ALREADY HAVE THIS
│       │   │
│       │   └── design/
│       │       └── GradientText.jsx   # ✅ YOU ALREADY HAVE THIS
│       │
│       └── utils/
│           └── constants.js
│
├── backend/                           # FastAPI + SQL Server + MongoDB
│   ├── requirements.txt
│   ├── .env.example
│   ├── run.py                         # `python run.py` starts server
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI entry + all routers
│   │   ├── models.py                  # SQLAlchemy ORM (all 15 tables)
│   │   ├── schemas.py                 # Pydantic request/response models
│   │   ├── dependencies.py            # JWT auth dependency
│   │   │
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py              # Settings (DB URLs, JWT secret)
│   │   │   ├── database.py            # SQLAlchemy engine + PyMongo client
│   │   │   └── security.py            # bcrypt + JWT encode/decode
│   │   │
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                # Register, Login, Me, Profile
│   │   │   ├── baseline.py            # Challenge get/submit/results
│   │   │   └── dna.py                 # Skill scores, trust score, snapshots
│   │   │
│   │   └── agents/
│   │       ├── __init__.py
│   │       └── skill_dna_agent.py     # MEMBER 1'S AGENT
│   │
│   └── seed/
│       ├── __init__.py
│       ├── seed_sqlserver.py          # DDL + DML + Views + Procedures + Triggers
│       ├── seed_mongodb.py            # Collections + Indexes + Sample docs
│       └── seed_all.py                # One command: python seed_all.py
│
└── .gitignore