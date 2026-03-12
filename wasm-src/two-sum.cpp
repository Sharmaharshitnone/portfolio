/**
 * two-sum.cpp — WebAssembly-compatible Two Sum solution.
 *
 * Uses wasm_shim.h for I/O instead of iostream.
 *
 * Input format:
 *   n target
 *   a1 a2 ... an
 *
 * Output format:
 *   idx1 idx2
 *
 * Compile: emcc two-sum.cpp -O2 -s EXPORTED_FUNCTIONS='["_solve","_alloc","_dealloc","_get_output_ptr","_get_output_len"]' \
 *          -s EXPORTED_RUNTIME_METHODS='[]' --no-entry -o ../../public/wasm/two-sum.wasm
 */
#include "wasm_shim.h"

// Simple hash map (open addressing, power-of-2 size)
// Avoids pulling in <unordered_map> which bloats Wasm binary
struct HashMap {
    static const int CAPACITY = 32768; // Must be power of 2
    int keys[CAPACITY];
    int vals[CAPACITY];
    bool used[CAPACITY];

    void clear() {
        for (int i = 0; i < CAPACITY; i++) used[i] = false;
    }

    int find(int key) const {
        int h = ((unsigned int)key * 2654435761u) & (CAPACITY - 1);
        while (used[h]) {
            if (keys[h] == key) return vals[h];
            h = (h + 1) & (CAPACITY - 1);
        }
        return -1; // Not found
    }

    void insert(int key, int val) {
        int h = ((unsigned int)key * 2654435761u) & (CAPACITY - 1);
        while (used[h] && keys[h] != key) {
            h = (h + 1) & (CAPACITY - 1);
        }
        keys[h] = key;
        vals[h] = val;
        used[h] = true;
    }
};

static HashMap seen;

int run_solution() {
    int n, target;
    wasm::in >> n >> target;

    seen.clear();

    for (int i = 0; i < n; i++) {
        int val;
        wasm::in >> val;

        int complement = target - val;
        int found = seen.find(complement);

        if (found != -1) {
            wasm::out << found << ' ' << i << '\n';
            return 0;
        }

        seen.insert(val, i);
    }

    wasm::out << "No solution found\n";
    return 0;
}
