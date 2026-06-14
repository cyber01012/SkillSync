"""SQL Server Seed Script — Demonstrates DDL, DML, TCL, Views, Stored Procedures, Triggers."""
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

    INSERT INTO Users (Username, Email, PasswordHash, Role, IsVerified) VALUES
    ('admin', 'admin@skillsync.ai', :admin_pw, 'freelancer', 1),
    ('client1', 'client1@techcorp.com', :client1_pw, 'client', 1),
    ('client2', 'client2@designstudio.com', :client2_pw, 'client', 1),
    ('freelancer1', 'freelancer1@gmail.com', :f1_pw, 'freelancer', 1),
    ('freelancer2', 'freelancer2@outlook.com', :f2_pw, 'freelancer', 1),
    ('freelancer3', 'freelancer3@yahoo.com', :f3_pw, 'freelancer', 1);

    INSERT INTO Categories (Domain, Specialty, DisplayName, DNAProfileJSON, IsActive) VALUES
    ('frontend', 'react', 'React Frontend Developer', :dna_react, 1),
    ('frontend', 'vue', 'Vue Frontend Developer', :dna_react, 1),
    ('frontend', 'css', 'CSS/Tailwind Developer', :dna_css, 1),
    ('backend', 'python', 'Python Backend Developer', :dna_python, 1),
    ('backend', 'java', 'Java Backend Developer', :dna_python, 1),
    ('backend', 'nodejs', 'Node.js Backend Developer', :dna_python, 1),
    ('fullstack', 'mern', 'MERN Stack Developer', :dna_mern, 1),
    ('fullstack', 'python_react', 'Python + React Developer', :dna_mern, 1);

    INSERT INTO FreelancerProfiles (FreelancerID, DisplayName, Headline, Category, CategoryID, HasBaselineDNA, AvailabilityStatus) VALUES
    (1, 'System Admin', 'Platform Administrator', 'System', NULL, 0, 'busy'),
    (4, 'Ali Khan', 'Full-Stack Developer | React & Python', 'python', 4, 1, 'available'),
    (5, 'Sara Ahmed', 'UI/UX Designer & Brand Strategist', 'react', 1, 1, 'available'),
    (6, 'Omar Farooq', 'Data Scientist & ML Engineer', 'python', 4, 1, 'available');

    INSERT INTO ClientProfiles (ClientID, CompanyName, IndustryID, IsVerified, TrustLevel) VALUES
    (2, 'TechCorp Solutions', 1, 1, 'premium'),
    (3, 'Design Studio Pro', 2, 1, 'standard');

    INSERT INTO SkillScores (FreelancerID, TraitName, Score) VALUES
    (4, 'Reliability', 78), (4, 'Creativity', 65), (4, 'Teamwork', 82),
    (4, 'Communication', 70), (4, 'Deadline Adherence', 85), (4, 'Technical Accuracy', 88),
    (5, 'Reliability', 85), (5, 'Creativity', 92), (5, 'Teamwork', 75),
    (5, 'Communication', 80), (5, 'Deadline Adherence', 78), (5, 'Technical Accuracy', 70),
    (6, 'Reliability', 72), (6, 'Creativity', 80), (6, 'Teamwork', 68),
    (6, 'Communication', 75), (6, 'Deadline Adherence', 70), (6, 'Technical Accuracy', 95);

    INSERT INTO TrustScores (FreelancerID, OverallScore) VALUES
    (4, 76.5), (5, 80.0), (6, 78.3);

    INSERT INTO ScoreComponents (FreelancerID, FactorName, Weight, Value) VALUES
    (4, 'Delivery Consistency', 0.25, 80.0),
    (4, 'Client Retention', 0.20, 75.0),
    (4, 'Communication', 0.20, 70.0),
    (4, 'Dispute History', 0.15, 90.0),
    (4, 'Challenge Performance', 0.20, 78.0),
    (5, 'Delivery Consistency', 0.25, 85.0),
    (5, 'Client Retention', 0.20, 82.0),
    (5, 'Communication', 0.20, 80.0),
    (5, 'Dispute History', 0.15, 95.0),
    (5, 'Challenge Performance', 0.20, 75.0),
    (6, 'Delivery Consistency', 0.25, 70.0),
    (6, 'Client Retention', 0.20, 78.0),
    (6, 'Communication', 0.20, 75.0),
    (6, 'Dispute History', 0.15, 85.0),
    (6, 'Challenge Performance', 0.20, 92.0);

    INSERT INTO JobPosts (ClientID, Title, RequiredTrustScore, MinSkillLevel, Status) VALUES
    (2, 'Build E-Commerce Dashboard', 70, 'intermediate', 'open'),
    (2, 'AI Chatbot Integration', 80, 'expert', 'open'),
    (3, 'Brand Identity Design', 60, 'beginner', 'open'),
    (3, 'Mobile App UI/UX', 75, 'intermediate', 'closed');

    INSERT INTO ChallengeResults (FreelancerID, ChallengeID, Score, TimeTaken) VALUES
    (4, 'BL-PY-001', 85, 720), (4, 'BL-PY-002', 78, 540),
    (5, 'BL-RT-001', 92, 600), (5, 'BL-RT-002', 88, 480),
    (6, 'BL-PY-001', 95, 450), (6, 'BL-PY-002', 90, 510);

    COMMIT;
    """

    with engine.begin() as conn:
        conn.execute(text(dml), {
            "admin_pw": hash_pw("admin123"),
            "client1_pw": hash_pw("client123"),
            "client2_pw": hash_pw("client123"),
            "f1_pw": hash_pw("freelancer123"),
            "f2_pw": hash_pw("freelancer123"),
            "f3_pw": hash_pw("freelancer123"),
            "dna_react": '{"traits":["technical","creativity","reliability","performance","speed","deadline"],"weights":[0.25,0.25,0.20,0.15,0.05,0.10],"labels":{"technical":"Technical Accuracy","creativity":"Creativity","reliability":"Reliability","performance":"Performance","speed":"Speed","deadline":"Deadline"}}',
            "dna_css": '{"traits":["technical","creativity","reliability","performance","speed","deadline"],"weights":[0.25,0.30,0.10,0.20,0.05,0.10],"labels":{"technical":"Technical Accuracy","creativity":"Creativity","reliability":"Reliability","performance":"Performance","speed":"Speed","deadline":"Deadline"}}',
            "dna_python": '{"traits":["technical","creativity","reliability","performance","speed","deadline"],"weights":[0.30,0.10,0.25,0.10,0.15,0.10],"labels":{"technical":"Technical Accuracy","creativity":"Creativity","reliability":"Reliability","performance":"Performance","speed":"Speed","deadline":"Deadline"}}',
            "dna_mern": '{"traits":["technical","creativity","reliability","performance","speed","deadline"],"weights":[0.28,0.18,0.22,0.12,0.10,0.10],"labels":{"technical":"Technical Accuracy","creativity":"Creativity","reliability":"Reliability","performance":"Performance","speed":"Speed","deadline":"Deadline"}}',
        })

    print("✅ DML + TCL Complete")


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
            COUNT(jp.JobID) AS TotalJobsPosted
        FROM Users u
        JOIN ClientProfiles cp ON u.UserID = cp.ClientID
        LEFT JOIN JobPosts jp ON cp.ClientID = jp.ClientID
        WHERE u.Role = 'client'
        GROUP BY u.UserID, u.Username, u.Email, cp.CompanyName, cp.TrustLevel;
        """,
        """
        CREATE VIEW vw_active_jobs AS
        SELECT 
            jp.JobID, jp.Title, jp.RequiredTrustScore, jp.MinSkillLevel,
            jp.Status, jp.CreatedAt, cp.CompanyName
        FROM JobPosts jp
        JOIN ClientProfiles cp ON jp.ClientID = cp.ClientID
        WHERE jp.Status = 'open';
        """,
        """
        CREATE VIEW vw_top_freelancers AS
        SELECT 
            fs.*,
            (SELECT COUNT(*) FROM ChallengeResults cr WHERE cr.FreelancerID = fs.UserID) AS TotalChallenges
        FROM vw_freelancer_summary fs
        WHERE fs.TrustScore >= 75;
        """
    ]

    with engine.begin() as conn:
        conn.execute(text("DROP VIEW IF EXISTS vw_top_freelancers;"))
        conn.execute(text("DROP VIEW IF EXISTS vw_freelancer_summary;"))
        conn.execute(text("DROP VIEW IF EXISTS vw_client_summary;"))
        conn.execute(text("DROP VIEW IF EXISTS vw_active_jobs;"))
        for view in views:
            conn.execute(text(view))

    print("✅ Views Created")


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
        """
    ]

    with engine.begin() as conn:
        conn.execute(text("DROP PROCEDURE IF EXISTS sp_get_user_by_email;"))
        conn.execute(text("DROP PROCEDURE IF EXISTS sp_get_user_by_username;"))
        conn.execute(text("DROP PROCEDURE IF EXISTS sp_get_freelancer_dna;"))
        conn.execute(text("DROP PROCEDURE IF EXISTS sp_calculate_trust_score;"))
        conn.execute(text("DROP PROCEDURE IF EXISTS sp_get_matching_jobs;"))
        for proc in procedures:
            conn.execute(text(proc))

    print("✅ Stored Procedures Created")


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
        """
    ]

    with engine.begin() as conn:
        conn.execute(text("DROP FUNCTION IF EXISTS fn_avg_trust_score;"))
        conn.execute(text("DROP FUNCTION IF EXISTS fn_freelancer_rank;"))
        for func in functions:
            conn.execute(text(func))

    print("✅ Functions Created")


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
        """
    ]

    with engine.begin() as conn:
        conn.execute(text("DROP TRIGGER IF EXISTS trg_log_score_change;"))
        conn.execute(text("DROP TRIGGER IF EXISTS trg_update_availability;"))
        for trig in triggers:
            conn.execute(text(trig))

    print("✅ Triggers Created")


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
        print(f"\nAverage Trust Score: {avg:.2f}")


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