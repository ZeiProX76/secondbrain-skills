---
name: integrations
description: Know which tools, MCPs, and CLIs are available and exactly how to use each one — Notion, Gmail, Google Calendar, Google Drive, Slack, Granola transcripts, GitHub, web research, and the second-brain vault. Use this whenever a task needs an external source and you are not sure whether it is connected or how to call it, when onboarding a teammate and you need to learn their stack, when another skill reports a source is not connected, or before any sweep / meeting prep / person enrichment so you wire in every source that is actually available. It probes the environment, asks the person in one line which tools they use, then points at a concrete how-to reference per tool so the AI can do everything their stack allows.
---

# integrations — make the AI fluent in this person's actual tools

The second-brain skills (sweep, meeting-intel, enrich-person, deep-dive) are only as good as the
sources they can reach. This skill is the **tool layer**: discover what's connected, learn what the
person uses, and know exactly how to call each one. Every other skill leans on this when it needs a
source. Per-person stacks differ — never assume; discover.

## Step 1 — DISCOVER what's actually connected (read-only, ~10s)
Probe before asking, so your questions are short and informed:
- **MCP servers:** `claude mcp list` (or read `~/.claude.json` / a project `.mcp.json`). Note which
  of: `second-brain`, Notion, Gmail, Google Drive, (Calendar?), Slack, Jina, Supabase are present.
- **Available MCP tools:** the tool namespaces in this session (e.g. `mcp__claude_ai_Notion__*`,
  `mcp__claude_ai_Gmail__*`, `mcp__second-brain__*`, `mcp__jina-mcp-server__*`). Their presence =
  that integration is live right now.
- **CLIs:** `command -v gh git gcloud slack node python3` and any project-specific CLI
  (e.g. a `gmail.py`). CLIs are the fallback when an MCP isn't connected.

## Step 2 — ASK the person, in ONE sentence
Don't interrogate. A single line, e.g.:
> "Quick one so I can wire everything in — which of these do you use day-to-day: Notion, Gmail,
> Google Calendar, Google Drive, Slack, Granola (meeting transcripts), GitHub? Anything I missed?"

Cross-check their answer against Step 1. Three outcomes per tool:
- **Used + connected** → ready; use the reference below.
- **Used + NOT connected** → a gap to close (Step 4).
- **Not used** → skip it (don't pull noise from tools they don't live in).

Record the resulting toolset so you don't re-ask every session — e.g. a short note in the person's
`wiki/people/<id>.md` profile or their daily log ("stack: Notion, Gmail, Granola, GitHub").

## Step 3 — USE each tool (route to its reference)
Read the matching reference only when you actually need that tool (progressive disclosure):

| Capability | Tool / MCP | How-to |
|------------|-----------|--------|
| Query/write the shared vault | `second-brain` (Basic Memory) | `references/vault.md` |
| Notes, tasks, docs, databases | Notion MCP | `references/notion.md` |
| Email — read threads, drafts | Gmail MCP or a gmail CLI | `references/gmail.md` |
| Meetings, attendees, timeline | Google Calendar MCP | `references/calendar.md` |
| Docs, decks, contracts | Google Drive MCP | `references/drive.md` |
| Meeting transcripts (capture) | Granola / Fireflies / Zoom | `references/transcripts.md` |
| Web search + page read | Jina MCP / WebSearch | `references/web-research.md` |
| Code, commits, PRs, issues | `git` + `gh` CLI | `references/github.md` |
| Profile scraping (LinkedIn/IG) | Apify | see the `enrich-person` skill's `references/apify.md` |

## Step 4 — CLOSE a gap (wanted but not connected)
For a tool they use but isn't wired in: web-search the **current** way to connect it (MCP server,
CLI, or export) — don't trust memory, integration setups change. Then print the exact commands (for
OAuth flows, have them run it themselves). Re-probe (Step 1) to confirm it's live. Common gap today:
**Google Calendar** is often not connected — `references/calendar.md` covers wiring it up.

## Why this exists
Once the AI knows the person's real stack and how to call each tool, the rest of the kit "just
works" against every available source — that's the whole point. Keep these references current; when
an MCP's tool names change, fix the one reference file and every skill benefits.
