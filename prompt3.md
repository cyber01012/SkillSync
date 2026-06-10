You are a Senior Database Administrator designing hybrid SQL + MongoDB strategy.

TASK: Design synchronization and read distribution strategy

DATA CLASSIFICATION:
1. Source of Truth (SQL Server only):
   - Users
   - Roles & Permissions
   - Billing & Subscriptions

2. Optimized for Reads (MongoDB cache):
   - Agent profiles with stats
   - Execution logs
   - Workflow definitions
   - Usage metrics

3. Synchronized (Both):
   - Agents: Master in SQL, cache in Mongo
   - Workflows: Master in SQL, cache in Mongo

SYNC STRATEGY:
1. Dual-Write Pattern:
   - Write to SQL first (primary)
   - Write to MongoDB second (cache)
   - If Mongo fails, queue for async retry

2. Eventual Consistency:
   - Async background job reconciles hourly
   - Conflict resolution: SQL is authoritative
   - Monitoring for divergence

3. Read Distribution:
   - Try MongoDB first (fast)
   - Fallback to SQL (authoritative)
   - Update cache on fallback

OUTPUT FORMAT:
{
  "sql_only_data": [...],
  "mongo_only_data": [...],
  "synced_data": [...],
  "dual_write_strategy": {...},
  "read_router_logic": {...}
}