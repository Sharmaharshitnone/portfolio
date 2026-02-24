---
title: "Async Task Queue — Go"
description: "High-throughput async job processor using Go routines and Redis Streams with dead-letter queues."
techStack: ["Go", "Redis", "Prometheus", "Docker"]
githubUrl: "https://github.com/harshit/go-taskqueue"
featured: true
category: "backend"
status: "active"
pubDate: 2025-06-15
problem: "Need a lightweight task queue without Kafka/RabbitMQ operational overhead."
solution: "Built on Redis Streams with consumer groups, exponential backoff retries, and Prometheus metrics."
challenges:
  - "Implementing exactly-once delivery with idempotency keys"
  - "Graceful shutdown draining in-flight jobs"
outcomes:
  - "87 GitHub stars"
  - "50k jobs/sec throughput on single node"
---

Redis Streams enables **consumer group semantics** — multiple workers can each claim an entry, and unacknowledged entries flow to a Dead Letter Queue.
