# GitHub + git (CLI)

For the sweep's "what did we build" signal and for shipping work. These are CLIs (`git`, `gh`), not
MCPs.

## git — local work
- `git -C <repo> log --since="1 day ago" --oneline` — today's commits (the sweep's git signal).
- `git -C <repo> status --short` / `git -C <repo> diff` — uncommitted work in progress.
- Scan the person's active repos (their configured repo list) for recent commits + new files.

## gh — GitHub
- `gh pr list` / `gh pr view <n>` — open PRs, review state.
- `gh issue list` — open issues/tasks.
- `gh api <endpoint>` — anything else (releases, reviews, CI runs).
- `gh repo clone` / `gh repo create` — repo management.

## Ingest pattern
Sweep: per active repo, distill the day's commits/PRs into the relevant
`wiki/projects/<name>/` (decisions → `decisions/`, features → the state page), cite
`> from: <repo> <sha>`. This is the code half of "what happened today"; email/calendar/notion are the
business half.

## Auth
`gh auth status` to confirm; `gh auth login` (the person runs it) if not authenticated.
