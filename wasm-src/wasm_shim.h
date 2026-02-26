/**
 * wasm_shim.h — Minimal I/O shim for Emscripten-compiled algorithm solutions.
 *
 * This shim replaces iostream with a memory-based I/O system that the
 * WasmRunner.tsx island can interact with directly.
 *
 * Exported Wasm API:
 *   alloc(size)           → allocate 'size' bytes, return pointer
 *   dealloc(ptr, size)    → free memory at ptr
 *   solve(inputPtr, len)  → run algorithm, return exit code (0 = success)
 *   get_output_ptr()      → pointer to output buffer
 *   get_output_len()      → length of output data
 *
 * Usage in algorithm .cpp files:
 *   #include "wasm_shim.h"
 *   // Use wasm::in for input, wasm::out for output (same API as cin/cout)
 *
 * Compile with:
 *   emcc solution.cpp -O2 -s EXPORTED_FUNCTIONS='["_solve","_alloc","_dealloc","_get_output_ptr","_get_output_len"]' \
 *        -s EXPORTED_RUNTIME_METHODS='[]' -s STANDALONE_WASM=1 --no-entry -o solution.wasm
 */
#ifndef WASM_SHIM_H
#define WASM_SHIM_H

#include <cstdlib>
#include <cstring>

// Output buffer: 64KB max
static char _output_buf[65536];
static int  _output_len = 0;

// Input buffer pointer and cursor (set by solve())
static const char* _input_buf = nullptr;
static int _input_len = 0;
static int _input_pos = 0;

namespace wasm {

/**
 * Minimal input reader — supports reading ints, strings, and lines.
 */
struct InputStream {
    bool eof() const { return _input_pos >= _input_len; }

    // Skip whitespace
    void skip_ws() {
        while (_input_pos < _input_len &&
               (_input_buf[_input_pos] == ' '  ||
                _input_buf[_input_pos] == '\n' ||
                _input_buf[_input_pos] == '\r' ||
                _input_buf[_input_pos] == '\t')) {
            _input_pos++;
        }
    }

    // Read an integer
    InputStream& operator>>(int& val) {
        skip_ws();
        val = 0;
        int sign = 1;
        if (_input_pos < _input_len && _input_buf[_input_pos] == '-') {
            sign = -1;
            _input_pos++;
        }
        while (_input_pos < _input_len &&
               _input_buf[_input_pos] >= '0' &&
               _input_buf[_input_pos] <= '9') {
            val = val * 10 + (_input_buf[_input_pos] - '0');
            _input_pos++;
        }
        val *= sign;
        return *this;
    }

    // Read a long long
    InputStream& operator>>(long long& val) {
        skip_ws();
        val = 0;
        long long sign = 1;
        if (_input_pos < _input_len && _input_buf[_input_pos] == '-') {
            sign = -1;
            _input_pos++;
        }
        while (_input_pos < _input_len &&
               _input_buf[_input_pos] >= '0' &&
               _input_buf[_input_pos] <= '9') {
            val = val * 10 + (_input_buf[_input_pos] - '0');
            _input_pos++;
        }
        val *= sign;
        return *this;
    }

    // Read a word (space-delimited)
    InputStream& read_word(char* buf, int maxlen) {
        skip_ws();
        int i = 0;
        while (_input_pos < _input_len && i < maxlen - 1 &&
               _input_buf[_input_pos] != ' '  &&
               _input_buf[_input_pos] != '\n' &&
               _input_buf[_input_pos] != '\r' &&
               _input_buf[_input_pos] != '\t') {
            buf[i++] = _input_buf[_input_pos++];
        }
        buf[i] = '\0';
        return *this;
    }
};

/**
 * Minimal output writer — supports writing ints, strings, and chars.
 */
struct OutputStream {
    OutputStream& operator<<(int val) {
        char tmp[16];
        int len = 0;
        if (val < 0) {
            write_char('-');
            val = -val;
        }
        if (val == 0) {
            write_char('0');
            return *this;
        }
        while (val > 0) {
            tmp[len++] = '0' + (val % 10);
            val /= 10;
        }
        for (int i = len - 1; i >= 0; i--) {
            write_char(tmp[i]);
        }
        return *this;
    }

    OutputStream& operator<<(long long val) {
        char tmp[24];
        int len = 0;
        if (val < 0) {
            write_char('-');
            val = -val;
        }
        if (val == 0) {
            write_char('0');
            return *this;
        }
        while (val > 0) {
            tmp[len++] = '0' + (val % 10);
            val /= 10;
        }
        for (int i = len - 1; i >= 0; i--) {
            write_char(tmp[i]);
        }
        return *this;
    }

    OutputStream& operator<<(const char* str) {
        while (*str) {
            write_char(*str++);
        }
        return *this;
    }

    OutputStream& operator<<(char c) {
        write_char(c);
        return *this;
    }

    void write_char(char c) {
        if (_output_len < (int)sizeof(_output_buf) - 1) {
            _output_buf[_output_len++] = c;
        }
    }

    void flush() {
        _output_buf[_output_len] = '\0';
    }
};

// Global instances (equivalent to cin/cout)
static InputStream in;
static OutputStream out;

} // namespace wasm

// Forward declaration — algorithm authors implement this
extern int run_solution();

// === Exported Wasm functions (called from JS) ===

extern "C" {

void* alloc(int size) {
    return malloc(size);
}

void dealloc(void* ptr, int size) {
    (void)size;
    free(ptr);
}

int solve(const char* input_ptr, int input_len) {
    // Reset I/O state
    _input_buf = input_ptr;
    _input_len = input_len;
    _input_pos = 0;
    _output_len = 0;

    // Run the algorithm
    int exit_code = run_solution();

    // Flush output
    wasm::out.flush();
    return exit_code;
}

const char* get_output_ptr() {
    return _output_buf;
}

int get_output_len() {
    return _output_len;
}

} // extern "C"

#endif // WASM_SHIM_H
