---
title: "Two Sum"
platform: "LC"
difficulty: "easy"
tags: ["hash-map", "array"]
solved: "2025-10-01"
link: "https://leetcode.com/problems/two-sum"
timeComplexity: "O(n)"
spaceComplexity: "O(n)"
---

A simple hash map solution to track complements.

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            if (seen.count(target - nums[i])) {
                return {seen[target - nums[i]], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};
```
