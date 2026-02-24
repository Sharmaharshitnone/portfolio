---
title: "Two Sum"
platform: "leetcode"
problemUrl: "https://leetcode.com/problems/two-sum"
difficulty: "easy"
tags: ["hash-map", "array"]
timeComplexity: "O(n)"
spaceComplexity: "O(n)"
language: "cpp"
pubDate: 2025-10-01
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
