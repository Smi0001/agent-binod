import { execSync } from "child_process";

export function fetchPRLocally(pr_number: number): string {
  execSync(`git fetch upstream refs/pull/${pr_number}/head:pr-${pr_number} 2>&1`);
  return `pr-${pr_number}`;
}

export function getPRDiffLocally(pr_number: number, base = "upstream/gp-3.0"): string {
  const branch = fetchPRLocally(pr_number);
  const diff = execSync(`git diff ${base}...${branch}`).toString();
  return diff.slice(0, 20000); // trim for token limits
}

export function getPRCommitsLocally(pr_number: number, base = "upstream/gp-3.0"): string {
  const branch = fetchPRLocally(pr_number);
  return execSync(`git log ${base}..${branch} --oneline`).toString();
}
