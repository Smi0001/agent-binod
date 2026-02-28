import * as Gitea from "./gitea";
import * as Git   from "./git";

export const toolDefinitions = [
  {
    name: "list_open_prs",
    description: "Lists all open pull requests in the repo. Returns PR number, title, author, source branch, base branch, and description. Use this first when the user wants to see what PRs are open.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_pr_diff",
    description: "Fetches the full code diff for a specific PR. Use this to review what code was changed. Requires a PR number. Returns the raw git diff.",
    input_schema: {
      type: "object",
      properties: {
        pr_number: { type: "number", description: "The PR number to fetch the diff for" },
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
export async function executeTool(name: string, input: any): Promise<string> {
  switch (name) {

    case "list_open_prs": {
      const prs = await Gitea.listOpenPRs();
      return JSON.stringify(prs, null, 2);
    }

    case "get_pr_diff": {
      try {
        // Try local git first (no token needed, faster)
        return Git.getPRDiffLocally(input.pr_number);
      } catch {
        // Fall back to Gitea API
        return Gitea.getPRDiff(input.pr_number);
      }
    }

    case "get_pr_commits": {
      try {
        return Git.getPRCommitsLocally(input.pr_number);
      } catch {
        const pr = await Gitea.getPRDetails(input.pr_number);
        return `Branch: ${pr.head?.label} → ${pr.base?.label}`;
      }
    }

    case "post_pr_comment": {
      const result = await Gitea.postComment(input.pr_number, input.comment);
      return result.id ? `Comment posted: #${result.id}` : "Failed to post";
    }

    case "get_pr_comments": {
      const comments = await Gitea.getPRComments(input.pr_number);
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
