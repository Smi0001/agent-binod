import { PR } from "./types";

const REPO  = () => process.env.GITHUB_REPO!;
const TOKEN = () => process.env.GITHUB_TOKEN!;
const BASE  = "https://api.github.com";

// Computed lazily on each call so env vars are always current
const headers = () => ({
  Authorization:          `Bearer ${TOKEN()}`,
  "Content-Type":         "application/json",
  Accept:                 "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
});

async function assertOk(res: Response): Promise<void> {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GitHub API error ${res.status} (${res.url}): ${body}`);
  }
}

export async function listOpenPRs(): Promise<PR[]> {
  const limit = process.env.PR_FETCH_LIMIT ?? "50";
  const res = await fetch(`${BASE}/repos/${REPO()}/pulls?state=open&per_page=${limit}`, { headers: headers() });
  await assertOk(res);
  const prs = await res.json();
  return prs.map((pr: any): PR => ({
    number:  pr.number,
    title:   pr.title,
    author:  pr.user.login,
    branch:  pr.head?.label,
    base:    pr.base?.label,
    created: pr.created_at?.slice(0, 10),
    body:    pr.body,
  }));
}

export async function getPRDetails(pr_number: number) {
  const res = await fetch(`${BASE}/repos/${REPO()}/pulls/${pr_number}`, { headers: headers() });
  await assertOk(res);
  return res.json();
}

export async function getPRDiff(pr_number: number): Promise<string> {
  const res = await fetch(`${BASE}/repos/${REPO()}/pulls/${pr_number}`, {
    headers: { ...headers(), Accept: "application/vnd.github.diff" },
  });
  await assertOk(res);
  return res.text();
}

export async function postComment(pr_number: number, body: string) {
  const res = await fetch(`${BASE}/repos/${REPO()}/issues/${pr_number}/comments`, {
    method:  "POST",
    headers: headers(),
    body:    JSON.stringify({ body }),
  });
  await assertOk(res);
  return res.json();
}

export async function getPRComments(pr_number: number) {
  const res = await fetch(`${BASE}/repos/${REPO()}/issues/${pr_number}/comments`, { headers: headers() });
  await assertOk(res);
  return res.json();
}
