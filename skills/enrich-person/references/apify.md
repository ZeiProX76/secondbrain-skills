# Apify enrichment — reference

Deep detail for scraping profiles via Apify. The SKILL.md points here so the main file stays
lean; read this only when you actually need to scrape. The bundled `scripts/apify_enrich.sh`
wraps all of this — prefer the script; this doc is for when you need to debug or adapt it.

## Token
`APIFY_TOKEN` comes from your shell env (or your secrets store). Get it at
console.apify.com → Settings → Integrations. If it's missing, **do not block** — tell the user once
and fall back to web search (Jina / WebSearch) for this run.

## LinkedIn
The spine of a professional dossier. Find the `/in/` URL first (web-search `"<name>" "<company>"
site:linkedin.com/in`, confirm company/role against what you already know), then:

```bash
APIFY_TOKEN=$APIFY_TOKEN scripts/apify_enrich.sh linkedin "https://www.linkedin.com/in/<slug>"
```

- Default actor `dev_fusion~linkedin-profile-scraper`; `apimaestro~linkedin-profile-detail` is a
  good alternative. Override with `LINKEDIN_ACTOR=<slug>` (and record the working one in your env
  so it's stable across runs).
- Actor input field names drift (`profileUrls` vs `urls` vs `username`). The script already retries
  `profileUrls`→`urls`; if both fail, open the actor's page on apify.com and check its input schema.
- If the default actor 404s (deprecated/removed), find a live one:
  ```bash
  scripts/apify_enrich.sh actors "linkedin profile"
  ```
- **Extract:** current role + company, headline, location, career arc (past roles), education,
  volunteered interests/mutuals. Keep the source URL with each fact for citation.

## Instagram (creators / brand-deal contacts only)
This is a reels/content business, so a creator's IG matters. Use the **official, stable** actor:

```bash
APIFY_TOKEN=$APIFY_TOKEN scripts/apify_enrich.sh instagram <handle>
```

- Default actor `apify~instagram-scraper` (override `INSTAGRAM_ACTOR=`).
- **Extract:** follower count, bio, niche, post cadence, links — enough to size the creator/brand.
- Skip for ordinary professional contacts. Don't scrape a personal IG without a business reason.

## Cost / etiquette
Apify runs cost compute credits — scrape once per person per enrichment, not repeatedly. Cache the
result into the dossier so a future enrichment reads the vault instead of re-scraping.
