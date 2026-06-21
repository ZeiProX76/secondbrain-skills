---
name: sweep-coordinator
description: Run the nightly second-brain sweep as a fan-out workflow — a coordinator that spawns one specialized read-only agent per source (git, email, calendar, Drive, Notion, transcripts), then a single agent reconciles everything and writes it into the shared vault. Use when running or editing the nightly sweep, when "the sweep is slow / monolithic", or when adding/removing a source from the fan-out. Replaces the single-prompt engine run with parallel per-source gather + one reconciling ingest.
---

# sweep-coordinator — the nightly sweep, fanned out

The old sweep is one `claude -p` reading every source in series. This makes it a **coordinator**:
parallel gather (one agent per source, read-only) → one reconciling ingest. Same vault, same
schema, same golden rules (read `CLAUDE.md` first; never invent; cite; dedup; append).

## Architecture (why it's shaped this way)
- **Gather is parallel, read-only.** Reading years of email + a full calendar + Notion is the slow
  part; running each source in its own agent collapses wall-clock and isolates failures (a dead
  Notion MCP doesn't sink the email pull).
- **Ingest is single-writer.** All sources hand their cited findings to ONE ingest agent that
  dedups across everything at once and writes. This is deliberate: parallel writers would race on
  shared pages (two agents appending to the same person dossier). The same person seen in email +
  calendar + a transcript collapses into one update.
- **One agent = one job**, exactly the architecture you wanted — and it's the same for every
  founder; only the `sources` list differs per person.

## The workflow script
The workflow script ships bundled with this skill:
`~/.claude/skills/sweep-coordinator/sweep-coordinator.workflow.js`

Run it with the **Workflow** tool:
```
Workflow({
  scriptPath: "~/.claude/skills/sweep-coordinator/sweep-coordinator.workflow.js",
  args: { founder: "hugues", date: "2026-06-21", window: "last 24h",
          sources: ["git","gmail","calendar","drive","notion","transcripts"] }
})
```
- `date` must be passed in (workflow scripts can't call the clock).
- Drop a source by removing it from `sources` (e.g. omit `"calendar"` until the Calendar MCP is wired).
- Per-founder run = change `founder` + their `sources`.

## Adding / removing a source
Each source is one entry in `SOURCE_PROMPTS` in the script + its name in the default `sources`
array. To add (e.g. Slack): add a `slack:` prompt block (read-only, returns the same
`FINDINGS_SCHEMA`, cite `sourceRef`) and include `"slack"` in `sources`. Nothing else changes —
the ingest step is source-agnostic.

## Wiring it into the nightly run
Two paths (don't rewire the live launchd job without a test run first — see `sweep-setup`):
1. **Headless:** the nightly entry (`nightly-sweep.sh`) calls `claude -p "Run the sweep-coordinator
   workflow for founder hugues, date <today>, window last-24h"` — the agent invokes the Workflow
   tool. Requires the source MCPs/CLIs to be connected in that headless environment.
2. **Keep the current engine** for the cheap path and use this workflow on demand / for catch-up
   runs where the parallel speedup matters.

Test before enabling: run it once manually, confirm `wiki/daily/<date>-<founder>.md` appears, facts
are cited, nothing invented, and the "Needs your eyes" list captured the low-confidence items.

## Relationship to the other skills
- A transcript surfaced in the `transcripts` gather can defer heavy distillation to **`meeting-intel`**.
- A brand-new person can be enriched via **`enrich-person`** (the ingest agent calls it for thin dossiers).
- For all-time backfill of one entity (not the daily window), use **`deep-dive`** instead.
