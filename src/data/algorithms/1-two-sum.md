---
title: "Two Sum"
platform: "leetcode"
problemUrl: "https://leetcode.com/problems/two-sum"
difficulty: "easy"
tags: ["hash-map", "array", "complement-search"]
timeComplexity: "O(n)"
spaceComplexity: "O(n)"
language: "cpp"
executionTimeMs: 3
memoryUsedKb: 11200
pubDate: 2025-10-01
wasmSlug: "two-sum"
sampleInput: "4 9\n2 7 11 15"
sampleOutput: "0 1"
---

## Problem Statement

Given an array of integers `nums` and an integer `target`, return the **indices** of the two numbers such that they add up to `target`. Each input has **exactly one solution**, and the same element cannot be used twice.

**Constraints:**
- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i] <= 10^9`
- Exactly one valid answer exists

**Example:**
```
Input:  nums = [2, 7, 11, 15], target = 9
Output: [0, 1]  // nums[0] + nums[1] = 2 + 7 = 9
```

---

## Key Insight

The brute-force approach checks all pairs in O(n²). We can reduce this to **single-pass O(n)** by reframing the question:

> For each element `nums[i]`, does `target - nums[i]` already exist in something we've seen?

A hash map gives us O(1) average lookup, so we build the map *as we iterate*, checking for the complement before inserting the current element.

**Why build during iteration (not before)?** If we pre-build the full map, we risk matching an element with itself when duplicates exist. The single-pass approach naturally avoids this — we only check elements *before* the current index.

---

## Approach: Single-Pass Hash Map

1. Initialize an empty hash map: `value → index`
2. For each index `i`:
   - Compute `complement = target - nums[i]`
   - If `complement` exists in the map → return `{map[complement], i}`
   - Otherwise, insert `nums[i] → i` into the map
3. The problem guarantees exactly one solution, so we always return inside the loop

### Why `unordered_map` over `map`?

| Container | Lookup | Insert | Ordered? |
|-----------|--------|--------|----------|
| `unordered_map` | O(1) avg | O(1) avg | No |
| `map` (red-black tree) | O(log n) | O(log n) | Yes |

We don't need ordering. The amortized O(1) of `unordered_map` gives us the optimal solution.

---

## Solution

```cpp
#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // val → index mapping for O(1) complement lookup.
        // Reserve capacity to avoid rehashing — reduces constant factor.
        unordered_map<int, int> seen;
        seen.reserve(nums.size());

        for (int i = 0; i < static_cast<int>(nums.size()); ++i) {
            int complement = target - nums[i];

            // Check if complement was seen at an earlier index
            auto it = seen.find(complement);
            if (it != seen.end()) {
                return {it->second, i};
            }

            // Record current value → index for future lookups
            seen[nums[i]] = i;
        }

        // Unreachable if input guarantees exactly one solution
        return {};
    }
};
```

---

## Complexity Analysis

| Metric | Value | Explanation |
|--------|-------|-------------|
| **Time** | O(n) | Single pass through array. Hash map `find()` and `insert()` are O(1) amortized. |
| **Space** | O(n) | Hash map stores at most n entries. |
| **Best case** | O(1) | If the answer is at indices 0 and 1, we find it immediately. |
| **Worst case (hash)** | O(n²) | Pathological hash collisions (extremely rare with good hash). |

### Practical Performance

With `reserve(n)`, we eliminate rehashing. On LeetCode:
- **Runtime:** 3ms (beats 98%)
- **Memory:** 11.2 MB (beats 72%)

---

## Edge Cases

1. **Negative numbers:** `[-3, 4, 3, 90]`, target = `0` → indices `[0, 2]`
2. **Duplicates:** `[3, 3]`, target = `6` → indices `[0, 1]` — works because we check *before* inserting
3. **Large values:** `-10^9 + 10^9 = 0` — no overflow since complement stays in 32-bit range
4. **Minimum array:** `[1, 2]`, target = `3` — smallest valid input

---

## Alternative Approaches

### Two-Pointer (if array were sorted)

If we could sort: use two pointers from each end, converge inward. O(n log n) time, O(1) space. But **we need original indices**, so sorting destroys the answer — we'd need to track original positions, adding complexity with no benefit.

### Brute Force Baseline

```cpp
// O(n²) — only for comparison, never submit this
for (int i = 0; i < n; ++i)
    for (int j = i + 1; j < n; ++j)
        if (nums[i] + nums[j] == target)
            return {i, j};
```

The hash map solution is strictly superior for this problem.

---

## Follow-Up: Multiple Valid Pairs?

The problem states exactly one solution. If that constraint is relaxed:
- Return the **first** pair found → current code works as-is
- Return **all** pairs → use `multimap` or store indices in `vector<int>` per key
- Return the **count** of pairs → classic two-sum count variant, same hash map approach
