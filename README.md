# <u>PR Review Agent</u>
**Token-authenticated, multi-platform AI agent for automated pull request reviews, currently integrated for *Gitea and GitHub.***

## Usage

#### Install
```
npm install @anthropic-ai/sdk

```
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

****

## <u>How to find the values for the env variables ?</u>
<br/>

**Platform=Gitea**
*GITEA_REPO* — easy, it's just `owner/repo`  from your Gitea URL:
https://github.com/Smi0001/pr-review-agent  →  `GITEA_REPO=Smi0001/pr-review-agent`
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
So your .env for Gitea looks like:

```
GITEA_TOKEN=7cd244f5...
GITEA_BASE=https://git.coverstack.in/api/v1
GITEA_REPO=Smi0001/pr-review-agent
```

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
<br/>
So your .env for Github looks like:

```
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=Smi0001/pr-review-agent
BASE_BRANCH=origin/main
```


****
<br/>

## <u>Coming Soon</u>
1. PR Review for Git
2. Interactive CLI commands