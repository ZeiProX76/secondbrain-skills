---
name: meeting-intel
description: Own a SPECIFIC meeting or call — the moment right before it or right after it. Before one (prep me for my 2pm with X, who am I meeting with today, I'm meeting Tom Thursday brief me, an upcoming calendar event) research every attendee and hand back a skimmable brief of who they are, our history, open threads, and smart talking points. After one (a Granola/Fireflies/Zoom transcript, a file in raw/, or pasted notes — process this transcript, summarize the call I just had, capture the action items with owners, update the people and the deal from this call) produce a cited meeting note, pull decisions and action items, and fan the outcomes into each person, deal, and project. NOT for standalone who-is-X lookups (use enrich-person), querying what a past meeting already decided, full relationship backfills (use deep-dive), or the nightly sweep.
---

# meeting-intel — every meeting becomes cited knowledge

One skill, two trigger moments around the same meeting:
- **PREP** (before): given a calendar event / "I'm meeting X" → know each attendee, hand back a brief.
- **PROCESS** (after): given a transcript → distill into the wiki, update people, surface actions.

## Step 0 — read the contract
Read the vault `CLAUDE.md` first (`second-brain` MCP `read_note` "CLAUDE", or
your local vault `CLAUDE.md` (only if you sync the vault to disk)). Same golden rules everywhere: never invent, cite every
fact, dedup before writing, append never overwrite, people are first-class. Raw is immutable —
the transcript lives in `raw/`, the distilled note lives in `wiki/`.

---

## MODE A — PREP (before the meeting)

### 1. Get the attendees
From the calendar event (title, attendee emails, description) or from what the user tells you.
Pull the next/relevant event via the Google Calendar MCP if connected, else ask the user who's
in the meeting. Extract for each: name, email, company (email domain is a strong hint).

### 2. Enrich each attendee
For every attendee, run the **`enrich-person`** routine (read that skill): vault lookup → if
unknown/thin, LinkedIn (Apify) + Instagram (if a creator/brand) + web. Known & rich → just read
the dossier. This both fills the brief and permanently improves the brain.

### 3. Pull the relationship history
For each known person, read their `## Interactions` log + any linked `[[deals]]`, `[[meetings]]`,
`[[projects]]`. Surface: last time we talked, open action items, open asks, current deal stage.

### 4. Hand back a brief (to the user, concise)
Per attendee: one-line who-they-are, why-they-matter, our history, open threads. Then: the
meeting's likely purpose (from the event/title), 2–3 smart questions or talking points grounded
in what we know, and any "we still don't know X about them" gaps. Don't pad; make it skimmable.

---

## MODE B — PROCESS (after the meeting — the high-value path)

### 1. Locate & preserve the raw transcript (immutable)
- If it's a file in `raw/inbox/` or `raw/sessions/`, or pasted text, or a Granola/Fireflies/Zoom
  export → ensure the raw transcript is saved once at `raw/sessions/<YYYY-MM-DD>-<slug>.md`
  (write it if it's only pasted/streamed in). **Never rewrite an existing raw file.**
- Capture metadata: date, title, attendees, source tool, duration if present.

### 2. Identify everyone in the room
Extract every real person named (attendees + anyone discussed). For each, run the
**`enrich-person`** routine: resolve in the vault, enrich if unknown/thin. A meeting is the #1
moment new people enter the brain — don't let a name pass without a dossier.

### 3. Distill into a meeting note
Create `wiki/meetings/<YYYY-MM-DD>-<slug>.md` from `_templates/meeting.md`:
- Frontmatter: `id, type: meeting, title, date, kind, attendees: [person-ids], project, source, tags`.
  `source:` points at the raw file (`raw/sessions/<file>`).
- **## Summary** — 3–5 lines: what it was about + outcome.
- **## Decisions** — each real decision; significant ones also get a `wiki/projects/<p>/decisions/`
  note and link back.
- **## Action items** — `- [ ]` each, with an owner (`@person`) and any due date that was actually said.
- **## People mentioned** — `[[person-id]]` for everyone → feeds the network graph.
- **## Transcript / notes** — link to the raw file (don't paste the whole transcript into the wiki).
- Cite: every non-obvious claim `> from: raw/sessions/<file>`. Don't infer decisions that weren't made.

### 4. Fan the meeting back into the entities (this is what makes the brain compound)
- **People:** append a dated `### YYYY-MM-DD` line to each attendee's `## Interactions`
  ("Met re: X; they said Y; next step Z"), end with `> by: <founder>`.
- **Deals:** if it was a sales/brand call, append to the relevant `wiki/deals/<contact>/…` (stage,
  numbers, next step) — numbers only if actually stated.
- **Projects:** decisions/ideas land in the right `wiki/projects/<name>/`.
- **Action items:** also worth surfacing in today's `wiki/daily/<date>-<founder>.md`.

### 5. Close out
- Update `wiki/index.md`; append to `wiki/log.md`: `## [YYYY-MM-DD] meeting <slug> — N people, M decisions, K actions`.
- "Needs your eyes": anything low-confidence (unclear who owns an action, a number you're unsure of) → flag, don't assert.
- Give the user: a tight summary + the action-item list (owner + due) + any new people added.

## Notes
- **Webhook capture (Granola etc.):** the clean pattern is *capture ≠ processing*. A webhook
  should just drop the transcript into `raw/inbox/` (or `raw/sessions/`); this skill (or the
  nightly sweep draining the inbox) does the processing. So you're never blocked on a live
  connection, and re-processing is always possible from the raw file. (Wiring the actual webhook
  is a separate plumbing task — ask the user before standing up an endpoint.)
- This skill leans on **`enrich-person`** for all attendee research — keep that logic there, don't duplicate it.
