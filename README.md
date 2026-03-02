# <u>Agent Binod - a pull request review agent</u> 🤖

**Token-authenticated, multi-platform AI agent for automated pull request reviews.**

<br/>

## Table of Contents 📋
- [Platform](#platform)
- [Tools](#current-tools)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Environment Variables](#how-to-find-the-values-for-the-env-variables-)
- [Links](#links)
- [Coming Soon](#coming-soon)

---
<br/>

### Platform 🌐
Currently integrated for:
1. **Gitea** *(default)*
2. **GitHub**

---
<br/>

## Current tools 🛠️

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

> **Tip** - *Add new tools to get things done by Agent Binod*

---
<br/>

## Getting Started 🚀

Agent Binod can be used in two ways — as a **global CLI tool** (recommended) or **run locally from source**.

<br/>

### Option 1: Global CLI ⚡ *(recommended)*

Install globally via npm:

```
npm install -g agent-binod
```

Create a `.env` file in your project directory. Refer `.env.example` for the variables to configure with your tokens (at least one platform need to be configured):

```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxx

# Gitea configuration (default platform)
GITEA_TOKEN=f631f4axxxxxxxxxxxxxxxxxxxx
GITEA_BASE=https://git.example.in/api/v1
GITEA_REPO=owner/repo

# GitHub configuration (use --platform=github)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=owner/repo

# Optional: base branch used when fetching PR diffs via local git (default: origin/main).
# The agent first tries to diff the PR locally using your cloned repo (faster, no API call).
# Set this to the branch your PRs are merged into, e.g. origin/main or upstream/main.
# If unset or if the local diff fails, the agent falls back to fetching the diff via the platform API.
BASE_BRANCH=

# Optional: max open PRs to fetch per listing (default: 50, GitHub max: 100)
PR_FETCH_LIMIT=

```

Then run from anywhere inside your project:

```
agent-binod "Review PR #1 and post comment"
```

---

### Option 2: Run from Source

1. **Clone the repository:**
```
   git clone git@github.com:Smi0001/agent-binod.git
   cd agent-binod
```

<br/>

2. **Install Dependencies** 📦
   - `node` - v22^
   - `anthropic-ai/sdk` - v0.7^
   - `typescript` - v5^

```
npm i

```
<br/>

3. **Set up environment variables**
Create a `.env` file with your Anthropic API key, and other repo path & token configurations. Refer `.env.example` for the variables to configure.

---

## <u>How to find the values for the env variables ?</u> 🔑
<br/>

*ANTHROPIC_API_KEY*
1. Go to console.anthropic.com
2. Sign in (or create an account)
3. Click API Keys in the left sidebar
4. Click Create Key, give it a name (e.g. agent-binod-key)
5. Copy the key immediately — it's only shown once

`ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxx`
<br/>

**Platform=Gitea**
*GITEA_REPO* — easy, it's just `owner/repo`  from your Gitea URL:
https://git.example.com/Smi0001/agent-binod   →  `GITEA_REPO=Smi0001/agent-binod`
<br/>

GITEA_TOKEN — create an access token in Gitea:

1. Go to your Gitea instance → click your avatar (top-right) → Settings
2. Left sidebar → Applications
3. Under Manage Access Tokens, enter a token name (e.g. agent-binod)
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

https://github.com/Smi0001/agent-binod  →  `GITHUB_REPO=Smi0001/agent-binod`
<br/>

*GITHUB_TOKEN* — create a Personal Access Token (PAT):
1. Go to github.com → Settings (top-right avatar menu)
2. Scroll down to Developer settings (bottom of left sidebar)
3. Personal access tokens → Tokens (classic)
4. Click Generate new token (classic)
5. Give it a name (e.g. agent-binod)
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

## Usage 💡
Agent Binod will act as a senior programmer who can review codes and post comments (for now). Add new tools and watch him put the CLI on fire 🔥.
- If only one platform is configured, i.e. `GITEA_TOKEN` or `GITHUB_TOKEN`, etc. single token is set in `.env`, Agent Binod is smart enough to pick that as the default platform.
- If you have configured multiple platforms, then you need to inform him. Override anytime with `--platform=gitea` or `--platform=github`.

> Each example below shows both the **global CLI** and **local dev** command.

<br/>

#### List open PRs 📂

```
agent-binod "List all open PRs"
```
```
npm start "List all open PRs"
```
<br/>

#### Review a specific PR 🔍

> **Gitea** - *default platform, if multiple platforms are configured*

```
agent-binod "Review PR #1001 and post the review as comments"
```
```
npm start "Review PR #1001 and post the review as comments"
```

[Agent Binod - platform Gitea - PR review and post comments](https://youtu.be/Y9rwzNHxT74)

[![Watch the demo](https://img.youtube.com/vi/Y9rwzNHxT74/maxresdefault.jpg)](https://www.youtube.com/watch?v=Y9rwzNHxT74)

<br/>

> **Github** - *mention platform as github*

```
agent-binod --platform=github "Review PR #1001 and post the review as comments"
```
```
npm start -- --platform=github "Review PR #1001 and post the review as comments"
```

[Agent Binod - platform Github - PR review and post for new commits only (small tweak in the prompt)](https://youtu.be/UgTNF-nUuzA)

[![Watch the demo](https://img.youtube.com/vi/UgTNF-nUuzA/maxresdefault.jpg)](https://www.youtube.com/watch?v=UgTNF-nUuzA)

<br/>

#### Just analyze, don't post 🧪

```
agent-binod "Review PR #1001 and tell me the concerns without posting"
```
```
npm start "Review PR #1001 and tell me the concerns without posting"
```

> **Github** - *mention platform as github*

```
agent-binod --platform=github "Review PR #1001 and do not post"
```
```
npm start -- --platform=github "Review PR #1001 and do not post"
```

[Agent Binod - platform Github - PR review without posting, and post comments on new prompt](https://youtu.be/Aec2Ji97Ozk)

[![Watch the demo](https://img.youtube.com/vi/Aec2Ji97Ozk/maxresdefault.jpg)](https://www.youtube.com/watch?v=Aec2Ji97Ozk)

<br/>

#### Review all open PRs 🔄
```
agent-binod "List open PRs and review each one, post comments"
```
```
npm start "List open PRs and review each one, post comments"
```
<br/>

---
<br/>

**Links** 🔗
- GitHub: https://github.com/Smi0001/agent-binod
- npm: https://www.npmjs.com/package/agent-binod

---
<br/>

## <u>Coming Soon</u> ⏳
1. ~~PR Review for Github~~
2. ~~Validation for missing configuration (env variables)~~
3. PR Review for Gitlab
4. Add new tools
    - Tag users in comments
    - Close PR
    - Approve PR
    - Assign PRs to users
6. Interactive CLI commands
