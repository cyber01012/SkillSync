# Database: SQL Server Architecture
**Role:** Senior Database Administrator | RDBMS Specialist

---

## 1. Connection & Configuration

### Connection String Setup
```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

DATABASE_URL = "mssql+pyodbc://username:password@server:1433/anttigravity?driver=ODBC+Driver+17+for+SQL+Server"

# Async connection for FastAPI
DATABASE_URL_ASYNC = "mssql+aioodbc://username:password@server:1433/anttigravity?driver=ODBC+Driver+17+for+SQL+Server"

# Connection pool configuration
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False
)
```

---

## 2. Schema & Data Model

### Core Tables Structure
```sql
-- Users Table
CREATE TABLE [dbo].[Users] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [username] NVARCHAR(255) NOT NULL UNIQUE,
    [email] NVARCHAR(255) NOT NULL UNIQUE,
    [password_hash] NVARCHAR(MAX) NOT NULL,
    [full_name] NVARCHAR(255),
    [role] NVARCHAR(50) NOT NULL,
    [is_active] BIT DEFAULT 1,
    [created_at] DATETIME2 DEFAULT GETUTCDATE(),
    [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
    [last_login] DATETIME2 NULL,
    [metadata] NVARCHAR(MAX),  -- JSON
    INDEX [IX_Email] NONCLUSTERED ([email]),
    INDEX [IX_Username] NONCLUSTERED ([username])
);

-- Agents Table
CREATE TABLE [dbo].[Agents] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [owner_id] UNIQUEIDENTIFIER NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(MAX),
    [system_prompt] NVARCHAR(MAX) NOT NULL,
    [model] NVARCHAR(100) NOT NULL,
    [temperature] DECIMAL(3,2) DEFAULT 0.7,
    [max_tokens] INT DEFAULT 2000,
    [is_active] BIT DEFAULT 1,
    [version] INT DEFAULT 1,
    [created_at] DATETIME2 DEFAULT GETUTCDATE(),
    [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
    [config] NVARCHAR(MAX),  -- JSON configuration
    FOREIGN KEY ([owner_id]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE,
    INDEX [IX_OwnerId] NONCLUSTERED ([owner_id]),
    INDEX [IX_IsActive] NONCLUSTERED ([is_active])
);

-- Agent Executions Table
CREATE TABLE [dbo].[AgentExecutions] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [agent_id] UNIQUEIDENTIFIER NOT NULL,
    [user_id] UNIQUEIDENTIFIER NOT NULL,
    [status] NVARCHAR(50) NOT NULL,  -- pending, running, completed, failed
    [input] NVARCHAR(MAX),  -- JSON
    [output] NVARCHAR(MAX),  -- JSON
    [error] NVARCHAR(MAX),
    [duration_ms] INT,
    [tokens_used] INT,
    [cost] DECIMAL(10,6),
    [started_at] DATETIME2 DEFAULT GETUTCDATE(),
    [completed_at] DATETIME2 NULL,
    [metadata] NVARCHAR(MAX),  -- JSON
    FOREIGN KEY ([agent_id]) REFERENCES [dbo].[Agents]([id]) ON DELETE CASCADE,
    FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE,
    INDEX [IX_AgentId] NONCLUSTERED ([agent_id]),
    INDEX [IX_UserId] NONCLUSTERED ([user_id]),
    INDEX [IX_Status] NONCLUSTERED ([status]),
    INDEX [IX_StartedAt] NONCLUSTERED ([started_at])
);

-- Workflows Table
CREATE TABLE [dbo].[Workflows] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [owner_id] UNIQUEIDENTIFIER NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(MAX),
    [definition] NVARCHAR(MAX) NOT NULL,  -- JSON workflow steps
    [is_active] BIT DEFAULT 1,
    [version] INT DEFAULT 1,
    [created_at] DATETIME2 DEFAULT GETUTCDATE(),
    [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY ([owner_id]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE,
    INDEX [IX_OwnerId] NONCLUSTERED ([owner_id]),
    INDEX [IX_IsActive] NONCLUSTERED ([is_active])
);

-- Workflow Executions Table
CREATE TABLE [dbo].[WorkflowExecutions] (
    [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [workflow_id] UNIQUEIDENTIFIER NOT NULL,
    [user_id] UNIQUEIDENTIFIER NOT NULL,
    [status] NVARCHAR(50) NOT NULL,
    [execution_trace] NVARCHAR(MAX),  -- JSON
    [started_at] DATETIME2 DEFAULT GETUTCDATE(),
    [completed_at] DATETIME2 NULL,
    [duration_ms] INT,
    FOREIGN KEY ([workflow_id]) REFERENCES [dbo].[Workflows]([id]) ON DELETE CASCADE,
    FOREIGN KEY ([user_id]) REFERENCES [dbo].[Users]([id]) ON DELETE CASCADE,
    INDEX [IX_WorkflowId] NONCLUSTERED ([workflow_id]),
    INDEX [IX_Status] NONCLUSTERED ([status])
);

-- Audit Log Table
CREATE TABLE [dbo].[AuditLog] (
    [id] BIGINT PRIMARY KEY IDENTITY(1,1),
    [user_id] UNIQUEIDENTIFIER,
    [action] NVARCHAR(255) NOT NULL,
    [entity_type] NVARCHAR(100) NOT NULL,
    [entity_id] UNIQUEIDENTIFIER,
    [changes] NVARCHAR(MAX),  -- JSON
    [timestamp] DATETIME2 DEFAULT GETUTCDATE(),
    [ip_address] NVARCHAR(50),
    INDEX [IX_UserId] NONCLUSTERED ([user_id]),
    INDEX [IX_Timestamp] NONCLUSTERED ([timestamp])
);
```

---

## 3. Indexing Strategy

### Performance Indexes
```sql
-- Composite Index for common query patterns
CREATE NONCLUSTERED INDEX [IX_Agents_Owner_Active] 
ON [dbo].[Agents] ([owner_id], [is_active]) 
INCLUDE ([name], [created_at]);

-- Covering Index for AgentExecutions queries
CREATE NONCLUSTERED INDEX [IX_Executions_Agent_Date] 
ON [dbo].[AgentExecutions] ([agent_id], [started_at]) 
INCLUDE ([status], [duration_ms], [cost]);

-- Partitioned Index for high-volume data (if needed)
CREATE NONCLUSTERED INDEX [IX_AuditLog_Partitioned] 
ON [dbo].[AuditLog] ([timestamp]) 
WITH (FILLFACTOR = 90);

-- Check missing indexes
SELECT * FROM sys.dm_db_missing_index_details;
```

### Index Maintenance
```sql
-- Update index statistics
ALTER INDEX ALL ON [dbo].[Agents] REBUILD;
ALTER INDEX ALL ON [dbo].[AgentExecutions] REBUILD;

-- Schedule weekly maintenance
DBCC DBREINDEX ([dbo].[AuditLog], '', 70);

-- Monitor index usage
SELECT 
    OBJECT_NAME(i.object_id) AS TableName,
    i.name AS IndexName,
    s.user_updates,
    s.user_seeks,
    s.user_scans
FROM sys.indexes i
JOIN sys.dm_db_index_usage_stats s ON i.object_id = s.object_id
ORDER BY s.user_updates DESC;
```

---

## 4. Data Types & Storage

### JSON Storage for Flexibility
```python
from sqlalchemy import JSON, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Agent(Base):
    __tablename__ = "Agents"
    
    id: UUID
    owner_id: UUID
    name: str
    system_prompt: str
    config: dict  # Stored as JSON
    
    # Query JSON fields
    # SELECT * FROM Agents WHERE JSON_VALUE(config, '$.temperature') > 0.8
```

### Storage Optimization
```sql
-- Compress large text fields
ALTER TABLE [dbo].[AgentExecutions] 
ALTER COLUMN [output] NVARCHAR(MAX) SPARSE NULL;

-- Use NVARCHAR(MAX) with compression for large text
CREATE TABLE [dbo].[LargeData] (
    [id] INT PRIMARY KEY,
    [content] NVARCHAR(MAX) COMPRESSED
);
```

---

## 5. Query Optimization

### Efficient Query Patterns
```python
# Use async SQLAlchemy for FastAPI
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

# Good: Specific columns with indexes
async def get_user_agents(user_id: UUID, db: AsyncSession):
    stmt = (
        select(Agent.id, Agent.name, Agent.created_at)
        .where(and_(Agent.owner_id == user_id, Agent.is_active == True))
        .order_by(Agent.created_at.desc())
    )
    return await db.execute(stmt)

# Good: Use joins efficiently
async def get_agent_with_executions(agent_id: UUID, db: AsyncSession):
    stmt = (
        select(Agent)
        .options(joinedload(Agent.executions))
        .where(Agent.id == agent_id)
    )
    return await db.execute(stmt)

# Bad: N+1 query problem
agents = db.query(Agent).all()
for agent in agents:
    executions = db.query(AgentExecution).filter(AgentExecution.agent_id == agent.id)
```

### Query Execution Plans
```sql
-- Analyze query performance
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

SELECT a.*, COUNT(e.id) as execution_count
FROM [dbo].[Agents] a
LEFT JOIN [dbo].[AgentExecutions] e ON a.id = e.agent_id
WHERE a.owner_id = '...'
GROUP BY a.id;

-- View execution plan
SET STATISTICS IO OFF;
SET STATISTICS TIME OFF;
```

---

## 6. Transactions & ACID Compliance

### Transaction Management
```python
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager

class TransactionManager:
    @asynccontextmanager
    async def transaction(self, db: AsyncSession):
        try:
            yield db
            await db.commit()
        except Exception as e:
            await db.rollback()
            raise e

# Usage in service
async def create_agent_with_workflow(agent_data, workflow_data, db):
    async with TransactionManager().transaction(db):
        agent = Agent(**agent_data)
        db.add(agent)
        await db.flush()  # Get agent ID without committing
        
        workflow = Workflow(agent_id=agent.id, **workflow_data)
        db.add(workflow)
        # Commit happens on context exit
```

### Isolation Levels
```sql
-- Set appropriate isolation levels
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- For sensitive operations
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Check current transactions
SELECT * FROM sys.dm_tran_active_transactions;
```

---

## 7. Backup & Recovery

### Backup Strategy
```sql
-- Full backup daily
BACKUP DATABASE [anttigravity] 
TO DISK = 'C:\Backups\anttigravity_full.bak'
WITH INIT, COMPRESSION;

-- Incremental backup every 6 hours
BACKUP DATABASE [anttigravity] 
TO DISK = 'C:\Backups\anttigravity_diff.bak'
WITH DIFFERENTIAL, COMPRESSION;

-- Transaction log backup every hour
BACKUP LOG [anttigravity] 
TO DISK = 'C:\Backups\anttigravity_log.bak'
WITH COMPRESSION;
```

### Recovery Procedures
```sql
-- Point-in-time recovery
RESTORE DATABASE [anttigravity] 
FROM DISK = 'C:\Backups\anttigravity_full.bak'
WITH NORECOVERY;

RESTORE LOG [anttigravity] 
FROM DISK = 'C:\Backups\anttigravity_log.bak'
WITH RECOVERY, STOPAT = '2024-01-15 10:30:00';
```

---

## 8. Security & Access Control

### Database Security
```sql
-- Create application user (limited permissions)
CREATE LOGIN appuser WITH PASSWORD = 'ComplexPassword123!';
CREATE USER appuser FOR LOGIN appuser;

-- Grant minimal required permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON [dbo].[Agents] TO appuser;
GRANT SELECT, INSERT, UPDATE ON [dbo].[AgentExecutions] TO appuser;
GRANT SELECT ON [dbo].[Users] TO appuser;

-- Deny dangerous operations
DENY ALTER ON DATABASE::[anttigravity] TO appuser;

-- Row-level security (if needed)
CREATE SECURITY POLICY [AgentAccessPolicy]
ADD FILTER PREDICATE dbo.AgentFilter(owner_id) 
ON [dbo].[Agents];
```

### Column Encryption
```sql
-- Transparent Data Encryption (TDE)
CREATE MASTER KEY ENCRYPTION BY PASSWORD = 'your_password';

CREATE CERTIFICATE anttigravity_cert WITH SUBJECT = 'Anttigravity TDE';

CREATE DATABASE ENCRYPTION KEY
WITH ALGORITHM = AES_256
ENCRYPTION BY SERVER CERTIFICATE anttigravity_cert;

ALTER DATABASE [anttigravity] SET ENCRYPTION ON;

-- Always Encrypted for sensitive columns
ALTER TABLE [dbo].[Users]
ALTER COLUMN password_hash ENCRYPTED WITH (
    ENCRYPTION_TYPE = DETERMINISTIC,
    ALGORITHM = 'AEAD_AES_256_CBC_HMAC_SHA_256',
    COLUMN_ENCRYPTION_KEY = CEK_01
);
```

---

## 9. Monitoring & Performance Tuning

### Query Performance Monitoring
```sql
-- Find slow queries
SELECT TOP 10
    (total_elapsed_time / execution_count) AS avg_elapsed_time,
    execution_count,
    query_hash,
    statement_start_offset,
    statement_end_offset,
    sql_handle
FROM sys.dm_exec_query_stats
ORDER BY avg_elapsed_time DESC;

-- Memory usage
SELECT 
    name,
    (pages_in_use * 8) / 1024 AS memory_mb
FROM sys.dm_os_memory_clerks
ORDER BY pages_in_use DESC;

-- I/O statistics
SELECT 
    OBJECT_NAME(ips.object_id) AS TableName,
    ips.user_seeks,
    ips.user_scans,
    ips.user_lookups,
    ips.user_updates
FROM sys.dm_db_index_operational_stats(DB_ID(), NULL, NULL, NULL) ips
ORDER BY ips.user_seeks + ips.user_scans DESC;
```

### Database Health Check
```python
class DatabaseHealthCheck:
    async def check_database_integrity(self, db: AsyncSession):
        """Run DBCC CHECKDB"""
        await db.execute(text("DBCC CHECKDB (anttigravity)"))
    
    async def check_transaction_log_space(self, db: AsyncSession):
        """Monitor transaction log growth"""
        result = await db.execute(
            text("""
                SELECT name, size, max_size 
                FROM sys.master_files 
                WHERE database_id = DB_ID('anttigravity')
            """)
        )
        return result.fetchall()
```

---

## 10. Partitioning Strategy (for scale)

### Table Partitioning
```sql
-- Create partition function for date-based partitioning
CREATE PARTITION FUNCTION [AuditLogPartitionFunction] (DATETIME2)
AS RANGE RIGHT FOR VALUES (
    '2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01'
);

-- Create partition scheme
CREATE PARTITION SCHEME [AuditLogPartitionScheme]
AS PARTITION [AuditLogPartitionFunction]
TO (PRIMARY, PRIMARY, PRIMARY, PRIMARY);

-- Create partitioned table
CREATE TABLE [dbo].[AuditLog_Partitioned] (
    [id] BIGINT,
    [timestamp] DATETIME2,
    [user_id] UNIQUEIDENTIFIER
) ON [AuditLogPartitionScheme]([timestamp]);
```

---

## 11. Replication & High Availability

### Always On Availability Groups
```sql
-- Enable Always On
ALTER SERVER CONFIGURATION SET HADR CLUSTER CONTEXT = 'cluster_name';

-- Create availability group
CREATE AVAILABILITY GROUP [AG_Anttigravity]
WITH (AUTOMATED_BACKUP_PREFERENCE = SECONDARY);

-- Add replica
ALTER AVAILABILITY GROUP [AG_Anttigravity]
ADD REPLICA ON 'secondary_server';
```

---

## 12. Data Retention Policies

### Archiving Old Data
```sql
-- Archive old audit logs (older than 1 year)
CREATE PROCEDURE sp_ArchiveAuditLogs
AS BEGIN
    INSERT INTO [dbo].[AuditLog_Archive]
    SELECT * FROM [dbo].[AuditLog]
    WHERE timestamp < DATEADD(YEAR, -1, GETUTCDATE());
    
    DELETE FROM [dbo].[AuditLog]
    WHERE timestamp < DATEADD(YEAR, -1, GETUTCDATE());
    
    DBCC SHRINKFILE (anttigravity_log, TRUNCATEONLY);
END;

-- Schedule monthly
EXEC sp_add_job @job_name = 'Archive_AuditLogs';
```

---

## 13. Connection Pooling Tuning

### Pool Configuration
```python
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,              # Default connections
    max_overflow=10,           # Additional connections when needed
    pool_pre_ping=True,        # Test connections before using
    pool_recycle=3600,         # Recycle connections after 1 hour
    echo=False,
    connect_args={
        "timeout": 30,
        "check_same_thread": False,
    }
)
```

---

## 14. Testing & Quality Assurance

### Database Testing
```sql
-- Test data integrity
SELECT COUNT(*) FROM [dbo].[Agents] WHERE id IS NULL;

-- Test foreign key constraints
SELECT * FROM [dbo].[AgentExecutions]
WHERE agent_id NOT IN (SELECT id FROM [dbo].[Agents]);

-- Test default values
INSERT INTO [dbo].[Agents] (owner_id, name, system_prompt, model)
VALUES (NEWID(), 'Test', 'prompt', 'gpt-4');
```

---

## 15. Migration & Schema Management

### Using Alembic for migrations
```python
# In migrations/env.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'new_table',
        sa.Column('id', sa.UUID, primary_key=True),
        sa.Column('name', sa.String(255))
    )

def downgrade():
    op.drop_table('new_table')
```

---

## DBA Checklist

- [ ] Database created with proper collation (SQL_Latin1_General_CP1_CI_AS)
- [ ] Backup strategy implemented and tested
- [ ] Recovery procedures documented
- [ ] Indexes analyzed and optimized
- [ ] Query performance baselines established
- [ ] Security roles configured
- [ ] Monitoring alerts configured
- [ ] Maintenance jobs scheduled
- [ ] Archiving strategy implemented
- [ ] Disaster recovery plan tested
- [ ] Documentation complete
- [ ] Access controls reviewed
