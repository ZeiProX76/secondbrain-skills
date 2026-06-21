# Second Brain — Agent Skills

Portable [agent skills](https://github.com/vercel-labs/skills) for our shared **second brain**.
Install them on any machine — yours, a co-founder's — and that machine's AI (Claude Code, Cursor,
etc.) knows how to **read/write the vault, run the sweep, prep meetings, enrich people, and
deep-dive an entity** — in any project. No need to clone the brain itself.

## Install (one command)

```bash
# Everything, globally (usable in every project on this machine) — recommended:
npx skills add -g ZeiProX76/secondbrain-skills --skill '*'

# Just one skill:
npx skills add -g ZeiProX76/secondbrain-skills --skill meeting-intel

# Into the current project only (./.claude/skills/):
npx skills add ZeiProX76/secondbrain-skills --skill '*'
```

Manage them:
```bash
npx skills list                       # what's installed
npx skills find meeting               # search
npx skills update                     # pull latest
npx skills remove deep-dive
```

`-g` installs to `~/.claude/skills/` (global); without it, to the project's `.claude/skills/`.

## The kit

| Skill | What it does | Use when |
|-------|--------------|----------|
| **second-brain** | read / write / query the shared vault | "what do we know about X", ingest a doc |
| **integrations** | discover the person's tools + how to use each (Notion/Gmail/Calendar/Drive/Granola/web/git) | wiring up sources, onboarding, "is X connected?" |
| **enrich-person** | cited dossier on a person (vault → LinkedIn/Apify, Instagram, web) | "who is X", before a meeting, a new name appears |
| **meeting-intel** | meeting → knowledge: prep before, distill transcript after | a call is coming up, a transcript lands |
| **deep-dive** | retroactive backfill — ALL history on one entity, reconcile, ask, write | "pull everything we have on X" |
| **sweep-coordinator** | nightly sweep as a fan-out workflow (one agent per source) | running / editing the nightly sweep |
| **sweep-setup** | build / modify a person's own nightly sweep | "set up my sweep", onboarding |

## Prerequisites (do once)

1. **Connect the shared brain.** The skills read/write the vault over the `second-brain` MCP
   (`https://mcp.tactmax.com/mcp`, behind Cloudflare Access). Add it to your AI tool's MCP config
   and authenticate. (Without it, `second-brain`, `meeting-intel`, `deep-dive` can't reach the vault.)
2. **For people enrichment** (`enrich-person`, `meeting-intel`): set `APIFY_TOKEN` in your shell
   env (get it at console.apify.com → Settings → Integrations). Optional — without it, enrichment
   degrades to plain web search instead of LinkedIn/Instagram scraping.

## Golden rules (baked into every skill)
Never invent a fact · cite every claim · dedup before writing · append, never overwrite · people
are first-class. The vault's `CLAUDE.md` is the authoritative schema; skills are the how-to.

## Authoring & evaluating skills

These skills are built with Anthropic's official **skill-creator** (best practices + an eval
harness). Install it alongside ours:
```bash
npx skills add -g anthropics/skills --skill skill-creator
```
- **Validate** a skill's frontmatter instantly (static, no API):
  `python3 ~/.agents/skills/skill-creator/scripts/quick_validate.py <skill-dir>` (needs `pyyaml`).
- **Optimize a description's triggering** empirically (60/40 train/test, runs `claude -p`):
  drop an `evals/trigger-eval.json` (array of `{query, should_trigger}`) in the skill, then
  `python -m scripts.run_loop --eval-set <…> --skill-path <…> --model <session-model> --max-iterations 5`
  from the skill-creator dir. Picks the best description by held-out test score.
- **Behavior/quality evals**: `evals/evals.json` + graded assertions + `aggregate_benchmark.py` +
  the HTML review viewer. See skill-creator's SKILL.md for the full loop.

## Contributing
- Skill names are **short + task-shaped** (`enrich-person`, `meeting-intel`). `name:` in the
  frontmatter must equal the folder name and be `a-z0-9-` only.
- **Gotcha:** never put a `: ` (colon-space) inside a `description:` value — the strict YAML parser
  `npx skills` uses will silently drop the skill. Use ` — ` (em-dash). Verify with
  `npx skills add ./skills --list` and check the count before pushing.
