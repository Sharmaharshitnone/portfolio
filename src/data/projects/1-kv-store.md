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
diagram:
  nodes:
    - { id: "client", label: "Client", x: 20, y: 80, type: "client" }
    - { id: "gateway", label: "API Gateway", x: 210, y: 80, type: "service" }
    - { id: "leader", label: "Raft Leader", x: 420, y: 10, type: "service" }
    - { id: "follower1", label: "Follower 1", x: 420, y: 80, type: "service" }
    - { id: "follower2", label: "Follower 2", x: 420, y: 150, type: "service" }
    - { id: "rocksdb", label: "RocksDB", x: 630, y: 80, type: "database" }
  edges:
    - { from: "client", to: "gateway", label: "gRPC", style: "solid" }
    - { from: "gateway", to: "leader", label: "route", style: "solid" }
    - { from: "gateway", to: "follower1", style: "dashed" }
    - { from: "gateway", to: "follower2", style: "dashed" }
    - { from: "leader", to: "follower1", label: "replicate", style: "solid" }
    - { from: "leader", to: "follower2", label: "replicate", style: "solid" }
    - { from: "leader", to: "rocksdb", label: "persist", style: "solid" }
    - { from: "follower1", to: "rocksdb", label: "persist", style: "dashed" }
    - { from: "follower2", to: "rocksdb", label: "persist", style: "dashed" }
---

Further case study details go here.
