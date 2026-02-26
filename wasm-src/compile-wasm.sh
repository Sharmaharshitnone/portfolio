#!/usr/bin/env bash
# compile-wasm.sh — Compile C++ algorithm solutions to WebAssembly.
#
# Usage:
#   ./wasm-src/compile-wasm.sh two-sum     # Compile single solution
#   ./wasm-src/compile-wasm.sh --all       # Compile all solutions
#
# Requires: Emscripten SDK (emcc) in PATH
# Output: public/wasm/{name}.wasm

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC_DIR="$SCRIPT_DIR"
OUT_DIR="$REPO_ROOT/public/wasm"

# Ensure output directory exists
mkdir -p "$OUT_DIR"

# Emscripten flags for minimal Wasm output:
# -O2: Size/speed balance
# --no-entry: No main() needed
# -s STANDALONE_WASM: Don't require JS glue
# -s TOTAL_MEMORY: 1MB — enough for competitive programming
# -s EXPORTED_FUNCTIONS: Only expose the shim API
EMCC_FLAGS=(
    -O2
    --no-entry
    -s "STANDALONE_WASM=1"
    -s "TOTAL_MEMORY=1048576"
    -s "EXPORTED_FUNCTIONS=[\"_solve\",\"_alloc\",\"_dealloc\",\"_get_output_ptr\",\"_get_output_len\"]"
    -s "EXPORTED_RUNTIME_METHODS=[]"
    -s "ERROR_ON_UNDEFINED_SYMBOLS=0"
    "-I$SRC_DIR"
)

compile_one() {
    local name="$1"
    local src="$SRC_DIR/$name.cpp"
    local out="$OUT_DIR/$name.wasm"

    if [[ ! -f "$src" ]]; then
        echo "ERROR: Source file not found: $src" >&2
        return 1
    fi

    echo "Compiling $name..."
    emcc "${EMCC_FLAGS[@]}" "$src" -o "$out"

    local size
    size=$(wc -c < "$out")
    echo "  -> $out ($size bytes)"
}

if [[ "${1:-}" == "--all" ]]; then
    for src in "$SRC_DIR"/*.cpp; do
        name="$(basename "$src" .cpp)"
        # Skip the shim header test files
        [[ "$name" == "wasm_shim" ]] && continue
        compile_one "$name"
    done
    echo "Done. All solutions compiled."
elif [[ -n "${1:-}" ]]; then
    compile_one "$1"
else
    echo "Usage: $0 <solution-name> | --all" >&2
    echo "Example: $0 two-sum" >&2
    exit 1
fi
