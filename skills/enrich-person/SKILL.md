---
name: enrich-person
description: Find out everything we know (and can find) about a person, then write a cited dossier into the shared second brain. Use when the user asks "who is X / do we know X", before a meeting, when a new name shows up in a transcript/email/calendar, or whenever a person's wiki/people dossier is missing or thin. Looks the person up in the vault first, then enriches from LinkedIn (via Apify), Instagram, and the open web (Jina/web search) — every claim cited, inference labelled.
---

# enrich-person — build a cited dossier on a person

This is the reusable enrichment primitive. `meeting-intel`, `deep-dive`, and the sweep all
call this routine. Goal: given a name (and any of email / company / a URL / a transcript
mention), produce or enrich a `wiki/people/<id>.md` dossier in the shared second brain —
**grounded, deduped, and fully cited.**

## Step 0 — read the contract, load the rules
Before writing anything, read the vault's operating manual `CLAUDE.md` (via the `second-brain`
MCP `read_note` "CLAUDE", or your local vault `CLAUDE.md` (only if you sync the vault to disk)). The schema is the law.
Carry these non-negotiables through every step:

- **NEVER invent** a name, employer, title, location, number, or relationship. We have a
  documented history of a first ingest fabricating dates/names — do not repeat it.
- **Every fact carries a source.** Inline `> from: <url|source>` or a `source:` field. A claim
  with no source is an **inference** and must be written as one (prefix `~` or "(inferred)").
- **Confidence is explicit.** If LinkedIn match is ambiguous (common name, no company match),
  say so and DON'T merge — ask the user or open a candidate, never assert.
- **Dedup before you write.** Search the vault first; enrich the existing dossier in place,
  append a dated section, never create a second page for the same human.

## Step 1 — resolve identity in the vault (always first)
You're trying to answer: *do we already know this person?*
- `search_notes` the vault for the name, then for the email local-part, the company, and any
  aliases. Also scan `wiki/people/` filenames and `wiki/index.md`.
- Match on strong signals (email, LinkedIn URL, exact name + same company). A bare name match is
  weak — confirm with a second signal before assuming it's the same person.
- Outcomes:
  - **Known & rich** → you may not need to enrich at all; return the dossier. Only enrich if the
    user wants fresh info or the page is stale (`updated` old).
  - **Known but thin** (stub, few facts) → enrich and append.
  - **Unknown** → create a new dossier (Step 3+).
  - **Ambiguous duplicates** → flag for merge in `wiki/log.md` "Needs your eyes"; don't silently merge.

## Step 2 — gather the raw signal you already have
Before hitting the web, harvest what's free: the email's signature/domain, the calendar event
(other attendees, the meeting title), the transcript (what they said about themselves, their
role, their company), who introduced them. This is the highest-trust context — use it to
disambiguate the web results in Step 3.

## Step 3 — enrich from the web (in this order; stop when you have enough)
Use the cheapest sufficient source first. Always record the source URL for each fact.

### 3a. LinkedIn + Instagram — via Apify (use the bundled script)
The professional spine. Scrape through the bundled **`scripts/apify_enrich.sh`** — it wraps the
Apify run-sync calls, retries input field-name variants, and finds a live actor if the default 404s:
```bash
APIFY_TOKEN=$APIFY_TOKEN scripts/apify_enrich.sh linkedin "https://www.linkedin.com/in/<slug>"
APIFY_TOKEN=$APIFY_TOKEN scripts/apify_enrich.sh instagram <handle>   # creators / brand contacts only
```
- **Find the `/in/` URL first** if you only have a name: `mcp__jina-mcp-server__search_web` for
  `"<name>" "<company>" site:linkedin.com/in`; confirm company/role against the Step-2 signal.
- **Extract:** role/company, headline, location, career arc, education (LinkedIn); followers, bio,
  niche, cadence (Instagram). Keep the source URL with each fact for citation.
- **No `APIFY_TOKEN`?** Tell the user once, then skip to 3c (web) — don't block.
- Actor slugs, input field-name quirks, and IG etiquette → **`references/apify.md`** (read only if scraping misbehaves).

### 3c. Open web (always cheap, always allowed)
`mcp__jina-mcp-server__search_web` + `read_url` (or WebSearch/WebFetch) for: company website +
what the company does, recent news/press, a personal site/portfolio, podcasts/talks, GitHub.
This both fills gaps and **corroborates** LinkedIn (catches a stale/duplicate profile).

## Step 4 — write the dossier (one entity per file, append never overwrite)
Use the `wiki/people/<id>.md` schema (template `_templates/person.md`). `id` = stable kebab
slug (`firstname-lastname`); never change it once set.

Frontmatter to fill (only from sourced facts; leave unknowns `null`, don't guess):
`id, type: person, title, company, role, location, linkedin, email, phone, aliases,
relationship, how_we_met, introduced_by, source, tags, contributors`. Add `updated:` to today.
Add the current founder to `contributors:` (dedup; never remove others).

Body:
- **## Who they are** — 2–4 line bio, each non-obvious claim with `> from: <url>`.
- **## Connections** — `[[person-id]]` links to mutuals / who introduced them. Liberal linking
  is how the graph works.
- **## Interactions** — dated log; append `### YYYY-MM-DD` for this enrichment, newest at top,
  end the section with `> by: <founder>`.
- **## Opportunities / asks** — only if grounded (don't invent a sales angle).
- End any inferred line with `(inferred)`; never present inference as fact.

If the page exists: `edit_note` **append** a dated section + update frontmatter — do not rewrite history.

## Step 5 — close out
- Update `wiki/index.md` (add the new person to the catalog).
- Append one line to `wiki/log.md`: `## [YYYY-MM-DD] enriched <name> — sources: linkedin, web …`
- Anything low-confidence or ambiguous → a "Needs your eyes" bullet in today's `wiki/daily/<date>-<founder>.md`
  (or surface it to the user), rather than asserting it.
- Tell the user a tight summary: who they are, the 3–5 facts that matter to us, and any gaps.

## Failure modes to avoid
- Two "John"s merged into one dossier → always confirm with a second signal.
- LinkedIn says one company, email domain says another → record both, flag the conflict, don't pick silently.
- Apify token missing or actor dead → degrade to web search, say so, still write what you found.
- Scraping someone with zero business reason → don't. Enrichment serves a meeting/deal/relationship, not curiosity.
