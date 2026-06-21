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

### 3a. LinkedIn — via Apify (the primary professional source)
LinkedIn is the spine of a professional dossier. Scrape it through Apify.
- **Token:** read `APIFY_TOKEN` from the environment, else from the gitignored
  your secrets store (a gitignored SETUP.md, or your shell env). If neither exists, tell the user: *"Add `APIFY_TOKEN=…` to
  SETUP.md (and `export` it) — get it at console.apify.com → Settings → Integrations."* Then
  skip LinkedIn and fall back to 3c for this run.
- **Find the profile URL** if you only have a name: `mcp__jina-mcp-server__search_web` for
  `"<name>" "<company>" site:linkedin.com/in` (or a plain web search), take the best `/in/` URL.
  Confirm company/role against Step-2 signal before trusting it.
- **Scrape it** — Apify run-sync (synchronous, returns dataset items):
  ```bash
  curl -s "https://api.apify.com/v2/acts/${LINKEDIN_ACTOR:-dev_fusion~linkedin-profile-scraper}/run-sync-get-dataset-items?token=$APIFY_TOKEN" \
    -H 'Content-Type: application/json' \
    -d '{"profileUrls":["<linkedin-url>"]}'
  ```
  Actor slugs change — `dev_fusion~linkedin-profile-scraper` and `apimaestro~linkedin-profile-detail`
  are common public ones; if a run 404s, `curl "https://api.apify.com/v2/store?search=linkedin+profile&token=$APIFY_TOKEN"`
  to find a live actor and set `LINKEDIN_ACTOR` (store the chosen slug in SETUP.md so it's stable).
  Mind the input-schema field name (`profileUrls` vs `urls` vs `username`) — read the actor page if a run rejects input.
- **Extract:** current role + company, headline, location, past roles (career arc),
  education, and anything they volunteer (interests, mutuals). Keep the source URL per fact.

### 3b. Instagram / creator surfaces (when relevant)
For creators, brand-deal contacts, or anyone whose IG matters to us (this is a reels/content
business), pull Instagram via Apify's **official, stable** actor:
```bash
curl -s "https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=$APIFY_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"usernames":["<handle>"],"resultsLimit":1}'
```
Extract follower count, bio, niche, post cadence, links. Useful for sizing a creator/brand.
Skip for ordinary professional contacts — don't scrape someone's personal IG without a reason.

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
