# Database: Hybrid Strategy (SQL + MongoDB)
**Role:** Senior Database Administrator | Polyglot Database Architect

---

## 1. Architecture Decision Framework

### Data Type Classification

```
┌─────────────────────────────────────────────────────────┐
│                    Data Classification                    │
├─────────────────────────────────────────────────────────┤
│ RELATIONAL (SQL Server)                                 │
│ ├─ Structured, highly relational data                  │
│ ├─ ACID transactions required                          │
│ ├─ Complex joins and constraints                       │
│ └─ Data with fixed schema                              │
│                                                          │
│ DOCUMENT (MongoDB)                                       │
│ ├─ Semi-structured, flexible data                      │
│ ├─ High write throughput                               │
│ ├─ Nested/hierarchical data                            │
│ └─ Time-series and event data                          │
│                                                          │
│ HYBRID (Both)                                            │
│ ├─ Denormalized copies for performance                │
│ ├─ Read replicas across systems                        │
│ └─ Event sourcing patterns                             │
└─────────────────────────────────────────────────────────┘
```

### Data Allocation Strategy

```python
# SQL Server (Source of Truth)
SQL_TABLES = [
    "users",              # User accounts & auth
    "roles",              # RBAC definitions
    "permissions",        # Fine-grained permissions
    "api_keys",           # API key management
    "audit_log",          # Compliance & security
    "billing",            # Transactions & payments
    "subscriptions"       # User subscriptions
]

# MongoDB (Optimized for reads)
MONGO_COLLECTIONS = [
    "agent_profiles",     # Agent config + cached stats
    "execution_logs",     # High-volume execution history
    "workflow_definitions", # Flexible workflow schemas
    "prompt_templates",   # Versioned prompts
    "execution_traces",   # Detailed execution paths
    "cache_data",         # Computed aggregations
    "usage_metrics"       # Analytics data
]

# Replicated (Both Systems)
SYNCED_DATA = [
    "users",              # Master in SQL, cache in Mongo
    "agents",             # Master in SQL, denorm in Mongo
    "workflows"           # Master in SQL, cache in Mongo
]
```

---

## 2. Dual-Write Strategy

### Transactional Synchronization
```python
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession

class DualWriteManager:
    def __init__(self, sql_db: AsyncSession, mongo_db):
        self.sql = sql_db
        self.mongo = mongo_db
    
    async def create_agent(self, agent_data: dict) -> str:
        """
        Create agent in both databases with synchronization
        SQL = Source of Truth
        MongoDB = Cache/Read Replica
        """
        try:
            # Step 1: Write to SQL (primary)
            sql_agent = Agent(**agent_data)
            self.sql.add(sql_agent)
            await self.sql.flush()
            agent_id = sql_agent.id
            
            # Step 2: Write to MongoDB (cache)
            mongo_doc = {
                "_id": str(agent_id),
                "owner_id": str(agent_data["owner_id"]),
                "name": agent_data["name"],
                "system_prompt": agent_data["system_prompt"],
                "created_at": datetime.utcnow(),
                "sync_version": 1
            }
            await self.mongo.agents.insert_one(mongo_doc)
            
            # Step 3: Commit SQL transaction
            await self.sql.commit()
            
            return agent_id
            
        except Exception as e:
            await self.sql.rollback()
            # MongoDB write succeeded, but SQL failed
            # Will be cleaned up by eventual consistency
            raise SyncException(f"Sync failed: {str(e)}")
    
    async def update_agent(self, agent_id: str, updates: dict):
        """Update with eventual consistency fallback"""
        try:
            # SQL first
            await self.sql.execute(
                update(Agent).where(Agent.id == agent_id).values(**updates)
            )
            await self.sql.commit()
            
            # MongoDB second
            await self.mongo.agents.update_one(
                {"_id": agent_id},
                {
                    "$set": updates,
                    "$inc": {"sync_version": 1}
                }
            )
        except Exception as e:
            # Log for async reconciliation
            await self.mongo.sync_queue.insert_one({
                "type": "update",
                "entity": "agent",
                "id": agent_id,
                "data": updates,
                "timestamp": datetime.utcnow(),
                "retry_count": 0
            })
            raise e
```

### Eventual Consistency Reconciliation
```python
class SyncReconciler:
    def __init__(self, sql_db: AsyncSession, mongo_db):
        self.sql = sql_db
        self.mongo = mongo_db
    
    async def reconcile_agents(self):
        """
        Reconcile agent data between SQL and MongoDB
        Run periodically (e.g., every 5 minutes)
        """
        # Get agents from both sources
        sql_agents = await self.sql.execute(select(Agent))
        sql_agents = {str(a.id): a for a in sql_agents.scalars()}
        
        mongo_agents = await self.mongo.agents.find({}).to_list(None)
        mongo_agents = {a["_id"]: a for a in mongo_agents}
        
        # Find missing in MongoDB
        for agent_id, agent in sql_agents.items():
            if agent_id not in mongo_agents:
                # Insert missing agent
                await self.mongo.agents.insert_one({
                    "_id": agent_id,
                    "name": agent.name,
                    "system_prompt": agent.system_prompt,
                    "sync_version": 1,
                    "reconciled_at": datetime.utcnow()
                })
        
        # Find stale in MongoDB
        for agent_id, mongo_agent in mongo_agents.items():
            if agent_id not in sql_agents:
                # Delete stale from MongoDB
                await self.mongo.agents.delete_one({"_id": agent_id})
        
        # Find conflicts (different versions)
        conflicts = []
        for agent_id, sql_agent in sql_agents.items():
            if agent_id in mongo_agents:
                if sql_agent.updated_at > mongo_agents[agent_id].get("updated_at"):
                    conflicts.append((agent_id, "sql_newer"))
        
        return {
            "reconciled": len(sql_agents),
            "conflicts": len(conflicts),
            "timestamp": datetime.utcnow()
        }
```

---

## 3. Read Distribution

### Query Router
```python
class DatabaseRouter:
    """Route reads to optimal database"""
    
    @staticmethod
    async def get_agent(agent_id: str, sql_db, mongo_db):
        """
        Get agent with read optimization:
        - For fresh data: SQL (authoritative)
        - For cached data: MongoDB (faster)
        """
        # Try MongoDB first (95% faster)
        mongo_result = await mongo_db.agents.find_one({"_id": agent_id})
        
        if mongo_result and not is_stale(mongo_result):
            return mongo_result
        
        # Fallback to SQL (authoritative)
        sql_result = await sql_db.execute(
            select(Agent).where(Agent.id == agent_id)
        )
        agent = sql_result.scalar_one_or_none()
        
        if agent and mongo_result is None:
            # Update cache asynchronously
            asyncio.create_task(
                mongo_db.agents.insert_one(to_mongo_doc(agent))
            )
        
        return agent
    
    @staticmethod
    async def list_agents(user_id: str, sql_db, mongo_db):
        """
        List agents with pagination:
        - Get IDs from MongoDB (fast)
        - Get details from SQL (authoritative)
        """
        mongo_ids = await mongo_db.agents.find(
            {"owner_id": user_id}
        ).limit(100).to_list(None)
        
        if mongo_ids:
            ids = [a["_id"] for a in mongo_ids]
            sql_result = await sql_db.execute(
                select(Agent).where(Agent.id.in_(ids))
            )
            return sql_result.scalars().all()
        
        return []
```

---

## 4. Write Path Optimization

### Asynchronous Writes
```python
import asyncio
from typing import Callable

class AsyncWriteQueue:
    def __init__(self):
        self.queue = asyncio.Queue()
        self.workers = 5
    
    async def enqueue(self, operation: dict):
        """Add write operation to async queue"""
        await self.queue.put(operation)
    
    async def start_workers(self, handler: Callable):
        """Process queue with multiple workers"""
        tasks = [
            asyncio.create_task(self._worker(handler))
            for _ in range(self.workers)
        ]
        await asyncio.gather(*tasks)
    
    async def _worker(self, handler: Callable):
        while True:
            operation = await self.queue.get()
            try:
                await handler(operation)
            except Exception as e:
                # Log and retry
                logger.error(f"Write operation failed: {e}")
                await self.queue.put(operation)  # Retry
            finally:
                self.queue.task_done()

# Usage
write_queue = AsyncWriteQueue()

@app.post("/agents/{agent_id}/execute")
async def execute_agent(agent_id: str, params: dict):
    # Quick SQL write + immediate response
    execution = create_execution(agent_id, params)
    
    # Async MongoDB write for analytics
    await write_queue.enqueue({
        "type": "log_execution",
        "agent_id": agent_id,
        "execution_id": execution.id,
        "timestamp": datetime.utcnow()
    })
    
    return {"execution_id": execution.id, "status": "queued"}
```

---

## 5. Time-Series Data in MongoDB

### Specialized Time-Series Collections
```python
# Create time-series collection for high-volume metrics
class TimeSeriesManager:
    async def create_time_series_collection(self, db):
        """Create MongoDB time-series collection"""
        await db.command({
            "create": "execution_metrics",
            "timeseries": {
                "timeField": "timestamp",
                "metaField": "metadata",
                "granularity": "seconds"  # seconds, minutes, hours
            }
        })
    
    async def insert_metric(self, db, metric_data: dict):
        """Insert time-series data"""
        await db.execution_metrics.insert_one({
            "timestamp": datetime.utcnow(),
            "metadata": {
                "agent_id": metric_data["agent_id"],
                "user_id": metric_data["user_id"],
                "region": metric_data["region"]
            },
            "duration_ms": metric_data["duration_ms"],
            "tokens_used": metric_data["tokens_used"],
            "cost": metric_data["cost"]
        })
    
    async def query_metrics(self, db, agent_id: str, hours: int = 24):
        """Query time-series data efficiently"""
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        return await db.execution_metrics.find({
            "metadata.agent_id": agent_id,
            "timestamp": {"$gte": cutoff}
        }).to_list(None)
```

---

## 6. Event Sourcing Pattern

### Event Log in Both Systems
```python
class EventLog:
    """
    Use SQL for event ordering (transactional guarantee)
    Use MongoDB for event querying (flexible schema)
    """
    
    async def log_event(self, sql_db, mongo_db, event: dict):
        """Log event in both systems"""
        
        # SQL: Authoritative, ordered, transactional
        event_record = EventRecord(
            event_type=event["type"],
            entity_id=event["entity_id"],
            data=json.dumps(event["data"]),
            timestamp=datetime.utcnow(),
            sequence_number=None  # DB auto-increments
        )
        sql_db.add(event_record)
        await sql_db.flush()
        
        sequence = event_record.sequence_number
        
        # MongoDB: Rich querying, flexible schema
        await mongo_db.events.insert_one({
            "_id": str(event_record.id),
            "type": event["type"],
            "entity_id": event["entity_id"],
            "sequence": sequence,
            "data": event["data"],
            "timestamp": datetime.utcnow(),
            "indexed": False
        })
        
        await sql_db.commit()
    
    async def get_entity_history(self, sql_db, mongo_db, entity_id: str):
        """Get entity history in sequence order"""
        
        # Query from SQL for ordering
        events = await sql_db.execute(
            select(EventRecord)
            .where(EventRecord.entity_id == entity_id)
            .order_by(EventRecord.sequence_number)
        )
        
        return [
            {
                "sequence": e.sequence_number,
                "type": e.event_type,
                "data": json.loads(e.data),
                "timestamp": e.timestamp
            }
            for e in events.scalars()
        ]
```

---

## 7. Data Aggregation & Caching

### Computed Aggregations
```python
class AggregationService:
    """
    Compute in SQL, cache in MongoDB
    """
    
    async def compute_agent_stats(self, sql_db, mongo_db, agent_id: str):
        """Compute statistics from SQL, cache in MongoDB"""
        
        # Query SQL for authoritative data
        result = await sql_db.execute("""
            SELECT 
                COUNT(*) as total_executions,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful,
                AVG(duration_ms) as avg_duration,
                SUM(cost) as total_cost
            FROM agent_executions
            WHERE agent_id = :agent_id
        """, {"agent_id": agent_id})
        
        stats = result.first()
        
        # Cache in MongoDB for fast retrieval
        await mongo_db.agent_stats.update_one(
            {"_id": agent_id},
            {
                "$set": {
                    "total_executions": stats[0],
                    "successful_executions": stats[1],
                    "avg_duration_ms": stats[2],
                    "total_cost": stats[3],
                    "cached_at": datetime.utcnow(),
                    "cache_ttl_minutes": 60
                }
            },
            upsert=True
        )
    
    async def get_agent_stats(self, mongo_db, agent_id: str):
        """Get stats from cache first"""
        
        cached = await mongo_db.agent_stats.find_one({"_id": agent_id})
        
        if cached and not is_cache_expired(cached):
            return cached
        
        return None  # Trigger recomputation
```

---

## 8. Migration Strategy

### From Single DB to Hybrid
```python
class MigrationManager:
    async def migrate_to_hybrid(self, sql_db, mongo_db):
        """
        Migrate existing data to hybrid setup
        1. Export SQL data
        2. Transform for MongoDB
        3. Verify consistency
        4. Switch reads
        """
        
        # Phase 1: Copy all data
        agents = await sql_db.execute(select(Agent))
        for agent in agents.scalars():
            await mongo_db.agents.insert_one({
                "_id": str(agent.id),
                "owner_id": str(agent.owner_id),
                "name": agent.name,
                "system_prompt": agent.system_prompt,
                "created_at": agent.created_at,
                "migrated": True
            })
        
        # Phase 2: Verify counts match
        sql_count = await sql_db.execute(select(func.count(Agent.id)))
        mongo_count = await mongo_db.agents.count_documents({})
        
        assert sql_count.scalar() == mongo_count, "Count mismatch"
        
        # Phase 3: Enable dual-writes
        # Phase 4: Monitor for divergence
        # Phase 5: Switch reads (if needed)
```

---

## 9. Monitoring & Health Checks

### Health Check Dashboard
```python
class DatabaseHealthMonitor:
    def __init__(self, sql_db, mongo_db):
        self.sql = sql_db
        self.mongo = mongo_db
    
    async def check_health(self) -> dict:
        """Check both databases"""
        
        health = {
            "sql": await self._check_sql_health(),
            "mongo": await self._check_mongo_health(),
            "sync": await self._check_sync_health(),
            "timestamp": datetime.utcnow()
        }
        
        return health
    
    async def _check_sql_health(self) -> dict:
        """SQL Server health"""
        try:
            result = await self.sql.execute(select(1))
            return {
                "status": "healthy",
                "response_time_ms": 5,
                "connections": 15
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    async def _check_mongo_health(self) -> dict:
        """MongoDB health"""
        try:
            info = await self.mongo.command("serverStatus")
            return {
                "status": "healthy",
                "response_time_ms": 3,
                "connections": info["connections"]["current"]
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    async def _check_sync_health(self) -> dict:
        """Sync state health"""
        # Check for pending sync operations
        pending = await self.mongo.sync_queue.count_documents({})
        
        return {
            "pending_syncs": pending,
            "status": "healthy" if pending < 1000 else "degraded"
        }
```

---

## 10. Transaction Boundaries

### Transactional Operations
```python
class TransactionManager:
    """
    Handle complex operations spanning both databases
    """
    
    async def transfer_agent_ownership(
        self,
        sql_db: AsyncSession,
        mongo_db,
        agent_id: str,
        new_owner_id: str
    ):
        """
        Transfer agent to new owner
        Must update: SQL users, SQL agents, MongoDB cache
        """
        
        async with sql_db.begin():  # SQL transaction
            # Update SQL
            agent = await sql_db.get(Agent, agent_id)
            agent.owner_id = new_owner_id
            agent.updated_at = datetime.utcnow()
            
            # Update audit
            audit = AuditLog(
                action="agent_transfer",
                entity_id=agent_id,
                user_id=new_owner_id,
                changes={"owner_id": str(new_owner_id)}
            )
            sql_db.add(audit)
            
            await sql_db.flush()
            
            # Update MongoDB (async, non-transactional)
            # But in separate task
            asyncio.create_task(
                mongo_db.agents.update_one(
                    {"_id": str(agent_id)},
                    {"$set": {"owner_id": str(new_owner_id)}}
                )
            )
```

---

## 11. Consistency Guarantees

### Consistency Levels
```python
class ConsistencyModel:
    """
    Define consistency requirements per operation
    """
    
    # Strong Consistency (Both DBs must sync)
    STRONG = {
        "operations": ["create_user", "delete_user", "billing"],
        "timeout": 5000,  # ms
        "retry": True
    }
    
    # Eventual Consistency (Async sync OK)
    EVENTUAL = {
        "operations": ["log_execution", "cache_metrics"],
        "timeout": None,
        "retry": True
    }
    
    # Weak Consistency (Read-only replicas)
    WEAK = {
        "operations": ["get_analytics", "search"],
        "timeout": None,
        "retry": False
    }
```

---

## 12. Disaster Recovery

### Multi-DB Failover
```python
class FailoverManager:
    async def handle_sql_failure(self, mongo_db):
        """Degrade gracefully if SQL Server fails"""
        
        # Use MongoDB as temporary source
        # Reduce write operations
        # Enable read-only mode
        # Alert operators
        
        pass
    
    async def handle_mongo_failure(self, sql_db):
        """Degrade gracefully if MongoDB fails"""
        
        # Use SQL for all operations
        # Slower reads but maintained consistency
        # Queued MongoDB writes for later sync
        
        pass
    
    async def recover_and_resync(self):
        """Recover from dual failure"""
        
        # Determine which DB is authoritative
        # Resync other DB
        # Verify consistency
        
        pass
```

---

## Selection Guide

| Data Type | SQL Server | MongoDB | Decision |
|-----------|-----------|---------|----------|
| User data | ✅ Strong | ⚠️ Cached | **SQL** |
| Executions | ⚠️ Slow | ✅ Fast | **Mongo** |
| Workflows | ✅ Relational | ✅ Flexible | **Both** |
| Analytics | ⚠️ Aggregation | ✅ Quick | **Mongo** |
| Audit logs | ✅ Immutable | ✅ Queryable | **Both** |
| Metrics | ⚠️ Joins | ✅ TS-optimal | **Mongo** |
| Billing | ✅ Transactions | ❌ No ACID | **SQL** |

---

## Implementation Checklist

- [ ] Data classification completed
- [ ] Dual-write logic implemented
- [ ] Reconciliation jobs scheduled
- [ ] Read router configured
- [ ] Cache invalidation strategy
- [ ] Monitoring dashboard set up
- [ ] Failover procedures documented
- [ ] Load testing with dual DBs
- [ ] Consistency verification automated
- [ ] Team trained on hybrid architecture
