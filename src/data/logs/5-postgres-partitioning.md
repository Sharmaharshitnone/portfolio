---
title: "PostgreSQL Partitioning: Lessons from 10B Rows"
summary: "Partitioning a 10 billion row PostgreSQL table. Naive range-by-date partitioning hit pruning limits. The real win: composite partitioning (hash by tenant_id × range by date) — p99 dropped from 2.3s to 45ms."
type: "weekly"
tags: ["postgres", "database", "performance", "scaling"]
mood: "learning"
hoursWorked: 6
pubDate: 2025-12-22
---

What we learned partitioning a 10 billion row PostgreSQL table.

The naive approach — range partitioning by date — worked until we hit the partition pruning limits:

```sql
CREATE TABLE events (
    id bigserial,
    created_at timestamptz NOT NULL,
    tenant_id uuid NOT NULL,
    payload jsonb
) PARTITION BY RANGE (created_at);

-- Monthly partitions
CREATE TABLE events_2025_01 PARTITION OF events
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

The real win came from composite partitioning: first by tenant_id (hash, 16 partitions), then by date (range, monthly). This reduced our p99 query time from 2.3s to 45ms.


```sql
CREATE TABLE events (
    id bigserial,
    created_at timestamptz NOT NULL,
    tenant_id uuid NOT NULL,
    payload jsonb
) PARTITION BY RANGE (created_at);

```
