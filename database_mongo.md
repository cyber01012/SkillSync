# Database: MongoDB Architecture
**Role:** Senior Database Administrator | NoSQL Specialist

---

## 1. Connection & Configuration

### Connection Setup
```python
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.asynchronous import AsyncMongoClient
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Connection URI
MONGODB_URL = os.getenv(
    "MONGODB_URL",
    "mongodb://localhost:27017/anttigravity?retryWrites=true&w=majority"
)

# Using Motor for async operations with FastAPI
client = AsyncIOMotorClient(MONGODB_URL)
db = client.anttigravity

# Connection pool configuration
client_options = {
    "maxPoolSize": 50,
    "minPoolSize": 10,
    "maxIdleTimeMS": 45000,
    "serverSelectionTimeoutMS": 5000,
    "socketTimeoutMS": 45000,
    "retryWrites": True,
    "w": "majority",  # Write concern: wait for majority
}

client = AsyncIOMotorClient(MONGODB_URL, **client_options)
```

---

## 2. Document Schema Design

### Collections Structure
```javascript
// Users Collection
db.users.insertMany([{
    _id: ObjectId(),
    username: String,
    email: String,
    password_hash: String,
    full_name: String,
    role: String,  // "admin", "manager", "user"
    is_active: Boolean,
    created_at: ISODate(),
    updated_at: ISODate(),
    last_login: ISODate(),
    preferences: {
        theme: String,
        notifications_enabled: Boolean,
        language: String
    },
    metadata: Object
}])

// Agents Collection (Denormalized for performance)
db.agents.insertMany([{
    _id: ObjectId(),
    owner_id: ObjectId(),
    name: String,
    description: String,
    system_prompt: String,
    model: String,
    temperature: Number,
    max_tokens: Number,
    is_active: Boolean,
    version: Number,
    created_at: ISODate(),
    updated_at: ISODate(),
    tags: [String],
    config: {
        // Flexible schema for agent configuration
        tools: [String],
        memory_type: String,
        learning_enabled: Boolean,
        custom_fields: Object
    },
    // Statistics (denormalized for quick access)
    stats: {
        total_executions: Number,
        successful_executions: Number,
        avg_duration_ms: Number,
        total_cost: Number,
        last_execution: ISODate()
    }
}])

// Agent Executions Collection (Time-series optimized)
db.agent_executions.insertMany([{
    _id: ObjectId(),
    agent_id: ObjectId(),
    user_id: ObjectId(),
    status: String,  // "pending", "running", "completed", "failed"
    input: Object,
    output: Object,
    error: String,
    duration_ms: Number,
    tokens_used: Number,
    cost: Number,
    started_at: ISODate(),
    completed_at: ISODate(),
    execution_trace: [
        {
            step: Number,
            action: String,
            timestamp: ISODate(),
            duration_ms: Number,
            result: Object
        }
    ],
    metadata: Object
}])

// Workflows Collection
db.workflows.insertMany([{
    _id: ObjectId(),
    owner_id: ObjectId(),
    name: String,
    description: String,
    definition: {
        steps: [
            {
                id: String,
                name: String,
                agent_id: ObjectId,
                tool_name: String,
                conditions: Object,
                retry_policy: Object
            }
        ],
        entry_point: String,
        exit_points: [String],
        variables: Object
    },
    is_active: Boolean,
    version: Number,
    created_at: ISODate(),
    updated_at: ISODate()
}])

// Workflow Executions Collection
db.workflow_executions.insertMany([{
    _id: ObjectId(),
    workflow_id: ObjectId(),
    user_id: ObjectId(),
    status: String,
    execution_trace: [Object],
    started_at: ISODate(),
    completed_at: ISODate(),
    duration_ms: Number,
    steps_executed: [
        {
            step_id: String,
            result: Object,
            duration_ms: Number
        }
    ]
}])

// Audit Log Collection (Capped for automatic size management)
db.createCollection("audit_logs", {
    capped: true,
    size: 1073741824,  // 1GB
    max: 1000000  // Maximum documents
})

db.audit_logs.insertMany([{
    _id: ObjectId(),
    user_id: ObjectId(),
    action: String,
    entity_type: String,
    entity_id: ObjectId,
    changes: Object,
    timestamp: ISODate(),
    ip_address: String
}])
```

---

## 3. Indexing Strategy

### Index Creation
```python
class MongoIndexManager:
    def __init__(self, db):
        self.db = db
    
    async def create_indexes(self):
        """Create all necessary indexes"""
        
        # Users collection indexes
        await self.db.users.create_index("email", unique=True)
        await self.db.users.create_index("username", unique=True)
        await self.db.users.create_index("created_at", direction=DESCENDING)
        
        # Agents collection indexes
        await self.db.agents.create_index([
            ("owner_id", ASCENDING),
            ("is_active", ASCENDING)
        ])
        await self.db.agents.create_index(
            "created_at",
            direction=DESCENDING
        )
        await self.db.agents.create_index("tags")  # For tag-based search
        
        # Agent Executions (time-series)
        await self.db.agent_executions.create_index([
            ("agent_id", ASCENDING),
            ("started_at", DESCENDING)
        ])
        await self.db.agent_executions.create_index("status")
        await self.db.agent_executions.create_index(
            "started_at",
            expireAfterSeconds=7776000  # TTL: 90 days
        )
        
        # Workflows
        await self.db.workflows.create_index([
            ("owner_id", ASCENDING),
            ("is_active", ASCENDING)
        ])
        
        # Text indexes for search
        await self.db.agents.create_index([
            ("name", "text"),
            ("description", "text")
        ])
        
        # Audit logs
        await self.db.audit_logs.create_index([
            ("user_id", ASCENDING),
            ("timestamp", DESCENDING)
        ])

# Usage
index_manager = MongoIndexManager(db)
await index_manager.create_indexes()
```

### Index Analysis
```python
async def analyze_indexes(collection_name: str):
    """Get index statistics"""
    stats = await db[collection_name].aggregate([
        {"$indexStats": {}}
    ]).to_list(None)
    return stats
```

---

## 4. Query Optimization

### Aggregation Pipeline Patterns
```python
class AgentQueries:
    @staticmethod
    async def get_user_agents_with_stats(user_id: ObjectId, db):
        """Get agents with execution statistics"""
        pipeline = [
            {"$match": {"owner_id": user_id, "is_active": True}},
            {
                "$lookup": {
                    "from": "agent_executions",
                    "let": {"agent_id": "$_id"},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {"$eq": ["$agent_id", "$$agent_id"]},
                                "created_at": {
                                    "$gte": datetime.now() - timedelta(days=30)
                                }
                            }
                        },
                        {
                            "$group": {
                                "_id": None,
                                "count": {"$sum": 1},
                                "avg_duration": {"$avg": "$duration_ms"},
                                "total_cost": {"$sum": "$cost"}
                            }
                        }
                    ],
                    "as": "execution_stats"
                }
            },
            {
                "$project": {
                    "name": 1,
                    "description": 1,
                    "created_at": 1,
                    "stats": {
                        "$cond": [
                            {"$gt": [{"$size": "$execution_stats"}, 0]},
                            {"$arrayElemAt": ["$execution_stats", 0]},
                            {"count": 0, "avg_duration": 0, "total_cost": 0}
                        ]
                    }
                }
            },
            {"$sort": {"created_at": -1}}
        ]
        return await db.agents.aggregate(pipeline).to_list(None)
    
    @staticmethod
    async def search_agents(query: str, user_id: ObjectId, db):
        """Full-text search"""
        pipeline = [
            {
                "$match": {
                    "$text": {"$search": query},
                    "owner_id": user_id
                }
            },
            {
                "$addFields": {
                    "score": {"$meta": "textScore"}
                }
            },
            {"$sort": {"score": {"$meta": "textScore"}}},
            {"$limit": 20}
        ]
        return await db.agents.aggregate(pipeline).to_list(None)
```

### Query Performance Analysis
```python
async def explain_query(collection_name: str, query: dict, db):
    """Get query execution plan"""
    collection = db[collection_name]
    explanation = await collection.find(query).explain()
    return explanation

# Check if query uses index
if explanation["executionStats"]["executionStages"]["stage"] != "COLLSCAN":
    print("✓ Using index efficiently")
else:
    print("✗ Full collection scan - index needed")
```

---

## 5. Data Modeling Patterns

### Embedding vs. Referencing
```javascript
// PATTERN 1: Embedding (for frequently accessed related data)
// Good for: Agent with its recent executions
{
    _id: ObjectId(),
    name: "DataAnalyst",
    // Embed only recent executions
    recent_executions: [
        {
            _id: ObjectId(),
            status: "completed",
            output: {...},
            timestamp: ISODate()
        }
    ]
}

// PATTERN 2: Referencing (for large or frequently updated data)
// Good for: Agent with all historical executions
{
    _id: ObjectId(),
    name: "DataAnalyst",
    execution_ids: [ObjectId(), ObjectId(), ...]
}

// PATTERN 3: Hybrid (Subset + Reference)
// Good for: Agent with stats + link to full history
{
    _id: ObjectId(),
    name: "DataAnalyst",
    stats: {
        total_executions: 1000,
        avg_duration_ms: 4500,
        success_rate: 0.98
    },
    recent_executions: [
        {
            _id: ObjectId(),
            timestamp: ISODate()
        }
    ]
}
```

---

## 6. Write Concerns & Durability

### Write Concern Configuration
```python
from pymongo import WriteConcern

# Acknowledge write after majority confirmation
client = AsyncIOMotorClient(
    MONGODB_URL,
    write_concern=WriteConcern(w="majority", j=True, wtimeout=5000)
)

# For critical operations (transactions)
critical_operations = db.agents.with_options(
    write_concern=WriteConcern(w="majority", j=True)
)

# For bulk operations
bulk_operations = db.audit_logs.with_options(
    write_concern=WriteConcern(w=1)  # Faster, less durable
)
```

---

## 7. Transactions

### Multi-Document Transactions
```python
from pymongo.errors import OperationFailure

async def create_agent_with_workflow(agent_data, workflow_data):
    async with await client.start_session() as session:
        async with session.start_transaction():
            try:
                # Insert agent
                agent_result = await db.agents.insert_one(agent_data, session=session)
                agent_id = agent_result.inserted_id
                
                # Insert workflow
                workflow_data["agent_id"] = agent_id
                await db.workflows.insert_one(workflow_data, session=session)
                
                # Insert audit log
                await db.audit_logs.insert_one({
                    "action": "created_agent_with_workflow",
                    "entity_id": agent_id,
                    "timestamp": datetime.utcnow()
                }, session=session)
                
                # Transaction commits on context exit
            except OperationFailure as e:
                # Automatic rollback
                raise e
```

---

## 8. Backup & Restore

### Backup Strategy
```bash
#!/bin/bash

# Full backup
mongodump \
    --uri="mongodb://user:password@localhost:27017/anttigravity" \
    --out=/backups/anttigravity_$(date +%Y%m%d_%H%M%S) \
    --gzip \
    --archive=/backups/anttigravity_$(date +%Y%m%d_%H%M%S).archive

# Point-in-time backup (requires oplog)
mongodump \
    --uri="mongodb://..." \
    --oplogReplay \
    --out=/backups/pit_backup

# Restore from backup
mongorestore \
    --uri="mongodb://localhost:27017/anttigravity" \
    --archive=/backups/anttigravity_backup.archive \
    --gzip
```

---

## 9. Security

### Role-Based Access Control
```javascript
// Create read-only user
db.createUser({
    user: "reader",
    pwd: "password",
    roles: [
        {role: "read", db: "anttigravity"}
    ]
})

// Create admin user
db.createUser({
    user: "admin",
    pwd: "password",
    roles: [
        {role: "dbOwner", db: "anttigravity"},
        {role: "readWriteAnyDatabase", db: "admin"}
    ]
})

// Create application user (minimal privileges)
db.createUser({
    user: "app",
    pwd: "password",
    roles: [
        {role: "readWrite", db: "anttigravity"}
    ]
})
```

### Field-Level Encryption
```python
from pymongo import MongoClient
from pymongo.encryption import ClientEncryption
from pymongo.encryption_shared import Algorithm

# Define schema
json_schema = {
    "properties": {
        "password_hash": {
            "encrypt": {
                "keyId": [ObjectId("...")],
                "algorithm": "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic",
                "contentType": "binary"
            }
        }
    }
}

# Create client with encryption
client = MongoClient(
    uri=MONGODB_URL,
    auto_encryption_opts=AutoEncryptionOpts(
        key_vault_namespace="admin.keyvault",
        kms_providers={"local": {"key": os.urandom(96)}}
    )
)
```

---

## 10. Replication

### Replica Set Configuration
```javascript
// Initialize replica set
rs.initiate({
    _id: "rs0",
    members: [
        {_id: 0, host: "mongo-primary:27017"},
        {_id: 1, host: "mongo-secondary-1:27017"},
        {_id: 2, host: "mongo-secondary-2:27017"}
    ]
})

// Check replica set status
rs.status()

// Step down primary (for maintenance)
rs.stepDown()
```

---

## 11. Sharding (for scale)

### Shard Key Selection
```javascript
// Good shard key: owner_id (for tenant isolation)
// High cardinality + distributed writes
db.agents.ensureIndex({owner_id: 1})

sh.shardCollection("anttigravity.agents", {owner_id: 1})

// Check shard distribution
db.agents.aggregate([
    {$group: {_id: "$owner_id", count: {$sum: 1}}},
    {$sort: {count: -1}}
])
```

---

## 12. Monitoring

### Key Metrics to Monitor
```python
class MongoMonitoring:
    @staticmethod
    async def get_server_stats(db):
        """Get server statistics"""
        stats = await db.command("serverStatus")
        return {
            "connections": stats["connections"],
            "operations": stats["opcounters"],
            "memory": stats["mem"],
            "uptime_hours": stats["uptime"] / 3600
        }
    
    @staticmethod
    async def get_collection_stats(collection_name: str, db):
        """Get collection statistics"""
        stats = await db.command("collStats", collection_name)
        return {
            "document_count": stats["count"],
            "avg_document_size": stats["avgObjSize"],
            "total_size_mb": stats["size"] / (1024**2),
            "index_count": len(stats["indexSizes"])
        }
    
    @staticmethod
    async def check_slow_queries(db):
        """Check slow query log"""
        profile = await db.system.profile.find({
            "millis": {"$gt": 100}
        }).sort("ts", -1).limit(10).to_list(None)
        return profile
```

---

## 13. TTL Indexes (Auto-deletion)

### Automatic Data Cleanup
```python
# Delete old execution records automatically (90 days)
await db.agent_executions.create_index(
    "created_at",
    expireAfterSeconds=7776000  # 90 days
)

# Delete old audit logs automatically (1 year)
await db.audit_logs.create_index(
    "timestamp",
    expireAfterSeconds=31536000  # 1 year
)

# Delete temporary workflow executions after 30 days
await db.workflow_executions.create_index(
    "created_at",
    expireAfterSeconds=2592000
)
```

---

## 14. Bulk Operations

### Efficient Bulk Updates
```python
from pymongo import UpdateOne, InsertOne, DeleteOne

async def bulk_update_agent_stats(agent_ids: List[ObjectId], db):
    """Update stats for multiple agents efficiently"""
    operations = []
    
    for agent_id in agent_ids:
        operations.append(
            UpdateOne(
                {"_id": agent_id},
                {
                    "$inc": {"stats.total_executions": 1},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )
        )
    
    if operations:
        result = await db.agents.bulk_write(operations, ordered=False)
        return {
            "modified": result.modified_count,
            "matched": result.matched_count
        }
```

---

## 15. Schema Validation

### Document Validation
```javascript
// Create collection with schema validation
db.createCollection("agents", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["owner_id", "name", "system_prompt"],
            properties: {
                _id: {bsonType: "objectId"},
                owner_id: {bsonType: "objectId"},
                name: {
                    bsonType: "string",
                    minLength: 1,
                    maxLength: 255
                },
                temperature: {
                    bsonType: "double",
                    minimum: 0,
                    maximum: 2
                },
                is_active: {bsonType: "bool"},
                created_at: {bsonType: "date"},
                tags: {
                    bsonType: "array",
                    items: {bsonType: "string"}
                }
            }
        }
    }
})

// Update validation schema
db.runCommand({
    collMod: "agents",
    validator: {...}
})
```

---

## DBA Checklist

- [ ] Connection pooling configured
- [ ] All indexes created and analyzed
- [ ] Replication set up (if using)
- [ ] Backup schedule configured
- [ ] TTL indexes for auto-cleanup
- [ ] Security roles created
- [ ] Monitoring alerts set up
- [ ] Transaction support tested
- [ ] Query performance baselined
- [ ] Sharding plan (if needed)
- [ ] Encryption configured
- [ ] Documentation complete
