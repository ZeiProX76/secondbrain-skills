# Meeting transcripts (Granola / Fireflies / Zoom)

Transcripts are the richest meeting signal. The key design rule: **capture ≠ processing**. Get the
raw transcript into the vault's `raw/inbox/` (or `raw/sessions/`), then let `meeting-intel` (or the
nightly sweep draining the inbox) process it. This decouples you from any live connection and makes
re-processing free.

## Capture options
- **Manual:** export the transcript (Granola/Fireflies/Zoom all allow copy/export) and drop the file
  into `raw/inbox/`. Zero setup; works today.
- **Webhook (Granola etc.):** point the tool's webhook at an endpoint that writes the transcript
  into `raw/inbox/<date>-<slug>.md`. This is plumbing — **ask the user before standing up an
  endpoint** (where it runs, auth). The webhook should ONLY capture; it must not try to process.
- **API/CLI poll:** a scheduled job that pulls new transcripts into `raw/inbox/` (alternative to a webhook).

## Processing (handled by `meeting-intel`)
Once a transcript is in `raw/`: preserve it immutably, identify every person (enrich unknowns via
`enrich-person`), distill into `wiki/meetings/<date>-<slug>.md` (decisions + action items with
owners), and fan the meeting back into each person/deal/project. Cite `> from: raw/sessions/<file>`.

## Why decouple
If capture and processing are one step, a flaky webhook loses the meeting. With raw-first, the
transcript is always safe and you can re-distill anytime the skill improves.
