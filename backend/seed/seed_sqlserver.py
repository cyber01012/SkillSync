"""SQL Server Seed Script — Fixed Version."""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import bcrypt
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.config import get_settings

settings = get_settings()


def get_engine():
    return create_engine(
        settings.sql_server_connection_string,
        echo=False,
        pool_pre_ping=True,
    )


def run_ddl():
    print("\n" + "="*60)
    print("PHASE 1: DDL (Data Definition Language)")
    print("="*60)

    ddl = """
    DROP TABLE IF EXISTS ScoreHistory;
    DROP TABLE IF EXISTS ScoreComponents;
    DROP TABLE IF EXISTS TrustScores;
    DROP TABLE IF EXISTS PaymentEvents;
    DROP TABLE IF EXISTS DisputeRecords;
    DROP TABLE IF EXISTS Milestones;
    DROP TABLE IF EXISTS Contracts;
    DROP TABLE IF EXISTS Applications;
    DROP TABLE IF EXISTS JobPosts;
    DROP TABLE IF EXISTS ChallengeResults;
    DROP TABLE IF EXISTS DNASnapshots;
    DROP TABLE IF EXISTS SkillScores;
    DROP TABLE IF EXISTS ReviewNetworks;
    DROP TABLE IF EXISTS FlaggedAccounts;
    DROP TABLE IF EXISTS DeviceFingerprints;
    DROP TABLE IF EXISTS RefreshTokens;
    DROP TABLE IF EXISTS BlacklistedTokens;
    DROP TABLE IF EXISTS PasswordResetTokens;
    DROP TABLE IF EXISTS FreelancerProfiles;
    DROP TABLE IF EXISTS ClientProfiles;
    DROP TABLE IF EXISTS Categories;
    DROP TABLE IF EXISTS Users;

    CREATE TABLE Users (
        UserID INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(50) UNIQUE NOT NULL,
        Email NVARCHAR(255) UNIQUE NOT NULL,
        PasswordHash NVARCHAR(255) NOT NULL,
        Role NVARCHAR(20) NOT NULL CHECK (Role IN ('freelancer', 'client')),
        CreatedAt DATETIME DEFAULT GETDATE(),
        IsVerified BIT DEFAULT 0
    );

    CREATE TABLE RefreshTokens (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
        Token NVARCHAR(512) UNIQUE NOT NULL,
        ExpiresAt DATETIME NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        IsRevoked BIT DEFAULT 0
    );

    CREATE TABLE BlacklistedTokens (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        Token NVARCHAR(512) UNIQUE NOT NULL,
        BlacklistedAt DATETIME DEFAULT GETDATE()
    );

    CREATE TABLE PasswordResetTokens (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
        Token NVARCHAR(512) UNIQUE NOT NULL,
        ExpiresAt DATETIME NOT NULL,
        IsUsed BIT DEFAULT 0,
        CreatedAt DATETIME DEFAULT GETDATE()
    );

    CREATE TABLE Categories (
        CategoryID INT IDENTITY(1,1) PRIMARY KEY,
        Domain NVARCHAR(50) NOT NULL,
        Specialty NVARCHAR(50) NOT NULL,
        DisplayName NVARCHAR(100) NOT NULL,
        DNAProfileJSON NVARCHAR(MAX) NOT NULL,
        IsActive BIT DEFAULT 1
    );

    CREATE TABLE FreelancerProfiles (
        FreelancerID INT PRIMARY KEY FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
        DisplayName NVARCHAR(100),
        Headline NVARCHAR(255),
        Category NVARCHAR(50),
        CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID),
        HasBaselineDNA BIT DEFAULT 0,
        Bio NVARCHAR(500),
        ProfilePhotoURL NVARCHAR(500),
        AvailabilityStatus NVARCHAR(20) DEFAULT 'available'
    );

    CREATE TABLE ClientProfiles (
        ClientID INT PRIMARY KEY FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
        CompanyName NVARCHAR(100),
        IndustryID INT,
        IsVerified BIT DEFAULT 0,
        TrustLevel NVARCHAR(20) DEFAULT 'standard'
    );

    CREATE TABLE SkillScores (
        ScoreID INT IDENTITY(1,1) PRIMARY KEY,
        FreelancerID INT FOREIGN KEY REFERENCES FreelancerProfiles(FreelancerID),
        TraitName NVARCHAR(50),
        Score INT DEFAULT 50 CHECK (Score BETWEEN 0 AND 100),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );

    CREATE TABLE DNASnapshots (
        SnapshotID INT IDENTITY(1,1) PRIMARY KEY,
        FreelancerID INT FOREIGN KEY REFERENCES FreelancerProfiles(FreelancerID),
        SnapshotData NVARCHAR(MAX),
        TakenAt DATETIME DEFAULT GETDATE()
    );

    CREATE TABLE ChallengeResults (
        ResultID INT IDENTITY(1,1) PRIMARY KEY,
        FreelancerID INT FOREIGN KEY REFERENCES FreelancerProfiles(FreelancerID),
        ChallengeID NVARCHAR(50),
        Score INT,
        TimeTaken INT,
        CompletedAt DATETIME DEFAULT GETDATE()
    );

    CREATE TABLE JobPosts (
        JobID INT IDENTITY(1,1) PRIMARY KEY,
        ClientID INT FOREIGN KEY REFERENCES ClientProfiles(ClientID),
        Title NVARCHAR(200) NOT NULL,
        RequiredTrustScore INT DEFAULT 0,
        MinSkillLevel NVARCHAR(20) DEFAULT 'beginner',
        Status NVARCHAR(20) DEFAULT 'open',
        CreatedAt DATETIME DEFAULT GETDATE()
    );

    CREATE TABLE Applications (
        ApplicationID INT IDENTITY(1,1) PRIMARY KEY,
        JobID INT FOREIGN KEY REFERENCES JobPosts(JobID),
        FreelancerID INT FOREIGN KEY REFERENCES FreelancerProfiles(FreelancerID),
        CoverNote NVARCHAR(MAX),
        Status NVARCHAR(20) DEFAULT 'pending',
        AppliedAt DATETIME DEFAULT GETDATE()
    );

    CREATE TABLE Contracts (
        ContractID INT IDENTITY(1,1) PRIMARY KEY,
        JobID INT FOREIGN KEY REFERENCES JobPosts(JobID),
        FreelancerID INT FOREIGN KEY REFERENCES FreelancerProfiles(FreelancerID),
        ClientID INT FOREIGN KEY REFERENCES ClientProfiles(ClientID),
        TotalAmount FLOAT DEFAULT 0.0,
        Status NVARCHAR(20) DEFAULT 'active'
    );

    CREATE TABLE Milestones (
        MilestoneID INT IDENTITY(1,1) PRIMARY KEY,
        ContractID INT FOREIGN KEY REFERENCES Contracts(ContractID),
        Title NVARCHAR(200),
        Amount FLOAT DEFAULT 0.0,
        DueDate DATETIME,
        Status NVARCHAR(20) DEFAULT 'pending',
        ApprovedAt DATETIME
    );

    CREATE TABLE TrustScores (
        TrustID INT IDENTITY(1,1) PRIMARY KEY,
        FreelancerID INT UNIQUE FOREIGN KEY REFERENCES FreelancerProfiles(FreelancerID),
        OverallScore FLOAT DEFAULT 50.0,
        LastCalculatedAt DATETIME DEFAULT GETDATE()
    );

    CREATE TABLE ScoreComponents (
        ComponentID INT IDENTITY(1,1) PRIMARY KEY,
        FreelancerID INT FOREIGN KEY REFERENCES FreelancerProfiles(FreelancerID),
        FactorName NVARCHAR(50),
        Weight FLOAT DEFAULT 0.2,
        Value FLOAT DEFAULT 50.0,
        UpdatedAt DATETIME DEFAULT GETDATE()
    );

    CREATE TABLE ScoreHistory (
        HistoryID INT IDENTITY(1,1) PRIMARY KEY,
        FreelancerID INT FOREIGN KEY REFERENCES FreelancerProfiles(FreelancerID),
        OldScore FLOAT,
        NewScore FLOAT,
        ChangedAt DATETIME DEFAULT GETDATE(),
        Reason NVARCHAR(255)
    );

    CREATE TABLE PaymentEvents (
        EventID INT IDENTITY(1,1) PRIMARY KEY,
        ContractID INT FOREIGN KEY REFERENCES Contracts(ContractID),
        Amount FLOAT,
        EventType NVARCHAR(50),
        ProcessedAt DATETIME DEFAULT GETDATE(),
        EscrowBalance FLOAT DEFAULT 0.0
    );

    CREATE TABLE DisputeRecords (
        DisputeID INT IDENTITY(1,1) PRIMARY KEY,
        ContractID INT FOREIGN KEY REFERENCES Contracts(ContractID),
        RaisedBy INT FOREIGN KEY REFERENCES Users(UserID),
        Description NVARCHAR(MAX),
        Status NVARCHAR(20) DEFAULT 'open',
        ResolvedAt DATETIME
    );

    CREATE TABLE FlaggedAccounts (
        FlagID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT FOREIGN KEY REFERENCES Users(UserID),
        FlagType NVARCHAR(50),
        Severity NVARCHAR(20) DEFAULT 'low',
        DetectedAt DATETIME DEFAULT GETDATE(),
        Status NVARCHAR(20) DEFAULT 'pending'
    );

    CREATE TABLE DeviceFingerprints (
        FingerprintID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT FOREIGN KEY REFERENCES Users(UserID),
        FingerprintHash NVARCHAR(255),
        IPAddress NVARCHAR(50),
        LastSeenAt DATETIME DEFAULT GETDATE()
    );

    CREATE TABLE ReviewNetworks (
        NetworkID INT IDENTITY(1,1) PRIMARY KEY,
        ReviewerID INT FOREIGN KEY REFERENCES Users(UserID),
        RevieweeID INT FOREIGN KEY REFERENCES Users(UserID),
        SuspicionScore FLOAT DEFAULT 0.0,
        AnalyzedAt DATETIME DEFAULT GETDATE()
    );
    """

    engine = get_engine()
    with engine.begin() as conn:
        conn.execute(text(ddl))

    print("✅ DDL Complete — All 15+ tables created")


def run_dml():
    print("\n" + "="*60)
    print("PHASE 2: DML + TCL")
    print("="*60)

    engine = get_engine()

    def hash_pw(pw):
        return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

    dml = """
    BEGIN TRANSACTION;

    -- 1. Users (10 users: 1 admin, 4 clients, 5 freelancers)
    INSERT INTO Users (Username, Email, PasswordHash, Role, IsVerified) VALUES
    ('admin', 'admin@skillsync.ai', :admin_pw, 'freelancer', 1),
    ('client1', 'client1@techcorp.com', :client1_pw, 'client', 1),
    ('client2', 'client2@designstudio.com', :client2_pw, 'client', 1),
    ('client3', 'client3@startup.io', :client3_pw, 'client', 1),
    ('client4', 'client4@enterprise.com', :client4_pw, 'client', 1),
    ('freelancer1', 'freelancer1@gmail.com', :f1_pw, 'freelancer', 1),
    ('freelancer2', 'freelancer2@outlook.com', :f2_pw, 'freelancer', 1),
    ('freelancer3', 'freelancer3@yahoo.com', :f3_pw, 'freelancer', 1),
    ('freelancer4', 'freelancer4@proton.me', :f4_pw, 'freelancer', 1),
    ('freelancer5', 'freelancer5@icloud.com', :f5_pw, 'freelancer', 1);

    -- 2. Categories (8 categories with IDs 1-8)
    INSERT INTO Categories (Domain, Specialty, DisplayName, DNAProfileJSON, IsActive) VALUES
    ('frontend', 'react', 'React Frontend Developer', :dna_react, 1),
    ('frontend', 'vue', 'Vue Frontend Developer', :dna_vue, 1),
    ('frontend', 'css', 'CSS/Tailwind Developer', :dna_css, 1),
    ('backend', 'python', 'Python Backend Developer', :dna_python, 1),
    ('backend', 'java', 'Java Backend Developer', :dna_java, 1),
    ('backend', 'nodejs', 'Node.js Backend Developer', :dna_nodejs, 1),
    ('fullstack', 'mern', 'MERN Stack Developer', :dna_mern, 1),
    ('fullstack', 'python_react', 'Python + React Developer', :dna_python_react, 1);

    -- 3. FreelancerProfiles (UserIDs 1,6,7,8,9,10 — matching Categories 1-8)
    INSERT INTO FreelancerProfiles (FreelancerID, DisplayName, Headline, Category, CategoryID, HasBaselineDNA, Bio, AvailabilityStatus) VALUES
    (1, 'System Admin', 'Platform Administrator', 'System', NULL, 0, 'Platform administrator with full system access', 'busy'),
    (6, 'Ali Khan', 'Full-Stack Developer | React & Python Expert', 'python_react', 8, 1, '5+ years building scalable web apps with React and Python. Expert in FastAPI, PostgreSQL, and cloud deployment.', 'available'),
    (7, 'Sara Ahmed', 'UI/UX Designer & Brand Strategist', 'react', 1, 1, 'Creative designer with 4+ years experience in brand identity, UI/UX, and design systems. Figma expert.', 'available'),
    (8, 'Omar Farooq', 'Data Scientist & ML Engineer', 'python', 4, 1, 'Machine learning specialist with expertise in NLP, computer vision, and predictive analytics. Python & TensorFlow.', 'available'),
    (9, 'Zainab Khan', 'React Native & Mobile Developer', 'react', 1, 1, 'Mobile app developer specializing in React Native, Flutter, and iOS/Android native development.', 'available'),
    (10, 'Bilal Hassan', 'Backend Architect & DevOps', 'nodejs', 6, 1, 'Cloud infrastructure expert with AWS, Docker, Kubernetes, and CI/CD pipeline experience.', 'available');

    -- 4. ClientProfiles (UserIDs 2,3,4,5)
    INSERT INTO ClientProfiles (ClientID, CompanyName, IndustryID, IsVerified, TrustLevel) VALUES
    (2, 'TechCorp Solutions', 1, 1, 'premium'),
    (3, 'Design Studio Pro', 2, 1, 'standard'),
    (4, 'Startup Innovators', 3, 1, 'premium'),
    (5, 'Enterprise Global', 4, 1, 'standard');

    -- 5. SkillScores (6 freelancers x 6 traits = 36 rows)
    INSERT INTO SkillScores (FreelancerID, TraitName, Score) VALUES
    (6, 'Reliability', 78), (6, 'Creativity', 65), (6, 'Teamwork', 82), (6, 'Communication', 70), (6, 'Deadline Adherence', 85), (6, 'Technical Accuracy', 88),
    (7, 'Reliability', 85), (7, 'Creativity', 92), (7, 'Teamwork', 75), (7, 'Communication', 80), (7, 'Deadline Adherence', 78), (7, 'Technical Accuracy', 70),
    (8, 'Reliability', 72), (8, 'Creativity', 80), (8, 'Teamwork', 68), (8, 'Communication', 75), (8, 'Deadline Adherence', 70), (8, 'Technical Accuracy', 95),
    (9, 'Reliability', 88), (9, 'Creativity', 75), (9, 'Teamwork', 82), (9, 'Communication', 85), (9, 'Deadline Adherence', 90), (9, 'Technical Accuracy', 78),
    (10, 'Reliability', 80), (10, 'Creativity', 70), (10, 'Teamwork', 85), (10, 'Communication', 72), (10, 'Deadline Adherence', 88), (10, 'Technical Accuracy', 92);

    -- 6. TrustScores (5 freelancers)
    INSERT INTO TrustScores (FreelancerID, OverallScore) VALUES
    (6, 76.5), (7, 80.0), (8, 78.3), (9, 82.0), (10, 81.2);

    -- 7. ScoreComponents (5 freelancers x 5 factors = 25 rows)
    INSERT INTO ScoreComponents (FreelancerID, FactorName, Weight, Value) VALUES
    (6, 'Delivery Consistency', 0.25, 80.0), (6, 'Client Retention', 0.20, 75.0), (6, 'Communication', 0.20, 70.0), (6, 'Dispute History', 0.15, 90.0), (6, 'Challenge Performance', 0.20, 78.0),
    (7, 'Delivery Consistency', 0.25, 85.0), (7, 'Client Retention', 0.20, 82.0), (7, 'Communication', 0.20, 80.0), (7, 'Dispute History', 0.15, 95.0), (7, 'Challenge Performance', 0.20, 75.0),
    (8, 'Delivery Consistency', 0.25, 70.0), (8, 'Client Retention', 0.20, 78.0), (8, 'Communication', 0.20, 75.0), (8, 'Dispute History', 0.15, 85.0), (8, 'Challenge Performance', 0.20, 92.0),
    (9, 'Delivery Consistency', 0.25, 88.0), (9, 'Client Retention', 0.20, 85.0), (9, 'Communication', 0.20, 88.0), (9, 'Dispute History', 0.15, 92.0), (9, 'Challenge Performance', 0.20, 82.0),
    (10, 'Delivery Consistency', 0.25, 82.0), (10, 'Client Retention', 0.20, 80.0), (10, 'Communication', 0.20, 75.0), (10, 'Dispute History', 0.15, 88.0), (10, 'Challenge Performance', 0.20, 90.0);

    -- 8. JobPosts (8 jobs from 4 clients)
    INSERT INTO JobPosts (ClientID, Title, RequiredTrustScore, MinSkillLevel, Status) VALUES
    (2, 'Build E-Commerce Dashboard', 70, 'intermediate', 'open'),
    (2, 'AI Chatbot Integration', 80, 'expert', 'open'),
    (3, 'Brand Identity Design', 60, 'beginner', 'open'),
    (3, 'Mobile App UI/UX', 75, 'intermediate', 'open'),
    (4, 'SaaS Platform Backend', 85, 'expert', 'open'),
    (4, 'API Gateway Development', 70, 'intermediate', 'open'),
    (5, 'Enterprise CRM System', 75, 'intermediate', 'open'),
    (5, 'DevOps Pipeline Setup', 80, 'expert', 'closed');

    -- 9. ChallengeResults (5 freelancers x 2 challenges = 10 rows)
    INSERT INTO ChallengeResults (FreelancerID, ChallengeID, Score, TimeTaken) VALUES
    (6, 'BL-PY-001', 85, 720), (6, 'BL-PY-002', 78, 540),
    (7, 'BL-RT-001', 92, 600), (7, 'BL-RT-002', 88, 480),
    (8, 'BL-PY-001', 95, 450), (8, 'BL-PY-002', 90, 510),
    (9, 'BL-RT-001', 88, 520), (9, 'BL-RT-002', 85, 490),
    (10, 'BL-NJ-001', 90, 480), (10, 'BL-NJ-002', 87, 510);

    -- 10. DNASnapshots (5 freelancers with DNA data)
    INSERT INTO DNASnapshots (FreelancerID, SnapshotData, TakenAt) VALUES
    (6, '{"overall": 78.0, "technical": 85, "creativity": 65, "reliability": 82, "performance": 75, "speed": 70, "deadline": 85}', GETDATE()),
    (7, '{"overall": 82.0, "technical": 70, "creativity": 92, "reliability": 85, "performance": 78, "speed": 80, "deadline": 78}', GETDATE()),
    (8, '{"overall": 80.0, "technical": 95, "creativity": 80, "reliability": 72, "performance": 88, "speed": 75, "deadline": 70}', GETDATE()),
    (9, '{"overall": 84.0, "technical": 78, "creativity": 75, "reliability": 88, "performance": 85, "speed": 88, "deadline": 90}', GETDATE()),
    (10, '{"overall": 83.0, "technical": 92, "creativity": 70, "reliability": 80, "performance": 82, "speed": 85, "deadline": 88}', GETDATE());

    -- 11. Contracts (6 contracts: 3 active, 2 completed, 1 disputed)
    INSERT INTO Contracts (JobID, FreelancerID, ClientID, TotalAmount, Status) VALUES
    (1, 6, 2, 5000.0, 'active'),
    (2, 8, 2, 8000.0, 'active'),
    (3, 7, 3, 3000.0, 'completed'),
    (4, 9, 3, 4500.0, 'active'),
    (5, 10, 4, 12000.0, 'completed'),
    (6, 6, 4, 6000.0, 'disputed');

    -- 12. Milestones (18 milestones across 6 contracts)
    INSERT INTO Milestones (ContractID, Title, Amount, DueDate, Status, ApprovedAt) VALUES
    (1, 'Project Setup & Architecture', 1000.0, '2026-06-20', 'approved', GETDATE()),
    (1, 'Frontend Development', 2000.0, '2026-06-30', 'pending', NULL),
    (1, 'Backend API Development', 1500.0, '2026-07-10', 'pending', NULL),
    (1, 'Testing & Deployment', 500.0, '2026-07-15', 'pending', NULL),
    (2, 'API Integration Setup', 2000.0, '2026-07-01', 'approved', GETDATE()),
    (2, 'Chatbot Logic Implementation', 3000.0, '2026-07-15', 'pending', NULL),
    (2, 'Testing & Documentation', 3000.0, '2026-07-30', 'pending', NULL),
    (3, 'Logo Design', 1000.0, '2026-05-15', 'approved', GETDATE()),
    (3, 'Brand Guidelines', 1000.0, '2026-05-20', 'approved', GETDATE()),
    (3, 'Final Delivery', 1000.0, '2026-05-25', 'approved', GETDATE()),
    (4, 'Wireframes & Prototypes', 1500.0, '2026-06-25', 'approved', GETDATE()),
    (4, 'UI Design System', 1500.0, '2026-07-05', 'pending', NULL),
    (4, 'User Testing', 1500.0, '2026-07-15', 'pending', NULL),
    (5, 'Database Schema Design', 3000.0, '2026-05-10', 'approved', GETDATE()),
    (5, 'API Development', 4000.0, '2026-05-20', 'approved', GETDATE()),
    (5, 'Integration & Testing', 3000.0, '2026-05-30', 'approved', GETDATE()),
    (6, 'Gateway Architecture', 2000.0, '2026-06-15', 'approved', GETDATE()),
    (6, 'Rate Limiting Implementation', 2000.0, '2026-06-25', 'pending', NULL),
    (6, 'Security Audit', 2000.0, '2026-07-05', 'pending', NULL);

    -- 13. PaymentEvents (12 payment events)
    INSERT INTO PaymentEvents (ContractID, Amount, EventType, EscrowBalance) VALUES
    (1, 5000.0, 'escrow_deposit', 5000.0),
    (1, 1000.0, 'payment_released', 4000.0),
    (2, 8000.0, 'escrow_deposit', 8000.0),
    (2, 2000.0, 'payment_released', 6000.0),
    (3, 3000.0, 'escrow_deposit', 3000.0),
    (3, 1000.0, 'payment_released', 2000.0),
    (3, 1000.0, 'payment_released', 1000.0),
    (3, 1000.0, 'payment_released', 0.0),
    (4, 4500.0, 'escrow_deposit', 4500.0),
    (4, 1500.0, 'payment_released', 3000.0),
    (5, 12000.0, 'escrow_deposit', 12000.0),
    (5, 3000.0, 'payment_released', 9000.0),
    (5, 4000.0, 'payment_released', 5000.0),
    (5, 3000.0, 'payment_released', 2000.0),
    (5, 2000.0, 'payment_released', 0.0),
    (6, 6000.0, 'escrow_deposit', 6000.0),
    (6, 2000.0, 'payment_released', 4000.0);

    -- 14. DisputeRecords (1 dispute)
    INSERT INTO DisputeRecords (ContractID, RaisedBy, Description, Status) VALUES
    (6, 6, 'Client requested additional features not in original scope. Milestone 2 scope creep beyond agreed terms.', 'open');

    -- 15. Applications (15 applications: 5 accepted, 5 pending, 5 rejected)
    INSERT INTO Applications (JobID, FreelancerID, CoverNote, Status) VALUES
    (1, 6, 'I have 5 years of experience with React and FastAPI. Built similar dashboards for 3 clients.', 'accepted'),
    (2, 8, 'Expert in Python AI integrations and chatbot development. Worked with OpenAI and Claude APIs.', 'accepted'),
    (3, 7, 'Creative designer with strong portfolio in brand identity. 50+ brand projects completed.', 'accepted'),
    (4, 9, 'Mobile app developer with 20+ published apps. Expert in React Native and Flutter.', 'accepted'),
    (5, 10, 'Backend architect with 8 years experience. Built systems handling 1M+ requests/day.', 'accepted'),
    (1, 7, 'I can design the UI/UX for this dashboard while also handling frontend development.', 'pending'),
    (2, 6, 'Full-stack developer with AI experience. Can integrate chatbot with existing systems.', 'pending'),
    (4, 8, 'Data scientist with UI/UX skills. Can create data-driven mobile interfaces.', 'pending'),
    (6, 9, 'React developer with API experience. Can build gateway interfaces.', 'pending'),
    (7, 10, 'DevOps expert with backend skills. Can build CRM backend and deployment pipeline.', 'pending'),
    (1, 8, 'ML engineer applying for frontend role. Not a good fit for this project.', 'rejected'),
    (2, 7, 'Designer applying for AI role. Skills do not match requirements.', 'rejected'),
    (3, 10, 'Backend developer applying for design role. Not suitable for brand identity work.', 'rejected'),
    (4, 6, 'Full-stack developer but no mobile experience. Cannot take this project.', 'rejected'),
    (5, 7, 'Designer applying for backend role. Technical skills insufficient.', 'rejected');

    -- 16. FlaggedAccounts (2 flagged accounts)
    INSERT INTO FlaggedAccounts (UserID, FlagType, Severity, DetectedAt, Status) VALUES
    (8, 'suspicious_activity', 'medium', GETDATE(), 'pending'),
    (10, 'multiple_accounts', 'low', GETDATE(), 'resolved');

    COMMIT;
    """

    with engine.begin() as conn:
        conn.execute(text(dml), {
            "admin_pw": hash_pw("admin123"),
            "client1_pw": hash_pw("client123"),
            "client2_pw": hash_pw("client123"),
            "client3_pw": hash_pw("client123"),
            "client4_pw": hash_pw("client123"),
            "f1_pw": hash_pw("freelancer123"),
            "f2_pw": hash_pw("freelancer123"),
            "f3_pw": hash_pw("freelancer123"),
            "f4_pw": hash_pw("freelancer123"),
            "f5_pw": hash_pw("freelancer123"),
            "dna_react": '{"traits":["technical","creativity","reliability","performance","speed","deadline"],"weights":[0.25,0.25,0.20,0.15,0.05,0.10],"labels":{"technical":"Technical Accuracy","creativity":"Creativity","reliability":"Reliability","performance":"Performance","speed":"Speed","deadline":"Deadline"}}',
            "dna_vue": '{"traits":["technical","creativity","reliability","performance","speed","deadline"],"weights":[0.25,0.25,0.20,0.15,0.05,0.10],"labels":{"technical":"Technical Accuracy","creativity":"Creativity","reliability":"Reliability","performance":"Performance","speed":"Speed","deadline":"Deadline"}}',
            "dna_css": '{"traits":["technical","creativity","reliability","performance","speed","deadline"],"weights":[0.25,0.30,0.10,0.20,0.05,0.10],"labels":{"technical":"Technical Accuracy","creativity":"Creativity","reliability":"Reliability","performance":"Performance","speed":"Speed","deadline":"Deadline"}}',
            "dna_python": '{"traits":["technical","creativity","reliability","performance","speed","deadline"],"weights":[0.30,0.10,0.25,0.10,0.15,0.10],"labels":{"technical":"Technical Accuracy","creativity":"Creativity","reliability":"Reliability","performance":"Performance","speed":"Speed","deadline":"Deadline"}}',
            "dna_java": '{"traits":["technical","creativity","reliability","performance","speed","deadline"],"weights":[0.30,0.10,0.25,0.10,0.15,0.10],"labels":{"technical":"Technical Accuracy","creativity":"Creativity","reliability":"Reliability","performance":"Performance","speed":"Speed","deadline":"Deadline"}}',
            "dna_nodejs": '{"traits":["technical","creativity","reliability","performance","speed","deadline"],"weights":[0.30,0.10,0.25,0.10,0.15,0.10],"labels":{"technical":"Technical Accuracy","creativity":"Creativity","reliability":"Reliability","performance":"Performance","speed":"Speed","deadline":"Deadline"}}',
            "dna_mern": '{"traits":["technical","creativity","reliability","performance","speed","deadline"],"weights":[0.28,0.18,0.22,0.12,0.10,0.10],"labels":{"technical":"Technical Accuracy","creativity":"Creativity","reliability":"Reliability","performance":"Performance","speed":"Speed","deadline":"Deadline"}}',
            "dna_python_react": '{"traits":["technical","creativity","reliability","performance","speed","deadline"],"weights":[0.28,0.18,0.22,0.12,0.10,0.10],"labels":{"technical":"Technical Accuracy","creativity":"Creativity","reliability":"Reliability","performance":"Performance","speed":"Speed","deadline":"Deadline"}}',
        })

    print("✅ DML + TCL Complete — 10 users, 8 categories, 6 freelancers, 4 clients, 8 jobs, 6 contracts, 18 milestones, 17 payments, 15 applications, 2 disputes, 2 flagged accounts")


def create_views():
    print("\n" + "="*60)
    print("PHASE 3: Views")
    print("="*60)

    engine = get_engine()

    views = [
        """
        CREATE VIEW vw_freelancer_summary AS
        SELECT 
            u.UserID, u.Username, u.Email, fp.DisplayName, fp.Headline, fp.Category,
            fp.AvailabilityStatus, ts.OverallScore AS TrustScore
        FROM Users u
        JOIN FreelancerProfiles fp ON u.UserID = fp.FreelancerID
        LEFT JOIN TrustScores ts ON fp.FreelancerID = ts.FreelancerID
        WHERE u.Role = 'freelancer';
        """,
        """
        CREATE VIEW vw_client_summary AS
        SELECT 
            u.UserID, u.Username, u.Email, cp.CompanyName, cp.TrustLevel,
            COUNT(jp.JobID) AS TotalJobsPosted,
            COUNT(DISTINCT a.ApplicationID) AS TotalApplicationsReceived
        FROM Users u
        JOIN ClientProfiles cp ON u.UserID = cp.ClientID
        LEFT JOIN JobPosts jp ON cp.ClientID = jp.ClientID
        LEFT JOIN Applications a ON jp.JobID = a.JobID
        WHERE u.Role = 'client'
        GROUP BY u.UserID, u.Username, u.Email, cp.CompanyName, cp.TrustLevel;
        """,
        """
        CREATE VIEW vw_active_jobs AS
        SELECT 
            jp.JobID, jp.Title, jp.RequiredTrustScore, jp.MinSkillLevel,
            jp.Status, jp.CreatedAt, cp.CompanyName,
            COUNT(a.ApplicationID) AS ApplicationCount
        FROM JobPosts jp
        JOIN ClientProfiles cp ON jp.ClientID = cp.ClientID
        LEFT JOIN Applications a ON jp.JobID = a.JobID
        WHERE jp.Status = 'open'
        GROUP BY jp.JobID, jp.Title, jp.RequiredTrustScore, jp.MinSkillLevel, jp.Status, jp.CreatedAt, cp.CompanyName;
        """,
        """
        CREATE VIEW vw_top_freelancers AS
        SELECT 
            fs.*,
            (SELECT COUNT(*) FROM ChallengeResults cr WHERE cr.FreelancerID = fs.UserID) AS TotalChallenges,
            (SELECT COUNT(*) FROM Contracts c WHERE c.FreelancerID = fs.UserID AND c.Status = 'completed') AS CompletedContracts
        FROM vw_freelancer_summary fs
        WHERE fs.TrustScore >= 75;
        """,
        """
        CREATE VIEW vw_platform_kpis AS
        SELECT 
            (SELECT COUNT(*) FROM Users) AS total_users,
            (SELECT COUNT(*) FROM Users WHERE Role = 'freelancer') AS total_freelancers,
            (SELECT COUNT(*) FROM Users WHERE Role = 'client') AS total_clients,
            (SELECT COUNT(*) FROM JobPosts) AS total_jobs,
            (SELECT COUNT(*) FROM JobPosts WHERE Status = 'open') AS active_jobs,
            (SELECT COUNT(*) FROM Contracts) AS total_contracts,
            (SELECT COUNT(*) FROM Contracts WHERE Status = 'active') AS active_contracts,
            (SELECT COUNT(*) FROM Contracts WHERE Status = 'completed') AS completed_contracts,
            (SELECT ISNULL(SUM(Amount), 0) FROM PaymentEvents WHERE EventType = 'payment_released') AS total_revenue,
            (SELECT ISNULL(AVG(OverallScore), 0) FROM TrustScores) AS avg_trust_score,
            (SELECT ISNULL(AVG(CAST(RequiredTrustScore AS FLOAT)), 0) FROM JobPosts) AS avg_required_trust;
        """,
        """
        CREATE VIEW vw_contract_summary AS
        SELECT 
            c.ContractID, c.JobID, c.FreelancerID, c.ClientID,
            c.TotalAmount, c.Status AS ContractStatus,
            j.Title AS JobTitle,
            fp.DisplayName AS FreelancerName,
            cp.CompanyName AS ClientCompany,
            COUNT(m.MilestoneID) AS TotalMilestones,
            SUM(CASE WHEN m.Status = 'approved' THEN 1 ELSE 0 END) AS ApprovedMilestones,
            SUM(CASE WHEN m.Status = 'pending' THEN 1 ELSE 0 END) AS PendingMilestones,
            ISNULL(SUM(CASE WHEN pe.EventType = 'payment_released' THEN pe.Amount ELSE 0 END), 0) AS ReleasedAmount
        FROM Contracts c
        JOIN JobPosts j ON c.JobID = j.JobID
        JOIN FreelancerProfiles fp ON c.FreelancerID = fp.FreelancerID
        JOIN ClientProfiles cp ON c.ClientID = cp.ClientID
        LEFT JOIN Milestones m ON c.ContractID = m.ContractID
        LEFT JOIN PaymentEvents pe ON c.ContractID = pe.ContractID
        GROUP BY c.ContractID, c.JobID, c.FreelancerID, c.ClientID,
                 c.TotalAmount, c.Status, j.Title, fp.DisplayName, cp.CompanyName;
        """,
        """
        CREATE VIEW vw_job_applications AS
        SELECT 
            a.ApplicationID, a.JobID, a.FreelancerID, a.CoverNote, a.Status, a.AppliedAt,
            j.Title AS JobTitle, j.ClientID,
            fp.DisplayName AS FreelancerName, fp.Headline,
            ts.OverallScore AS FreelancerTrustScore
        FROM Applications a
        JOIN JobPosts j ON a.JobID = j.JobID
        JOIN FreelancerProfiles fp ON a.FreelancerID = fp.FreelancerID
        LEFT JOIN TrustScores ts ON fp.FreelancerID = ts.FreelancerID;
        """
    ]

    with engine.begin() as conn:
        for view_name in ['vw_job_applications', 'vw_contract_summary', 'vw_platform_kpis', 'vw_top_freelancers', 'vw_active_jobs', 'vw_client_summary', 'vw_freelancer_summary']:
            conn.execute(text(f"DROP VIEW IF EXISTS {view_name};"))
        for view in views:
            conn.execute(text(view))

    print("✅ Views Created (7 views including Member 3 & 4)")


def create_stored_procedures():
    print("\n" + "="*60)
    print("PHASE 4: Stored Procedures")
    print("="*60)

    engine = get_engine()

    procedures = [
        """
        CREATE PROCEDURE sp_get_user_by_email
            @Email NVARCHAR(255)
        AS
        BEGIN
            SELECT * FROM Users WHERE Email = @Email;
        END;
        """,
        """
        CREATE PROCEDURE sp_get_user_by_username
            @Username NVARCHAR(50)
        AS
        BEGIN
            SELECT * FROM Users WHERE Username = @Username;
        END;
        """,
        """
        CREATE PROCEDURE sp_get_freelancer_dna
            @FreelancerID INT
        AS
        BEGIN
            SELECT 
                fp.DisplayName, fp.Category, ss.TraitName, ss.Score, ss.UpdatedAt
            FROM FreelancerProfiles fp
            JOIN SkillScores ss ON fp.FreelancerID = ss.FreelancerID
            WHERE fp.FreelancerID = @FreelancerID
            ORDER BY ss.TraitName;
        END;
        """,
        """
        CREATE PROCEDURE sp_calculate_trust_score
            @FreelancerID INT
        AS
        BEGIN
            SELECT SUM(Weight * Value) / SUM(Weight) AS WeightedScore
            FROM ScoreComponents
            WHERE FreelancerID = @FreelancerID;
        END;
        """,
        """
        CREATE PROCEDURE sp_get_matching_jobs
            @FreelancerID INT
        AS
        BEGIN
            DECLARE @TrustScore FLOAT;
            SELECT @TrustScore = OverallScore FROM TrustScores WHERE FreelancerID = @FreelancerID;
            SELECT * FROM vw_active_jobs 
            WHERE RequiredTrustScore <= @TrustScore
            ORDER BY CreatedAt DESC;
        END;
        """,
        """
        CREATE PROCEDURE sp_flag_submission
            @SubmissionID NVARCHAR(50),
            @FreelancerID INT,
            @ConfidenceScore FLOAT,
            @FlagType NVARCHAR(50)
        AS
        BEGIN
            INSERT INTO FlaggedAccounts (UserID, FlagType, Severity, DetectedAt, Status)
            VALUES (
                @FreelancerID,
                @FlagType,
                CASE WHEN @ConfidenceScore > 0.85 THEN 'high' ELSE 'medium' END,
                GETDATE(),
                'pending'
            );
            SELECT @@IDENTITY AS FlagID;
        END;
        """,
        """
        CREATE PROCEDURE sp_get_escrow_balance
            @ContractID INT
        AS
        BEGIN
            SELECT 
                c.TotalAmount,
                ISNULL(SUM(CASE WHEN pe.EventType = 'escrow_deposit' THEN pe.Amount ELSE 0 END), 0) AS TotalDeposited,
                ISNULL(SUM(CASE WHEN pe.EventType = 'payment_released' THEN pe.Amount ELSE 0 END), 0) AS TotalReleased,
                ISNULL(SUM(CASE WHEN pe.EventType = 'escrow_deposit' THEN pe.Amount ELSE 0 END), 0) - 
                ISNULL(SUM(CASE WHEN pe.EventType = 'payment_released' THEN pe.Amount ELSE 0 END), 0) AS EscrowBalance
            FROM Contracts c
            LEFT JOIN PaymentEvents pe ON c.ContractID = pe.ContractID
            WHERE c.ContractID = @ContractID
            GROUP BY c.ContractID, c.TotalAmount;
        END;
        """,
        """
        CREATE PROCEDURE sp_get_contract_details
            @ContractID INT
        AS
        BEGIN
            SELECT 
                c.*, j.Title AS JobTitle, j.RequiredTrustScore,
                fp.DisplayName AS FreelancerName, fp.Headline AS FreelancerHeadline,
                cp.CompanyName AS ClientCompany, cp.TrustLevel AS ClientTrustLevel,
                ts.OverallScore AS FreelancerTrustScore
            FROM Contracts c
            JOIN JobPosts j ON c.JobID = j.JobID
            JOIN FreelancerProfiles fp ON c.FreelancerID = fp.FreelancerID
            JOIN ClientProfiles cp ON c.ClientID = cp.ClientID
            LEFT JOIN TrustScores ts ON fp.FreelancerID = ts.FreelancerID
            WHERE c.ContractID = @ContractID;
        END;
        """
    ]

    with engine.begin() as conn:
        for proc_name in ['sp_get_contract_details', 'sp_get_escrow_balance', 'sp_flag_submission', 'sp_get_user_by_email', 'sp_get_user_by_username', 'sp_get_freelancer_dna', 'sp_calculate_trust_score', 'sp_get_matching_jobs']:
            conn.execute(text(f"DROP PROCEDURE IF EXISTS {proc_name};"))
        for proc in procedures:
            conn.execute(text(proc))

    print("✅ Stored Procedures Created (8 procedures including Member 3 & 4)")


def create_functions():
    print("\n" + "="*60)
    print("PHASE 5: Functions")
    print("="*60)

    engine = get_engine()

    functions = [
        """
        CREATE FUNCTION fn_avg_trust_score()
        RETURNS FLOAT
        AS
        BEGIN
            DECLARE @avg FLOAT;
            SELECT @avg = AVG(OverallScore) FROM TrustScores;
            RETURN @avg;
        END;
        """,
        """
        CREATE FUNCTION fn_freelancer_rank(@FreelancerID INT)
        RETURNS INT
        AS
        BEGIN
            DECLARE @rank INT;
            SELECT @rank = COUNT(*) + 1 
            FROM TrustScores 
            WHERE OverallScore > (SELECT OverallScore FROM TrustScores WHERE FreelancerID = @FreelancerID);
            RETURN @rank;
        END;
        """,
        """
        CREATE FUNCTION fn_contract_completion_rate(@FreelancerID INT)
        RETURNS FLOAT
        AS
        BEGIN
            DECLARE @total INT;
            DECLARE @completed INT;
            SELECT @total = COUNT(*) FROM Contracts WHERE FreelancerID = @FreelancerID;
            SELECT @completed = COUNT(*) FROM Contracts WHERE FreelancerID = @FreelancerID AND Status = 'completed';
            IF @total = 0 RETURN 0.0;
            RETURN CAST(@completed AS FLOAT) / CAST(@total AS FLOAT) * 100.0;
        END;
        """,
        """
        CREATE FUNCTION fn_client_total_spent(@ClientID INT)
        RETURNS FLOAT
        AS
        BEGIN
            DECLARE @spent FLOAT;
            SELECT @spent = ISNULL(SUM(pe.Amount), 0) 
            FROM PaymentEvents pe
            JOIN Contracts c ON pe.ContractID = c.ContractID
            WHERE c.ClientID = @ClientID AND pe.EventType = 'payment_released';
            RETURN @spent;
        END;
        """
    ]

    with engine.begin() as conn:
        for func_name in ['fn_client_total_spent', 'fn_contract_completion_rate', 'fn_avg_trust_score', 'fn_freelancer_rank']:
            conn.execute(text(f"DROP FUNCTION IF EXISTS {func_name};"))
        for func in functions:
            conn.execute(text(func))

    print("✅ Functions Created (4 functions including Member 4)")


def create_triggers():
    print("\n" + "="*60)
    print("PHASE 6: Triggers")
    print("="*60)

    engine = get_engine()

    triggers = [
        """
        CREATE TRIGGER trg_log_score_change
        ON TrustScores
        AFTER UPDATE
        AS
        BEGIN
            INSERT INTO ScoreHistory (FreelancerID, OldScore, NewScore, ChangedAt, Reason)
            SELECT 
                d.FreelancerID, d.OverallScore AS OldScore, 
                i.OverallScore AS NewScore, GETDATE(), 
                'Auto-recalculation via Trust Score Agent'
            FROM deleted d 
            JOIN inserted i ON d.TrustID = i.TrustID;
        END;
        """,
        """
        CREATE TRIGGER trg_update_availability
        ON Contracts
        AFTER INSERT
        AS
        BEGIN
            UPDATE FreelancerProfiles
            SET AvailabilityStatus = 'busy'
            WHERE FreelancerID IN (SELECT FreelancerID FROM inserted);
        END;
        """,
        """
        CREATE TRIGGER trg_log_payment_event
        ON PaymentEvents
        AFTER INSERT
        AS
        BEGIN
            UPDATE Contracts
            SET Status = 'completed'
            WHERE ContractID IN (
                SELECT i.ContractID 
                FROM inserted i
                WHERE i.EventType = 'payment_released'
                AND i.ContractID IN (
                    SELECT c.ContractID 
                    FROM Contracts c
                    WHERE c.Status = 'active'
                    AND NOT EXISTS (
                        SELECT 1 FROM Milestones m 
                        WHERE m.ContractID = c.ContractID 
                        AND m.Status != 'approved'
                    )
                )
            );
        END;
        """
    ]

    with engine.begin() as conn:
        for trig_name in ['trg_log_payment_event', 'trg_log_score_change', 'trg_update_availability']:
            conn.execute(text(f"DROP TRIGGER IF EXISTS {trig_name};"))
        for trig in triggers:
            conn.execute(text(trig))

    print("✅ Triggers Created (3 triggers including Member 4)")


def verify_data():
    print("\n" + "="*60)
    print("PHASE 7: Verification")
    print("="*60)

    engine = get_engine()

    with engine.connect() as conn:
        result = conn.execute(text("SELECT Role, COUNT(*) as Count FROM Users GROUP BY Role"))
        print("\n📊 Users by Role:")
        for row in result:
            print(f"   {row.Role}: {row.Count}")

        result = conn.execute(text("SELECT * FROM vw_freelancer_summary"))
        print("\n📊 Freelancer Summary:")
        for row in result:
            print(f"   {row.Username} | {row.DisplayName} | {row.Category} | Trust: {row.TrustScore}")

        result = conn.execute(text("SELECT AVG(OverallScore) as AvgTrust FROM TrustScores"))
        avg = result.fetchone()[0]
        print(f"\n📊 Average Trust Score: {avg:.2f}")

        result = conn.execute(text("SELECT COUNT(*) as Jobs FROM JobPosts"))
        print(f"📊 Total Jobs: {result.fetchone()[0]}")

        result = conn.execute(text("SELECT COUNT(*) as Contracts FROM Contracts"))
        print(f"📊 Contracts: {result.fetchone()[0]}")

        result = conn.execute(text("SELECT COUNT(*) as Milestones FROM Milestones"))
        print(f"📊 Milestones: {result.fetchone()[0]}")

        result = conn.execute(text("SELECT COUNT(*) as Payments FROM PaymentEvents"))
        print(f"📊 Payment Events: {result.fetchone()[0]}")

        result = conn.execute(text("SELECT COUNT(*) as Applications FROM Applications"))
        print(f"📊 Applications: {result.fetchone()[0]}")

        result = conn.execute(text("SELECT COUNT(*) as Disputes FROM DisputeRecords"))
        print(f"📊 Disputes: {result.fetchone()[0]}")

        result = conn.execute(text("SELECT COUNT(*) as Views FROM sys.views WHERE name LIKE 'vw_%'"))
        print(f"\n📊 Views Created: {result.fetchone()[0]}")

        result = conn.execute(text("SELECT COUNT(*) as Procs FROM sys.procedures WHERE name LIKE 'sp_%'"))
        print(f"📊 Stored Procedures: {result.fetchone()[0]}")

        result = conn.execute(text("SELECT COUNT(*) as Triggers FROM sys.triggers"))
        print(f"📊 Triggers: {result.fetchone()[0]}")


def seed_all():
    print("\n" + "="*30)
    print("SKILLSYNC AI — SQL SERVER SEED")
    print("="*30)

    run_ddl()
    run_dml()
    create_views()
    create_stored_procedures()
    create_functions()
    create_triggers()
    verify_data()

    print("\n" + "="*60)
    print("✅ SQL SERVER SEED COMPLETE")
    print("="*60)


if __name__ == "__main__":
    seed_all()