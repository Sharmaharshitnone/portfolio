---
title: "Implementing Raft Consensus from Scratch in Rust"
type: "project"
tags: ["rust", "distributed-systems", "raft"]
mood: "productive"
hoursWorked: 4
pubDate: 2026-02-18
---

A deep dive into building a production-grade distributed key-value store. Today I focused on leader election and heartbeat mechanisms using Tokio's async primitives.

```rust
pub async fn start_election(&mut self) {
    self.state = NodeState::Candidate;
    self.current_term += 1;
    // ...
}
```
