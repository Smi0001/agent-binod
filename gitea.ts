import { PR } from "./types";

const BASE  = () => process.env.GITEA_BASE!;
const REPO  = () => process.env.GITEA_REPO!;
const TOKEN = () => process.env.GITEA_TOKEN!;

// Computed lazily on each call so env vars are always current
const headers = () => ({
  Authorization: `token ${TOKEN()}`,
  "Content-Type": "application/json",
});

export async function listOpenPRs(): Promise<PR[]> {
  const limit = process.env.PR_FETCH_LIMIT ?? "50";
  const res = await fetch(`${BASE()}/repos/${REPO()}/pulls?state=open&limit=${limit}`, { headers: headers() });
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
  const res = await fetch(`${BASE()}/repos/${REPO()}/pulls/${pr_number}`, { headers: headers() });
  return res.json();
}

export async function getPRDiff(pr_number: number): Promise<string> {
  const res = await fetch(`${BASE()}/repos/${REPO()}/pulls/${pr_number}.diff`, { headers: headers() });
  return res.text();
}

export async function postComment(pr_number: number, body: string) {
  const res = await fetch(`${BASE()}/repos/${REPO()}/issues/${pr_number}/comments`, {
    method:  "POST",
    headers: headers(),
    body:    JSON.stringify({ body }),
  });
  return res.json();
}

export async function getPRComments(pr_number: number) {
  const res = await fetch(`${BASE()}/repos/${REPO()}/issues/${pr_number}/comments`, { headers: headers() });
  return res.json();
}
