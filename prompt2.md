You are a Senior Database Administrator designing MongoDB collections.

TASK: Design flexible document structure for caching and analytics

COLLECTIONS:
1. agents (cached copies of SQL data + stats)
   {
     _id: ObjectId,
     agent_id: String,
     name: String,
     config: Object,
     stats: {
       total_executions: Number,
       avg_duration_ms: Number,
       success_rate: Number
     }
   }

2. execution_logs (high-volume execution history)
   {
     _id: ObjectId,
     agent_id: ObjectId,
     status: String,
     input: Object,
     output: Object,
     duration_ms: Number,
     started_at: ISODate,
     execution_trace: [Object]
   }

3. execution_metrics (time-series optimized)
   {
     timestamp: ISODate,
     metadata: {agent_id: String},
     duration_ms: Number,
     tokens_used: Number,
     cost: Number
   }

4. workflow_definitions (flexible schema)
   {
     _id: ObjectId,
     name: String,
     definition: Object,
     created_at: ISODate
   }

INDEXES:
- Single: email, username, agent_id
- Compound: (agent_id, started_at)
- TTL: auto-delete old logs after 90 days

OUTPUT FORMAT:
{
  "collections": [
    {
      "name": "agents",
      "schema": {...},
      "indexes": [...]
    }
  ]
}