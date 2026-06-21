---
name: deep-dive
description: Backfill, reconstruct, or consolidate EVERYTHING known about ONE entity — a person, company, client, deal, or project — by pulling its full history across every source (Gmail, Calendar, Drive, Notion, transcripts, the vault), reconciling duplicates and conflicts, asking you the gap questions, and writing one rich cited profile. Use when the request targets one entity but spans many sources and many years and must end in a single reconciled profile — do a deep dive on X, pull everything we have on X, the full history with X, backfill or repair X's dossier. This is the heavy all-time backfill, NOT a quick who-is-X lookup (use enrich-person) and NOT the last-24h nightly sweep (use sweep-coordinator).
---

# deep-dive — pull everything we have on one entity, then go deep

The nightly sweep is forward-looking (last 24h). This is the opposite: take ONE entity and
reconstruct its **entire** history from every source, reconcile it, fill gaps with you, and write
a profile far richer than any single ingest. Interactive by design — you answer the hard questions.

## Step 0 — contract + scope
Read the vault `CLAUDE.md` first. Then pin down the target with the user:
- **Which entity?** A person, company, client, deal, or project. Get the exact identity
  (full name + which "John", company + domain, project slug). If they named a fuzzy thing
  ("the alumni client"), resolve it to one `wiki/` entity before gathering.
- **How deep / how far back?** Default: all of it. Confirm any time bound or "skip the noise" scope.
- Same golden rules as everywhere: never invent, cite every fact, dedup, append, label inference.

## Step 1 — GATHER WIDE (fan out, read-only, in parallel)
Pull every trace of the entity. Run these as parallel read-only sub-agents (Task/Agent) so a
years-deep sweep doesn't take forever — each returns a cited findings list, you synthesize. One
sub-agent per source it has access to:

- **Vault** — `search_notes` for the entity + aliases + email + company; read the existing
  dossier and everything that `[[links]]` to it (meetings, deals, decisions, daily mentions).
- **Gmail** — full-history search (NOT the sweep's `newer_than:1d`): `from:`/`to:`/the domain/the
  name, all-time. Pull thread subjects, dates, what was agreed, attachments. Via the Gmail MCP or
  your own Gmail CLI if you have one.
- **Calendar** — every past + upcoming event with this person/company (Google Calendar MCP).
  Build the meeting timeline: first contact → cadence → last touch.
- **Drive** — `search_files` for docs/decks/contracts naming the entity; read the relevant ones.
- **Notion** — `notion-search` the entity across the workspace.
- **Transcripts** — scan `raw/sessions/` for any call where they appear.
- **Web** (if a person/company we want enriched) — defer to the **`enrich-person`** routine for
  LinkedIn/Instagram/web. For a company, web-search current state, funding, news, headcount.

Each source-agent returns: `{fact, date, source-url-or-path}` lists. Nothing uncited survives.

## Step 2 — RECONCILE (the part the sweep can't do)
Now you have everything in one place — resolve the contradictions a single-day ingest never sees:
- **Dedup & merge candidates:** "two Koens", "Acme Inc vs Acme LLC", a person under maiden +
  married name. Propose merges; don't auto-merge identities — that's a Step-3 question.
- **Build the timeline:** order every interaction by date → first contact, how we met, the arc.
- **Spot conflicts:** email says one title, LinkedIn another; a deal amount that changed. List them.
- **Find the holes:** what a good dossier should have but no source answered (their role in a deal,
  who owns the relationship, current status, what they want from us).

## Step 3 — ASK THE GAP QUESTIONS (interactive — this is the point)
Use AskUserQuestion to resolve what only the human knows. Batch them. Examples:
- "I found two Koens — `koen@x` and `koen.s@y`. Same person?" (identity merges)
- "Where do the Granola transcripts for these calls live? I only see 2 of ~6 meetings."
- "This deal shows $4k in March and $6k in May — which is current?"
- "Who owns this relationship — you or Koen?"
- "Last touch was 4 months ago — is this relationship live, parked, or dead?"
Only ask what you genuinely can't derive. Don't ask what a source already answered.

## Step 4 — WRITE THE PROFILE (rich, cited, append-aware)
Write/enrich the entity's `wiki/` page on its proper schema (person → `enrich-person` dossier
shape; company/client/deal/project → their templates). Richer than a normal ingest:
- **Full bio / overview** with sources.
- **Relationship timeline** — dated, first-contact → now, each line cited.
- **Open threads** — live action items, asks, deal stage, next step.
- **Connections** — `[[person-id]]` graph links discovered across all sources.
- **Decisions & history** — significant past decisions get their own `decisions/` notes, linked.
- Mark every inference `(inferred)`; record unresolved conflicts under a `## Open questions` block
  rather than picking silently.
- Append a dated `### YYYY-MM-DD deep-dive` section ending `> by: <founder>`; never overwrite prior history.

## Step 5 — close out
- Update `wiki/index.md`; append to `wiki/log.md`:
  `## [YYYY-MM-DD] deep-dive <entity> — N sources, M years, K merges, Q questions resolved`.
- Tell the user: the headline profile, the timeline in 3 lines, what you merged, what's still open.
- If you created merge candidates the user hasn't confirmed → leave them in "Needs your eyes", don't merge.

## Why this is separate from the sweep
The sweep is cheap, daily, narrow (last 24h, one author). deep-dive is expensive, on-demand, wide
(all-time, all sources, interactive). Same vault, same schema, same rules — different depth. Run a
deep-dive when an entity matters enough to be worth getting completely right.
