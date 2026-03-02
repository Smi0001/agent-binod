import { execSync } from "child_process";

export function fetchPRLocally(pr_number: number): string {
  execSync(`git fetch upstream refs/pull/${pr_number}/head:pr-${pr_number} 2>&1`);
  return `pr-${pr_number}`;
}

function shouldSkipFile(filename: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    if (pattern.endsWith("/")) return filename.startsWith(pattern);
    if (pattern.includes("*."))  return filename.endsWith(pattern.replace("*", ""));
    return filename === pattern;
  });
}

function filterNoisyFiles(diff: string): string {
  const skipPatterns = (process.env.DIFF_SKIP_FILES ?? "")
    .split(",").map(s => s.trim()).filter(Boolean);
  if (!skipPatterns.length) return diff;

  const sections = diff.split(/(?=^diff --git )/m);
  const filtered = sections.filter(section => {
    const match = section.match(/^diff --git a\/(.*) b\//);
    if (!match) return true;
    return !shouldSkipFile(match[1], skipPatterns);
  });

  const skipped = sections.length - filtered.length;
  const result  = filtered.join("");
  return skipped > 0 ? result + `\n\n[${skipped} file(s) skipped via DIFF_SKIP_FILES]` : result;
}

export function getPRDiffLocally(pr_number: number, base = process.env.BASE_BRANCH ?? "upstream/gp-3.0"): string {
  const branch  = fetchPRLocally(pr_number);
  const diff    = execSync(`git diff ${base}...${branch}`).toString();
  const cleaned = filterNoisyFiles(diff);
  return cleaned.slice(0, 20000); // trim for token limits
}

export function getPRCommitsLocally(pr_number: number, base = process.env.BASE_BRANCH ?? "upstream/gp-3.0"): string {
  const branch = fetchPRLocally(pr_number);
  return execSync(`git log ${base}..${branch} --oneline`).toString();
}
