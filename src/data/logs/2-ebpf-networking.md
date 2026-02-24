---
title: "eBPF for Network Observability: A Practical Guide"
summary: "Using eBPF to build kernel-level network monitoring without modifying application code. Attaching to tcp_sendmsg/tcp_recvmsg kprobes for per-process TCP throughput metrics with under 2% CPU overhead."
type: "project"
tags: ["linux", "ebpf", "networking", "observability"]
mood: "learning"
hoursWorked: 3
pubDate: 2026-02-05
---

How we used eBPF to build kernel-level network monitoring without modifying application code.

The key insight was attaching to `tcp_sendmsg` and `tcp_recvmsg` kprobes:

```c
SEC("kprobe/tcp_sendmsg")
int BPF_KPROBE(tcp_sendmsg, struct sock *sk, struct msghdr *msg, size_t size) {
    struct event_t event = {};
    event.pid = bpf_get_current_pid_tgid() >> 32;
    event.bytes = size;
    bpf_get_current_comm(&event.comm, sizeof(event.comm));
    events.perf_submit(ctx, &event, sizeof(event));
    return 0;
}
```

This gives us per-process TCP throughput metrics with zero application changes. The overhead is measurable but negligible — under 2% CPU on our busiest nodes.
