import { config } from "../config/config.js";

type CalendarDay = {
  date: string;
  count: number;
  level: number;
};

function levelFromCount(count: number) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

function normalizeDays(days: Array<{ date: string; count: number }>): CalendarDay[] {
  return days.map((day) => ({ ...day, level: levelFromCount(day.count) }));
}

function summarize(days: CalendarDay[]) {
  const total = days.reduce((sum, day) => sum + day.count, 0);
  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i -= 1) {
    if (days[i].count === 0) break;
    currentStreak += 1;
  }

  let bestStreak = 0;
  let running = 0;
  for (const day of days) {
    if (day.count > 0) {
      running += 1;
      bestStreak = Math.max(bestStreak, running);
    } else {
      running = 0;
    }
  }

  return { total, currentStreak, bestStreak };
}

export async function getGitHubActivity() {
  if (config.githubToken) {
    return getGitHubContributionCalendar();
  }

  return getGitHubPublicEvents();
}

async function getGitHubContributionCalendar() {
  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.githubToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login: config.githubUsername } }),
  });

  if (!response.ok) {
    throw new Error(`GitHub calendar request failed: ${response.status}`);
  }

  const json = await response.json() as {
    data?: {
      user?: {
        contributionsCollection?: {
          contributionCalendar?: {
            weeks: Array<{ contributionDays: Array<{ date: string; contributionCount: number }> }>;
          };
        };
      };
    };
  };

  const rawDays = json.data?.user?.contributionsCollection?.contributionCalendar?.weeks.flatMap((week) =>
    week.contributionDays.map((day) => ({ date: day.date, count: day.contributionCount })),
  ) || [];
  const days = normalizeDays(rawDays);

  return {
    provider: "GitHub",
    username: config.githubUsername,
    profileUrl: `https://github.com/${config.githubUsername}`,
    source: "github-contributions-calendar",
    ...summarize(days),
    days,
  };
}

async function getGitHubPublicEvents() {
  const response = await fetch(`https://api.github.com/users/${config.githubUsername}/events/public?per_page=100`, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (!response.ok) {
    throw new Error(`GitHub public events request failed: ${response.status}`);
  }

  const events = await response.json() as Array<{ created_at: string }>;
  const counts = new Map<string, number>();
  for (const event of events) {
    const date = event.created_at.slice(0, 10);
    counts.set(date, (counts.get(date) || 0) + 1);
  }

  // Build the 365-day window entirely in UTC epoch milliseconds to avoid
  // local-timezone drift between the generated date key and the actual day.
  const now = new Date();
  const todayUTCMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const DAY_MS = 86400000;

  const days = normalizeDays(
    Array.from({ length: 365 }, (_, index) => {
      const dayMs = todayUTCMidnight - (364 - index) * DAY_MS;
      const key = new Date(dayMs).toISOString().slice(0, 10);
      return { date: key, count: counts.get(key) || 0 };
    }),
  );

  return {
    provider: "GitHub",
    username: config.githubUsername,
    profileUrl: `https://github.com/${config.githubUsername}`,
    source: "github-public-events-fallback",
    note: "Set GITHUB_TOKEN to use the official GitHub contribution calendar.",
    ...summarize(days),
    days,
  };
}

export async function getLeetCodeActivity() {
  const query = `
    query userProfileCalendar($username: String!, $year: Int) {
      matchedUser(username: $username) {
        username
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
        userCalendar(year: $year) {
          streak
          totalActiveDays
          submissionCalendar
        }
      }
    }
  `;

  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: `https://leetcode.com/u/${config.leetcodeUsername}/`,
    },
    body: JSON.stringify({ query, variables: { username: config.leetcodeUsername } }),
  });

  if (!response.ok) {
    throw new Error(`LeetCode calendar request failed: ${response.status}`);
  }

  const json = await response.json() as {
    data?: {
      matchedUser?: {
        username: string;
        submitStats?: { acSubmissionNum: Array<{ difficulty: string; count: number }> };
        userCalendar?: { streak: number; totalActiveDays: number; submissionCalendar: string };
      };
    };
  };

  const matchedUser = json.data?.matchedUser;
  if (!matchedUser?.userCalendar) {
    throw new Error("LeetCode user calendar not found");
  }

  const calendar = JSON.parse(matchedUser.userCalendar.submissionCalendar || "{}") as Record<string, number>;

  // LeetCode's submissionCalendar keys are Unix timestamps at UTC midnight
  // for each day. The previous version used date.setHours(0,0,0,0), which
  // sets midnight in the SERVER'S LOCAL timezone, not UTC — so for any
  // timezone offset that isn't a whole multiple of 24h (e.g. UTC+5:30),
  // every generated key missed every real key in `calendar`, and every day
  // silently fell back to count: 0. Doing all the math in UTC epoch
  // milliseconds fixes this regardless of what timezone the server runs in.
  const now = new Date();
  const todayUTCMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const DAY_MS = 86400000;

  const days = normalizeDays(
    Array.from({ length: 365 }, (_, index) => {
      const dayMs = todayUTCMidnight - (364 - index) * DAY_MS;
      const key = new Date(dayMs).toISOString().slice(0, 10);
      const unix = Math.floor(dayMs / 1000).toString();
      return { date: key, count: calendar[unix] || 0 };
    }),
  );

  const accepted = matchedUser.submitStats?.acSubmissionNum.find((item) => item.difficulty === "All")?.count || 0;

  return {
    provider: "LeetCode",
    username: matchedUser.username,
    profileUrl: `https://leetcode.com/u/${matchedUser.username}/`,
    source: "leetcode-user-calendar",
    accepted,
    totalActiveDays: matchedUser.userCalendar.totalActiveDays,
    total: days.reduce((sum, day) => sum + day.count, 0),
    currentStreak: matchedUser.userCalendar.streak,
    bestStreak: summarize(days).bestStreak,
    days,
  };
}