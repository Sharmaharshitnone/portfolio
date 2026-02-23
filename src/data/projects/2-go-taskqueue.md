---
title: "Async Task Queue — Go"
description: "High-throughput async job processor using Go routines and Redis Streams."
longDescription: "A production-grade async task queue built in Go with Redis Streams as the backing store. Supports consumer groups, dead-letter queues, exponential backoff retries, and a Prometheus metrics endpoint."
techStack: ["Go", "Redis", "Prometheus", "Docker"]
stars: 87
forks: 21
github: "https://github.com/harshit/go-taskqueue"
featured: true
category: "systems"
order: 2
---

Redis Streams enables **consumer group semantics** — multiple workers can each claim an entry, and unacknowledged entries flow to a Dead Letter Queue.
