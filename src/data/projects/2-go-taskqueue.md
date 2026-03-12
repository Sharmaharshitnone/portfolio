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
diagram:
  nodes:
    - { id: "producer", label: "Producer", x: 20, y: 60, type: "client" }
    - { id: "redis", label: "Redis Streams", x: 210, y: 60, type: "queue" }
    - { id: "consumer", label: "Consumer Grp", x: 420, y: 10, type: "service" }
    - { id: "worker", label: "Worker Pool", x: 420, y: 120, type: "service" }
    - { id: "dlq", label: "Dead Letter Q", x: 630, y: 120, type: "queue" }
    - { id: "metrics", label: "Prometheus", x: 630, y: 10, type: "external" }
  edges:
    - { from: "producer", to: "redis", label: "XADD", style: "solid" }
    - { from: "redis", to: "consumer", label: "XREADGROUP", style: "solid" }
    - { from: "consumer", to: "worker", label: "dispatch", style: "solid" }
    - { from: "worker", to: "redis", label: "XACK", style: "dashed" }
    - { from: "worker", to: "dlq", label: "max retries", style: "dashed" }
    - { from: "worker", to: "metrics", label: "expose", style: "dashed" }
---

Redis Streams enables **consumer group semantics** — multiple workers can each claim an entry, and unacknowledged entries flow to a Dead Letter Queue.
