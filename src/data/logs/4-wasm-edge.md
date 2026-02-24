---
title: "WebAssembly at the Edge: Running Rust in Cloudflare Workers"
type: "project"
tags: ["wasm", "rust", "edge-compute", "cloudflare"]
mood: "breakthrough"
hoursWorked: 5
pubDate: 2026-01-08
---

Benchmarking Rust-compiled WASM modules in edge compute environments.

The compilation pipeline is straightforward:

```bash
cargo build --target wasm32-unknown-unknown --release
wasm-opt -O3 -o optimized.wasm target/wasm32-unknown-unknown/release/module.wasm
```

Key findings:
- Cold start: 2.3ms (vs 50ms+ for Node.js workers)
- Memory: 128KB baseline (vs 2MB+ for V8 isolates)
- Throughput: 12,000 req/sec per worker at p99 < 5ms

The limitation is no direct socket access — everything goes through the Fetch API. But for compute-heavy edge logic, WASM is unbeatable.
