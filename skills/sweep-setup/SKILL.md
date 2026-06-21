---
name: sweep-setup
description: Build or modify a person's OWN nightly "sweep" that feeds the shared second brain. The sweep runs locally on each person's machine, against their own tools (git repos, Gmail/Calendar/Notion/Slack/transcripts via whatever MCPs+CLIs they have), and writes distilled, cited knowledge into the one shared vault. Use when someone says "set up my sweep", "onboard me to the second brain", "add/remove a source from my sweep", "change my sweep schedule", or "my sweep is broken". Ultra-adaptable — it DISCOVERS each person's setup instead of assuming it. Two modes — CREATE and UPDATE.
---

# Sweep Setup — build a person's personal feed into the shared brain

The second brain is shared, but **ingestion is local and per-person**: each person runs their own
nightly sweep on their own machine, against their own authenticated tools, and writes into the one
shared vault/MCP. No two people have the same tools — so this skill **discovers** a person's setup,
**asks** the right questions, helps them **connect** what's missing (always web-searching the latest
commands), then **generates + schedules** a sweep tailored to them. The distillation engine
(`ingest-engine.md` + the vault's `CLAUDE.md`) is universal and shared — only the *trigger, sources,
and schedule* are personal.

> Prereq context: read the `second-brain` skill first (it covers the vault shape, the MCP, and the
> golden rules). This skill is specifically about standing up a person's *ambient ingestion*.

## Pick the mode
- **CREATE** — no per-person manifest exists yet, or the user says "set up / onboard / new sweep".
- **UPDATE** — a manifest exists, or the user says "add/remove a source", "change the time", "fix it".
- The manifest lives at `~/.config/secondbrain/sweep.json`. If it's missing → CREATE. If present and
  the ask is a tweak → UPDATE. If genuinely ambiguous, ask which.

Both modes are **discovery-driven and confirm before side effects** (connecting an integration or
installing a scheduler is a real, persistent change — show the plan and get a yes first).

---

# CREATE mode

Run these phases in order. Do NOT ask questions in Phase 2 until you've actually done Phase 1 —
walking in with a real inventory of their machine is the whole point.

## Phase 1 — DISCOVER (observe silently, then summarize)
Inventory the person's environment with read-only commands. Don't assume; detect:

1. **OS + shell + scheduler** — `uname -s`, shell. macOS → `launchd` (plist); Linux → `cron` or
   `systemd --user` timer. This decides how you'll schedule.
2. **Connected MCP servers** — `claude mcp list` (and check `~/.claude.json` / project `.mcp.json`).
   Note which knowledge sources are wired: Gmail, Google Calendar, Google Drive, Notion, Slack,
   Linear, GitHub, transcripts (Granola/Fireflies/Otter), etc.
3. **Installed CLIs** that can be sources — `command -v gh git slack gcloud az jira gam` etc.
4. **Active git repos** — find `.git` dirs under common roots (`~`, `~/dev`, `~/code`, `~/src`,
   `~/projects`) and rank by *recent* activity (commits in the last ~45 days). These become the
   "work" sources. Show the person the ranked list; they confirm which to include.
5. **Shared-brain connection** — is the vault synced locally (find an Obsidian LiveSync folder
   containing `CLAUDE.md` + `wiki/`)? If yes, the sweep can write to files (LiveSync pushes up). If
   not, the sweep writes via the **remote MCP** (`mcp.tactmax.com/mcp`). Detect and record which.
6. **Sweep engine availability** — is the `secondbrain` repo present (with `sweep/` + `ingest-engine.md`)?
   If not, you'll fetch the engine + `CLAUDE.md` from the brain (via MCP `read_note "CLAUDE"`) and
   generate a self-contained sweep. Don't require the repo.

Then **summarize the inventory** back: "Here's what I found on your machine — these MCPs, these CLIs,
these N active repos, brain reachable via X." This grounds everything that follows.

## Phase 2 — ASK CONTEXT (get context before integrations)
Now ask about the person, not the tools. Use `AskUserQuestion` for the structured ones:
- **Role / what your day produces** worth remembering (code, sales calls, meetings, research,
  writing, decisions, deals, hiring…). Multi-select from sensible options + free text.
- **Which of those to capture nightly** (the toggles that become sources).
- **Cadence + time + timezone** (default: nightly ~02:00 local).
- **Exclusions** — repos/inboxes/labels that must NEVER be ingested (privacy first).
- **Their name/slug** for `wiki/daily/<date>-<name>.md` and the `FOUNDER` field.

## Phase 3 — MAP SOURCES → INTEGRATIONS (and fill gaps)
For each capture source they chose, map it to a tool found in Phase 1. For every **gap** (wanted but
no tool):
- **WEB-SEARCH the latest, current way** to connect it — MCP server, CLI, or export. Setup commands
  and server names change constantly; do NOT trust memory or this file's examples. Verify against the
  tool's own current docs/repo before recommending.
- Present the best option with tradeoffs, then **help them connect it** (run/print the exact current
  commands; for OAuth logins, tell them to run it themselves via `! <cmd>`).
- Re-run the relevant Phase-1 probe to confirm it's now connected.
- If a gap can't be closed now, record it as "disabled (not connected)" — the sweep must **disclose**
  the missing source, never invent around it.

## Phase 4 — GENERATE the sweep
Produce a per-person, self-contained sweep. Reuse the shared engine; personalize only the trigger:
- **Digest step** — adapt `digest.sh`: their repo list (`SB_REPOS`), their new-raw-files glob, and a
  list of MCP sources the engine should pull live ("Gmail newer_than:1d", "Calendar today",
  "Notion recently-edited", "Slack since yesterday", etc. — only the ones they enabled + connected).
- **Engine invocation** — the same nightly prompt as `nightly-sweep.sh`: read `CLAUDE.md` + engine
  spec first; dedup→cite→append→cross-link; write `wiki/daily/<date>-<name>.md` + a "Needs your eyes"
  list; tag `log.md` `nightly`. `MODE=session` by default (persistent `claude` tmux session = flat
  subscription, no metered tokens); only use `MODE=headless` if they explicitly accept metered `-p`.
- **Write target** — synced vault folder (preferred, LiveSync pushes up) or remote MCP.
- **Scheduler** — macOS `launchd` plist in `~/Library/LaunchAgents/` (load with `launchctl`); Linux
  `crontab -e` line or a `systemd --user` timer. Schedule at their chosen local time.
- **Manifest** — write `~/.config/secondbrain/sweep.json` capturing every choice (name, repos,
  enabled sources + their tool, schedule, write-target, mode, exclusions). This is what UPDATE reads.

## Phase 5 — TEST, then ENABLE
Always offer a **read-only dry-run FIRST**, before any write or schedule:
- **(a) Read-only dry-run** — gather tonight's sources (run the digest; list the Gmail/Calendar/Notion
  the engine *would* pull) and have the engine **REPORT what it would create/update/append and the
  exact provenance — writing NOTHING to the vault**. This is the unbiased preview; show it to the person.
  (Explicitly instruct the engine: "DRY RUN — do not write, move, or modify any file; only report the
  plan.") Best run in a fresh session so accumulated context doesn't bias discovery.
- **(b) Real test run** — once they approve the dry-run, do ONE real manual run: verify a real
  `wiki/daily/<date>-<name>.md` appears, facts carry `> from:` provenance, nothing is fabricated, the
  inbox drained, `index.md`/`log.md` updated, the source moved/handled.
- **(c) Enable** — only after (b) looks right, **install + enable the scheduler**.
- Tell them how to **watch** it (log path / `tmux attach`), **trigger manually**, and **disable** it.

---

# UPDATE mode

1. **Read the manifest** `~/.config/secondbrain/sweep.json` and restate the current sweep (sources,
   schedule, target) so the person confirms you're editing the right thing.
2. **Ask what to change** — add/remove a source, change time/cadence, fix a broken integration,
   change write target, switch billing mode, edit repo list or exclusions.
3. If **adding a source** → run a focused slice of Phase 3 (map → web-search latest → connect → confirm).
   If **fixing a broken one** → diagnose (auth expired? MCP renamed? scopes too narrow?), web-search
   the current fix, re-connect.
4. **Regenerate** only the affected artifacts (digest, scheduler entry, manifest). Keep everything else.
5. **Re-test the changed path** (manual run), then re-enable the scheduler. Update the manifest.

---

# Golden rules (non-negotiable)
- **Discover, don't assume.** Every person's tools differ — inventory the machine before asking, and
  never hard-code another person's setup onto them.
- **Web-search the latest setup commands.** MCP server names, install flags, and OAuth flows change.
  Verify current docs before telling someone to run anything; treat any command in this file as a
  stale illustration, not gospel.
- **Local-per-person, one shared brain.** The sweep runs on *their* machine against *their* context
  and writes to the single shared vault/MCP. The server holds the brain; it does not run people's sweeps.
- **Inherit the engine's integrity.** The generated sweep runs the shared `ingest-engine.md` under
  `CLAUDE.md`: never invent a name/number/date, cite every fact `> from:`, dedup before writing,
  append-never-overwrite, people are first-class, disclose unreadable/missing sources.
- **Default to flat-sub billing** (`MODE=session`), never silently choose metered `-p`.
- **Confirm before side effects.** Connecting an integration or installing a scheduler is persistent —
  show the plan, get a yes, then act. Privacy exclusions are honored absolutely.
- **Test before you schedule.** Never enable a nightly job that hasn't produced one good daily page.
