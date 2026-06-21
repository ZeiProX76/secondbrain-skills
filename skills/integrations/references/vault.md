# Vault — the shared second brain (Basic Memory MCP)

The knowledge base itself. Server name `second-brain` (remote `https://mcp.tactmax.com/mcp`, or a
local Basic Memory pointed at a synced vault). **Always read the vault's `CLAUDE.md` first** — it's
the schema and the law.

## Tools (`mcp__second-brain__*`)
- `search_notes` — lexical full-text search. Your default for "do we know X". No embeddings; it's
  FTS + `[[wikilinks]]`, so search exact names/terms.
- `read_note` — read one note by title/permalink (e.g. read `CLAUDE` for the schema).
- `write_note` — create/replace a note. Use for a brand-new entity page.
- `edit_note` — **append / prepend / find_replace / replace_section**. Use **append** for dated
  `## YYYY-MM-DD` sections — this is how you add to a person/deal without overwriting history.
- `build_context` — pull related context to continue work on a topic.
- `recent_activity` — what changed recently (good for "what happened lately").
- `list_directory`, `read_content`, `view_note` — browse/inspect raw structure.

## The rules (from CLAUDE.md)
Never invent · cite provenance on every fact (`> from: <source>`) · dedup before writing
(`search_notes` + `index.md`) · append never overwrite · people are first-class (anyone real → a
`wiki/people/` dossier) · update `wiki/index.md` + append `wiki/log.md` after an ingest.

## Shape
`raw/` (immutable capture: inbox, sessions, assets) → `wiki/` (distilled: projects/, people/,
clients/, companies/, deals/, meetings/, daily/, index.md, log.md). Query `wiki/`, not `raw/`.
