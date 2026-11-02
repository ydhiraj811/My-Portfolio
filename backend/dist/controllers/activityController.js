import { getGitHubActivity, getLeetCodeActivity } from "../services/activityService.js";
const ACTIVITY_CACHE_TTL_MS = 5 * 60_000;
let activityCache = null;
let activityRefresh = null;
export async function getActivity(_req, res) {
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
    if (activityRefresh)
        return activityRefresh;
    activityRefresh = loadActivity().then((data) => {
        const bothFailed = Boolean(data.github.error && data.leetcode.error);
        activityCache = { data, expiresAt: Date.now() + (bothFailed ? 30_000 : ACTIVITY_CACHE_TTL_MS) };
        return data;
    }).finally(() => {
        activityRefresh = null;
    });
    return activityRefresh;
}
async function loadActivity() {
    const settled = await Promise.allSettled([getGitHubActivity(), getLeetCodeActivity()]);
    const [github, leetcode] = settled;
    return {
        github: github.status === "fulfilled" ? github.value : { provider: "GitHub", error: github.reason?.message || "Unable to load GitHub activity" },
        leetcode: leetcode.status === "fulfilled" ? leetcode.value : { provider: "LeetCode", error: leetcode.reason?.message || "Unable to load LeetCode activity" },
    };
}
