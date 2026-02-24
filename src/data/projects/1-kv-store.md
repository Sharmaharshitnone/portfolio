---
title: "Distributed KV Store"
description: "Raft-based distributed key-value store with consistent hashing and gRPC inter-node communication."
techStack: ["Rust", "Raft", "gRPC", "Tokio", "RocksDB"]
githubUrl: "https://github.com/harshit/distributed-kv"
featured: true
category: "systems"
status: "active"
pubDate: 2025-08-01
problem: "Existing KV stores lack educational transparency into consensus internals."
solution: "Built Raft from scratch in Rust with snapshotting, consistent hashing, and gRPC transport."
challenges:
  - "Implementing log compaction without blocking reads"
  - "Handling split-brain scenarios during network partitions"
outcomes:
  - "234 GitHub stars"
  - "Sub-5ms read latency at 10k QPS"
---

Further case study details go here.
