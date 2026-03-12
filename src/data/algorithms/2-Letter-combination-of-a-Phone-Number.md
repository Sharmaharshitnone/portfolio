---
title: "Letter Combinations of a Phone Number"
platform: "leetcode"
problemUrl: "https://leetcode.com/problems/letter-combinations-of-a-phone-number"
difficulty: "medium"
tags: ["hash-table", "string", "backtracking"]
timeComplexity: '$O(4^n \cdot n)$'
spaceComplexity: '$O(n)$'
language: "cpp"
executionTimeMs: 0
memoryUsedKb: 6500
pubDate: 2026-03-06
wasmSlug: "letter-combinations-of-a-phone-number"
sampleInput: '"23"'
sampleOutput: '["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"]'
---

## Problem Statement

Given a string containing digits from `2-9` inclusive, return all possible letter combinations that the number could represent. Return the answer in **any order**.

A mapping of digits to letters (just like on the telephone buttons) is given below. Note that 1 does not map to any letters.



**Constraints:**
- `0 <= digits.length <= 4`
- `digits[i]` is a digit in the range `['2', '9']`.

**Example:**
```text
Input:  digits = "23"
Output: ["ad","ae","af","bd","be","bf","cd","ce","cf"]

```

---

## Key Insight

This problem is about generating all possible pairings from multiple sets of choices. The brute-force approach of using nested loops becomes impossible because the number of loops we need depends on the length of the input string.

Instead, we use **Backtracking** (a form of Depth-First Search) to explore a decision tree.

For each digit, we branch out for every letter it represents. We build the string letter by letter, and whenever our built string reaches the same length as the input `digits`, we've found a valid combination. We save it, "backtrack" up the tree, and explore the next branch.

---

## Approach: Backtracking via Recursive Lambda

1. **Handle Edge Cases:** If the input is completely empty, immediately return an empty array.
2. **Define the Mapping:** Create an array where index 0 holds `"abc"`, index 1 holds `"def"`, etc. We will use the math trick `digit - '2'` to map a character like `'2'` to index `0`.
3. **The Backtrack Engine:** Create a recursive function that tracks our current `index` in the `digits` string and the `path` (the word) we've built so far.
* **Base Case:** If `index == digits.length()`, add `path` to our results and return.
* **Recursive Step:** Find the letters for the current digit. Loop through them. For each letter, append it to `path` and recursively call the function for `index + 1`.



---

## Solution

```cpp
#include <vector>
#include <string>
#include <functional>
using namespace std;

class Solution {
public:
    vector<string> letterCombinations(string digits) {
        if (digits.empty()) return {};
        
        vector<string> res;
        // Mapping matches index to digit: '2'-'2'=0 -> "abc", '3'-'2'=1 -> "def"
        vector<string> mapping = {"abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
        
        // Recursive lambda function for backtracking
        function<void(int, string)> backtrack = [&](int idx, string path) {
            // Base case: If we've processed all digits, the path is complete
            if (idx == digits.size()) {
                res.push_back(path);
                return;
            }
            
            // Loop through all possible letters for the current digit
            for (char c : mapping[digits[idx] - '2']) {
                // Move to the next digit, adding the current letter to the path
                backtrack(idx + 1, path + c);
            }
        };
        
        // Start exploring from the 0th digit with an empty string
        backtrack(0, "");
        return res;
    }
};

```

---

## Complexity Analysis

| Metric | Value | Explanation |
| --- | --- | --- |
| **Time** | $O(4^n \cdot n)$ | $n$ is the length of digits. In the worst case (e.g., all 7s or 9s), each digit has 4 letters, leading to $4^n$ combinations. Appending characters and pushing to the result takes $O(n)$ time per combination. |
| **Space** | $O(n)$ | Space required for the recursion stack, which goes as deep as the length of the input digits. (This excludes the space needed to hold the $O(4^n)$ output array). |
| **Best case** | $O(1)$ | If the input string is empty, we return immediately. |
| **Worst case (time)** | $O(4^n \cdot n)$ | An input string full of 7s and 9s maximizes the branching factor. |

### Practical Performance

Given the constraint `digits.length <= 4`, $4^4 = 256$ combinations max. This runs practically instantaneously. On LeetCode:

* **Runtime:** 0ms (beats 100%)
* **Memory:** 6.5 MB (beats 85%)

---

## Edge Cases

1. **Empty String:** `""` → `[]` (Handled by the explicit `if (digits.empty())` check).
2. **Single Digit:** `"2"` → `["a", "b", "c"]` (Recursion goes exactly one level deep).
3. **Four-Letter Digits:** `"79"` → Contains maximum branching (16 combinations total instead of 9 for "23").

---

## Alternative Approaches

### Iterative Queue (Breadth-First Search)

Instead of using recursion (DFS), we can use an iterative approach with a queue:

1. Start with a queue containing an empty string `""`.
2. For each digit in the input string, pull every existing combination out of the queue.
3. Append each possible new letter for the current digit to those combinations.
4. Push the new, longer combinations back into the queue.

*Trade-offs:* The iterative approach avoids the recursion stack overhead but requires a bit more memory upfront to store intermediate states in the queue. Both are $O(4^n \cdot n)$ time.

---

## Follow-Up: What if '0' or '1' are included?

If the problem didn't guarantee digits `2-9` and allowed `0` or `1` (which generally don't have letters mapped to them on standard phones), you would simply need to map them to an empty string `""` in your array. The `for` loop in the recursive step would see an empty string, immediately skip, and effectively "drop" that digit without breaking the combination logic.
