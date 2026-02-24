---
title: "My Neovim Setup for Rust Development in 2026"
type: "daily"
tags: ["neovim", "rust", "tooling", "dx"]
mood: "productive"
hoursWorked: 2
pubDate: 2026-01-23
---

A walkthrough of my Neovim configuration optimized for Rust development.

The core of my setup is `rust-analyzer` with custom clippy settings:

```lua
require("lspconfig").rust_analyzer.setup({
    settings = {
        ["rust-analyzer"] = {
            check = { command = "clippy", allTargets = true },
            cargo = { allFeatures = true },
            procMacro = { enable = true },
        },
    },
})
```

Combined with `nvim-dap` for debugging and `crates.nvim` for dependency management, this gives me a workflow that rivals any IDE.
