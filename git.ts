import { execSync } from "child_process";

const gitTimeout = () => parseInt(process.env.GIT_TIMEOUT_MS ?? "30000", 10);

export function fetchPRLocally(pr_number: number): string {
  execSync(`git fetch upstream refs/pull/${pr_number}/head:pr-${pr_number} 2>&1`, { timeout: gitTimeout() });
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
  const branch = fetchPRLocally(pr_number);
  const diff   = execSync(`git diff ${base}...${branch}`, { timeout: gitTimeout() }).toString();
  return filterNoisyFiles(diff);
}

// Splits a diff into file-boundary chunks, each within chunkSize characters.
// Returns array of chunks — Claude calls get_pr_diff with chunk=0,1,2... to read all.
export function splitDiffIntoChunks(diff: string, chunkSize: number): string[] {
  const sections = diff.split(/(?=^diff --git )/m).filter(s => s.trim());
  const chunks: string[] = [];
  let current = "";

  for (const section of sections) {
    if (current.length + section.length > chunkSize && current.length > 0) {
      chunks.push(current);
      current = section;
    } else {
      current += section;
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [""];
}

export function getPRCommitsLocally(pr_number: number, base = process.env.BASE_BRANCH ?? "upstream/gp-3.0"): string {
  const branch = fetchPRLocally(pr_number);
  return execSync(`git log ${base}..${branch} --oneline`, { timeout: gitTimeout() }).toString();
}
