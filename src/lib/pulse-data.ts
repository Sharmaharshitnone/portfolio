/**
 * pulse-data.ts — Build-time data fetcher for Engineering Pulse heatmap.
 *
 * Aggregates activity from multiple platforms into a unified DailyPulse array:
 * - GitHub: contribution calendar via GraphQL API
 * - LeetCode: submission calendar via GraphQL API
 * - Codeforces: user submissions via REST API
 *
 * Called at build time from EngineeringPulse.astro (runs in Node/Cloudflare build).
 * Returns 365 days of data — one entry per day going back from today.
 *
 * Environment variables (optional — graceful degradation if missing):
 * - GITHUB_TOKEN: GitHub personal access token (for contribution calendar)
 * - GITHUB_USERNAME: GitHub username
 * - LEETCODE_USERNAME: LeetCode username
 * - CODEFORCES_HANDLE: Codeforces handle
 */

export interface DailyPulse {
  /** ISO date string YYYY-MM-DD */
  date: string;
  /** Total activity count across all platforms */
  count: number;
  /** Breakdown by source */
  github: number;
  leetcode: number;
  codeforces: number;
}

/** Heatmap level (0-4) based on GitHub's contribution graph thresholds */
export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

/** Map daily count to GitHub-style intensity level */
export function countToLevel(count: number): HeatmapLevel {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

/** Generate ISO date string for a given date */
function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Generate empty 365-day array from today going backwards */
function emptyPulseArray(): Map<string, DailyPulse> {
  const map = new Map<string, DailyPulse>();
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toISODate(d);
    map.set(key, { date: key, count: 0, github: 0, leetcode: 0, codeforces: 0 });
  }
  return map;
}

// ─── GitHub ─────────────────────────────────────────────────

interface GitHubContributionDay {
  date: string;
  contributionCount: number;
}

async function fetchGitHub(
  token: string | undefined,
  username: string | undefined,
): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  if (!token || !username) return result;

  try {
    const query = `query($login: String!) {
      user(login: $login) {
        contributionCalendar: contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }`;

    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables: { login: username } }),
    });

    if (!res.ok) return result;

    const json = await res.json() as {
      data?: {
        user?: {
          contributionCalendar?: {
            contributionCalendar?: {
              weeks?: Array<{ contributionDays?: GitHubContributionDay[] }>;
            };
          };
        };
      };
    };

    const weeks = json.data?.user?.contributionCalendar?.contributionCalendar?.weeks;
    if (!weeks) return result;

    for (const week of weeks) {
      if (!week.contributionDays) continue;
      for (const day of week.contributionDays) {
        if (day.contributionCount > 0) {
          result.set(day.date, day.contributionCount);
        }
      }
    }
  } catch {
    // Graceful degradation — no GitHub data
  }

  return result;
}

// ─── LeetCode ───────────────────────────────────────────────

async function fetchLeetCode(
  username: string | undefined,
): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  if (!username) return result;

  try {
    const query = `query($username: String!) {
      matchedUser(username: $username) {
        submissionCalendar
      }
    }`;

    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { username } }),
    });

    if (!res.ok) return result;

    const json = await res.json() as {
      data?: { matchedUser?: { submissionCalendar?: string } };
    };

    const calendar = json.data?.matchedUser?.submissionCalendar;
    if (!calendar) return result;

    // submissionCalendar is a JSON string: { "timestamp": count, ... }
    const parsed = JSON.parse(calendar) as Record<string, number>;
    for (const [ts, count] of Object.entries(parsed)) {
      const date = toISODate(new Date(parseInt(ts, 10) * 1000));
      result.set(date, count);
    }
  } catch {
    // Graceful degradation
  }

  return result;
}

// ─── Codeforces ─────────────────────────────────────────────

interface CFSubmission {
  creationTimeSeconds: number;
  verdict?: string;
}

async function fetchCodeforces(
  handle: string | undefined,
): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  if (!handle) return result;

  try {
    const res = await fetch(
      `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=1000`
    );

    if (!res.ok) return result;

    const json = await res.json() as {
      status?: string;
      result?: CFSubmission[];
    };

    if (json.status !== 'OK' || !json.result) return result;

  // Count accepted submissions per day
    for (const sub of json.result) {
      if (sub.verdict !== 'OK') continue;
      const date = toISODate(new Date(sub.creationTimeSeconds * 1000));
      result.set(date, (result.get(date) ?? 0) + 1);
    }
  } catch {
    // Graceful degradation
  }

  return result;
}

// ─── Public API ─────────────────────────────────────────────

export interface PulseConfig {
  githubToken?: string;
  githubUsername?: string;
  leetcodeUsername?: string;
  codeforcesHandle?: string;
}

/**
 * Fetch and aggregate 365 days of engineering activity.
 * Gracefully degrades — returns empty data if all APIs fail.
 */
export async function fetchPulseData(config: PulseConfig): Promise<DailyPulse[]> {
  const pulseMap = emptyPulseArray();

  // Fetch all sources in parallel
  const [github, leetcode, codeforces] = await Promise.all([
    fetchGitHub(config.githubToken, config.githubUsername),
    fetchLeetCode(config.leetcodeUsername),
    fetchCodeforces(config.codeforcesHandle),
  ]);

  // Merge into pulse map
  for (const [date, count] of github) {
    const entry = pulseMap.get(date);
    if (entry) {
      entry.github = count;
      entry.count += count;
    }
  }
  for (const [date, count] of leetcode) {
    const entry = pulseMap.get(date);
    if (entry) {
      entry.leetcode = count;
      entry.count += count;
    }
  }
  for (const [date, count] of codeforces) {
    const entry = pulseMap.get(date);
    if (entry) {
      entry.codeforces = count;
      entry.count += count;
    }
  }

  // Convert to sorted array (oldest first)
  return Array.from(pulseMap.values()).sort(
    (a, b) => a.date.localeCompare(b.date)
  );
}

/**
 * Generate mock data for development/preview when APIs aren't available.
 * Uses deterministic seeded random based on date string.
 */
export function generateMockPulseData(): DailyPulse[] {
  const pulseMap = emptyPulseArray();

  for (const entry of pulseMap.values()) {
    // Simple hash-based pseudo-random from date string
    let hash = 0;
    for (let i = 0; i < entry.date.length; i++) {
      hash = ((hash << 5) - hash + entry.date.charCodeAt(i)) | 0;
    }
    const rand = Math.abs(hash) % 100;

    // ~30% of days have no activity, rest have 1-12
    if (rand < 30) continue;

    const gh = Math.abs((hash * 7) % 8);
    const lc = Math.abs((hash * 13) % 4);
    const cf = Math.abs((hash * 19) % 3);

    entry.github = gh;
    entry.leetcode = lc;
    entry.codeforces = cf;
    entry.count = gh + lc + cf;
  }

  return Array.from(pulseMap.values()).sort(
    (a, b) => a.date.localeCompare(b.date)
  );
}
