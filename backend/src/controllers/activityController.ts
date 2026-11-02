import type { Request, Response } from "express";
import { getGitHubActivity, getLeetCodeActivity } from "../services/activityService.js";

const ACTIVITY_CACHE_TTL_MS = 5 * 60_000;
type ActivityPayload = { github: unknown; leetcode: unknown };
let activityCache: { data: ActivityPayload; expiresAt: number } | null = null;
let activityRefresh: Promise<ActivityPayload> | null = null;

export async function getActivity(_req: Request, res: Response) {
  if (activityCache && activityCache.expiresAt > Date.now()) {
    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
    return res.json(activityCache.data);
  }

  if (activityCache) {
    if (!activityRefresh) {
      void refreshActivity();
    }
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=600");
    return res.json(activityCache.data);
  }

  const data = await refreshActivity();
  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  return res.json(data);
}

function refreshActivity() {
  if (activityRefresh) return activityRefresh;

  activityRefresh = loadActivity().then((data) => {
    const bothFailed = Boolean((data.github as { error?: string }).error && (data.leetcode as { error?: string }).error);
    activityCache = { data, expiresAt: Date.now() + (bothFailed ? 30_000 : ACTIVITY_CACHE_TTL_MS) };
    return data;
  }).finally(() => {
    activityRefresh = null;
  });
  return activityRefresh;
}

async function loadActivity(): Promise<ActivityPayload> {
  const settled = await Promise.allSettled([getGitHubActivity(), getLeetCodeActivity()]);
  const [github, leetcode] = settled;

  return {
    github: github.status === "fulfilled" ? github.value : { provider: "GitHub", error: github.reason?.message || "Unable to load GitHub activity" },
    leetcode: leetcode.status === "fulfilled" ? leetcode.value : { provider: "LeetCode", error: leetcode.reason?.message || "Unable to load LeetCode activity" },
  };
}
