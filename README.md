# <u>Agent Binod - a pull request review agent</u>
**Token-authenticated, multi-platform AI agent for automated pull request reviews.**

<br/>

## Table of Contents
- [Platform](#platform)
- [Tools](#current-tools)
- [Install Dependencies](#install-dependencies)
- [Usage](#usage)
- [Environment Variables](#how-to-find-the-values-for-the-env-variables-)
- [Links](#links)
- [Coming Soon](#coming-soon)

---
<br/>

### Platform
Currently integrated for:
1. **Gitea** *(default)*
2. **GitHub**

---
<br/>

## Current tools

Claude can only do these 5 things:

| Tool | What it does |
|---|---|
| `list_open_prs` | Lists all open PRs |
| `get_pr_diff` | Gets the code changes of a PR |
| `get_pr_commits` | Gets the commit history of a PR |
| `get_pr_comments` | Reads existing comments on a PR |
| `post_pr_comment` | Posts a comment on a PR |


**Prompts that won't work:**
- `"Close PR #5"` — no close tool
- `"Approve PR #5"` — no approve tool
- `"Assign PR #5 to someone"` — no assign tool

The prompt controls **what Claude thinks and says** — the tools control **what it can actually do**.


---
<br/>

##  Install Dependencies
1. `node v22^`
2. `anthropic-ai/sdk v0.7^`
3. `typescript v5^`


```
npm i

```

---
<br/>

## Usage
Defaults to the platform whose token is configured in `.env`. If only one of `GITEA_TOKEN` or `GITHUB_TOKEN` is set, that platform is auto-selected. Override anytime with `-- --platform=gitea` or `-- --platform=github`.


#### List open PRs

```
npm start "List all open PRs"

```
#### Review a specific PR
```
npm start "Review PR #1001 and post the review as a comment"
```
#### Just analyze, don't post
```
npm start "Review PR #1001 and tell me the concerns without posting"
```

#### Review all open PRs
```
npm start "List open PRs and review each one, post comments"
```
<br/>

---

## <u>How to find the values for the env variables ?</u>
<br/>

*ANTHROPIC_API_KEY*
1. Go to console.anthropic.com
2. Sign in (or create an account)
3. Click API Keys in the left sidebar
4. Click Create Key, give it a name (e.g. pr-review-agent)
5. Copy the key immediately — it's only shown once

`ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxx`
<br/>

**Platform=Gitea**
*GITEA_REPO* — easy, it's just `owner/repo`  from your Gitea URL:
https://git.example.com/Smi0001/pr-review-agent   →  `GITEA_REPO=Smi0001/pr-review-agent`
<br/>

GITEA_TOKEN — create an access token in Gitea:

1. Go to your Gitea instance → click your avatar (top-right) → Settings
2. Left sidebar → Applications
3. Under Manage Access Tokens, enter a token name (e.g. pr-review-agent)
4. Select permissions:
  - Issues → Read & Write (for posting PR comments)
  - Pull Requests → Read (for listing/reading PRs)
5. Click Generate Token and copy it immediately

`GITEA_TOKEN=7cd244f5xxxxxxxxxxxxxxxx`

<br/>


*GITEA_BASE* — your Gitea instance API URL. Always append /api/v1:
https://git.example.com  →  `GITEA_BASE=https://git.example.com/api/v1`

<br/>
<br/>

**Platform=Github**
*GITHUB_REPO* — easy, it's just `owner/repo`  from your GitHub URL:

https://github.com/Smi0001/pr-review-agent  →  `GITHUB_REPO=Smi0001/pr-review-agent`
<br/>

*GITHUB_TOKEN* — create a Personal Access Token (PAT):
1. Go to github.com → Settings (top-right avatar menu)
2. Scroll down to Developer settings (bottom of left sidebar)
3. Personal access tokens → Tokens (classic)
4. Click Generate new token (classic)
5. Give it a name (e.g. pr-review-agent)
6. Select scopes:
  - repo — to read PRs and post comments on private repos
  - public_repo — if the repo is public (lighter permission)
7. Click Generate token and copy it immediately (shown only once)

`GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx`
<br/>

*BASE_BRANCH* — optional. For a typical GitHub repo it would be something like:
BASE_BRANCH=origin/main

If you leave it blank, the agent still works but local git diffs will fall back to the Gitea default branch, which likely won't exist for a GitHub repo — so local git will fail and it'll fall back to the GitHub API for diffs automatically.

---
<br/>

**Links**
- GitHub: https://github.com/Smi0001/agent-binod
- npm: https://www.npmjs.com/package/agent-binod

---
<br/>

## <u>Coming Soon</u>
1. ~~PR Review for Github~~
2. ~~Validation for missing configuration (env variables)~~
3. PR Review for Gitlab
4. Interactive CLI commands
