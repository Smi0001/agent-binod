import * as Gitea  from "./gitea";
import * as GitHub from "./github";
import * as Git    from "./git";

export type Platform = "gitea" | "github";

// Session-scoped cache: pr_number → full filtered diff
// Avoids re-running git fetch + git diff on every chunk call for the same PR
const diffCache = new Map<number, string>();

export const toolDefinitions = [
  {
    name: "list_open_prs",
    description: "Lists all open pull requests in the repo. Returns PR number, title, author, source branch, base branch, and description. Use this first when the user wants to see what PRs are open.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_pr_diff",
    description: `Fetches the code diff for a specific PR, one chunk at a time.
- Always start with chunk=0 (default).
- The response header shows [Chunk X of Y]. If Y > 1, call this tool again with chunk=1, chunk=2, ... until you have all chunks.
- Accumulate all chunks before writing your review — do NOT post a partial review.
- Large PRs are automatically split at file boundaries so no file is ever cut in half.`,
    input_schema: {
      type: "object",
      properties: {
        pr_number: { type: "number", description: "The PR number to fetch the diff for" },
        chunk:     { type: "number", description: "Chunk index (0-based). Start at 0, increment until you have all chunks." },
      },
      required: ["pr_number"],
    },
  },
  {
    name: "get_pr_commits",
    description: "Lists all commits in a PR with their one-line summaries. Useful to understand what was done step by step.",
    input_schema: {
      type: "object",
      properties: {
        pr_number: { type: "number", description: "The PR number" },
      },
      required: ["pr_number"],
    },
  },
  {
    name: "post_pr_comment",
    description: "Posts a comment on a Gitea PR. Use this ONLY after completing your full review. The comment should be well-formatted markdown with clear sections.",
    input_schema: {
      type: "object",
      properties: {
        pr_number: { type: "number", description: "The PR number to comment on" },
        comment:   { type: "string", description: "The markdown-formatted review comment" },
      },
      required: ["pr_number", "comment"],
    },
  },
  {
    name: "get_pr_comments",
    description: "Fetches existing comments on a PR to avoid duplicate reviews or to understand prior feedback.",
    input_schema: {
      type: "object",
      properties: {
        pr_number: { type: "number", description: "The PR number" },
      },
      required: ["pr_number"],
    },
  },
];

// Tool executor — maps tool name → actual function
export async function executeTool(name: string, input: any, platform: Platform = "gitea"): Promise<string> {
  const api = platform === "github" ? GitHub : Gitea;

  switch (name) {

    case "list_open_prs": {
      const prs = await api.listOpenPRs();
      return JSON.stringify(prs, null, 2);
    }

    case "get_pr_diff": {
      const chunkIndex = input.chunk ?? 0;
      const limit      = parseInt(process.env.DIFF_MAX_CHARS ?? "20000", 10);

      // Use cached diff if available, otherwise fetch and cache
      let fullDiff = diffCache.get(input.pr_number);
      if (!fullDiff) {
        console.log(`[diff] fetching PR #${input.pr_number} diff (limit: ${limit} chars)`);
        try {
          fullDiff = Git.getPRDiffLocally(input.pr_number);
          console.log(`[diff] source: local git`);
        } catch (err: any) {
          console.log(`[diff] local git failed (${err?.message ?? err}), falling back to ${platform} API`);
          fullDiff = await api.getPRDiff(input.pr_number);
          console.log(`[diff] source: ${platform} API`);
        }
        console.log(`[diff] total size: ${fullDiff.length} chars`);
        diffCache.set(input.pr_number, fullDiff);
      } else {
        console.log(`[diff] PR #${input.pr_number} served from cache (${fullDiff.length} chars)`);
      }

      // Small PR — fits within limit, return directly (single call, no chunking)
      if (fullDiff.length <= limit) {
        console.log(`[diff] single pass (fits within limit)`);
        return fullDiff;
      }

      // Large PR — split into chunks, Claude fetches each one
      const chunks      = Git.splitDiffIntoChunks(fullDiff, limit);
      const totalChunks = chunks.length;
      const chunk       = chunks[chunkIndex] ?? "";
      const next        = chunkIndex + 1 < totalChunks ? ` — call get_pr_diff with chunk=${chunkIndex + 1} to continue` : " — this is the last chunk";

      console.log(`[diff] chunk ${chunkIndex + 1}/${totalChunks} (${chunk.length} chars)`);
      return `[Chunk ${chunkIndex + 1} of ${totalChunks}${next}]\n\n` + chunk;
    }

    case "get_pr_commits": {
      try {
        return Git.getPRCommitsLocally(input.pr_number);
      } catch {
        const pr = await api.getPRDetails(input.pr_number);
        return `Branch: ${pr.head?.label} → ${pr.base?.label}`;
      }
    }

    case "post_pr_comment": {
      const result = await api.postComment(input.pr_number, input.comment);
      if (result.id) return `Comment posted: #${result.id}`;
      const reason = result.message ?? JSON.stringify(result);
      throw new Error(`Failed to post comment: ${reason}`);
    }

    case "get_pr_comments": {
      const comments = await api.getPRComments(input.pr_number);
      if (!Array.isArray(comments)) {
        const reason = comments.message ?? JSON.stringify(comments);
        throw new Error(`Failed to fetch comments for PR #${input.pr_number}: ${reason}`);
      }
      return JSON.stringify(comments.map((c: any) => ({
        author: c.user.login,
        body:   c.body.slice(0, 300),
        date:   c.created_at.slice(0, 10),
      })), null, 2);
    }

    default:
      return `Unknown tool: ${name}`;
  }
}
