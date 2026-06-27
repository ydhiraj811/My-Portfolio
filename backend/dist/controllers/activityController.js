import { getGitHubActivity, getLeetCodeActivity } from "../services/activityService.js";
export async function getActivity(_req, res) {
    const settled = await Promise.allSettled([getGitHubActivity(), getLeetCodeActivity()]);
    const [github, leetcode] = settled;
    return res.json({
        github: github.status === "fulfilled" ? github.value : { provider: "GitHub", error: github.reason?.message || "Unable to load GitHub activity" },
        leetcode: leetcode.status === "fulfilled" ? leetcode.value : { provider: "LeetCode", error: leetcode.reason?.message || "Unable to load LeetCode activity" },
    });
}
