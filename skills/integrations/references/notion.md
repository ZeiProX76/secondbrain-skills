# Notion (MCP)

Tools are `mcp__claude_ai_Notion__*`. Notion is where roadmaps, tasks, meeting notes, and internal
docs often live (this team's workspace is "The OS").

## Read / search
- `notion-search` — keyword search across the workspace. Start here for "what's in Notion about X".
- `notion-fetch` — fetch a specific page/block by URL or id (full content).
- `notion-query-data-sources` / `notion-query-database-view` — query a database with filters/sorts
  (e.g. a tasks DB by status, a CRM DB by stage).
- `notion-query-meeting-notes` — pull meeting-notes pages specifically.
- `notion-get-users` / `notion-get-teams` — resolve people/teams (map a Notion person to a vault dossier).

## Write
- `notion-create-pages` — create page(s).
- `notion-update-page` — edit an existing page.
- `notion-create-comment` / `notion-get-comments` — discussion threads.
- `notion-create-database`, `notion-create-view`, `notion-update-data-source` — schema-level (rare).

## Sweep / ingest pattern
Pull pages touched in the window (`notion-search` + recency), distill decisions/tasks/notes into the
vault with citations (`> from: <notion page url>`). Don't mirror Notion verbatim — distill the
durable facts. For a deep-dive, `notion-search` the entity across the whole workspace.
