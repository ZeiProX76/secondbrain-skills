---
name: second-brain
description: Read, write, and query the shared founder "second brain" — a markdown knowledge vault (people, projects, deals, decisions, ideas, meetings, daily) exposed via the Basic Memory MCP. Use whenever the user asks what we know about a person/project/deal, wants to capture/ingest a doc or transcript, or runs their daily context sweep. Portable — install on any teammate's machine so their Claude knows the shared brain.
---

# Second Brain — how to use the shared knowledge vault

This skill makes any Claude session able to read, write, and query the team's shared
"second brain": a markdown knowledge base of everything that matters (people/CRM, projects,
deals, decisions, ideas, meetings, daily logs). Markdown is the source of truth; an MCP
server (Basic Memory) gives you read/write/search over it.

## Connection (one of two, both fine)
- **Remote MCP** — the shared server. An MCP server named `second-brain` should be configured
  (`https://mcp.tactmax.com/mcp`, behind auth). Use its tools directly.
- **Local MCP** — if you have the vault synced locally (via Obsidian LiveSync), a local
  Basic Memory pointed at that folder works tokenlessly and is faster for your own sweeps.
Either way the tools are the same: `search_notes`, `read_note`, `write_note`, `edit_note`,
`build_context`, `recent_activity`.

## ALWAYS read the contract first
Before writing anything, read the vault's operating manual: **`CLAUDE.md`** at the vault root
(`read_note` the note titled "CLAUDE", or open `vault/CLAUDE.md`). It is the schema and the law.
This skill is the portable summary; CLAUDE.md is authoritative — if they ever conflict, CLAUDE.md wins.

## The shape of the brain
- `raw/` — immutable capture (inbox drops, transcripts, assets). Agents READ it, never rewrite it.
- `wiki/` — the distilled, agent-owned knowledge. **Query here, not raw.** Each venture/codebase is
  `projects/<name>/` (frontmatter `kind: code|content`) owning its own `coding/` (technical:
  code/architecture/features) + `ideas/` (non-technical/business: prospects, topics) + `clients/`
  (active paying customers; prospects go in `ideas/`); the cross-cutting folders stay flat & shared:
  `people/ companies/ meetings/ daily/` + deals grouped per owning founder under `deals/<founder>/`
  (`deals/hugues/ deals/koen/`) + `index.md` (catalog) + `log.md` (history).
- Every wiki note has frontmatter `id` (stable kebab slug) + `type`
  (`person|project|idea|decision|deal|meeting|daily|company|client`), and links others with
  `[[wikilinks]]`. A `project` page also sets `kind:`; a `client` page sets `project:`.

## The three operations
1. **QUERY** — answer questions. Search the **wiki first** (`search_notes`), traverse `[[links]]`,
   only fall back to `raw/` if the wiki lacks coverage (then ingest what was missing).
2. **INGEST** (raw → wiki) — distill a source into wiki pages: extract people/decisions/ideas/
   deals/facts, one entity per file, new people get a `people/` dossier, enrich existing pages
   in place. Then update `index.md` and append to `log.md`.
3. **MY SWEEP** — the daily run: gather today's local work (git, transcripts, the person's own
   email/calendar/Notion via their tools), ingest it, and write a `wiki/daily/<date>-<name>.md`.

## Golden rules (non-negotiable)
- **Never invent** a name, number, amount, date, brand, or relationship. Unreadable source → say so.
- **Cite provenance** on every fact: inline `> from: <source>`.
- **Dedup before writing** (`search_notes` + `index.md`); enrich existing pages, don't duplicate.
- **Append, never overwrite** — add a dated `## YYYY-MM-DD` section; preserve history.
- **People are first-class** — anyone real mentioned gets/updates a `people/` dossier.
- Retrieval is lexical (FTS) + `[[links]]`. No embeddings/RAG; the link-graph is the graph.

## When to use this skill
The user asks "what do we know about <person/company/deal/project>", "who is X", "what did we
decide about Y", "ingest this doc/transcript", "what happened today", or "run my sweep".
