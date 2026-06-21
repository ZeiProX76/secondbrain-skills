# Google Drive (MCP)

Tools are `mcp__claude_ai_Google_Drive__*`. Drive holds the heavy artifacts — decks, contracts,
spreadsheets, planning docs.

## Read / search
- `search_files` — find files by name/content. Start here.
- `list_recent_files` — what changed recently (sweep window).
- `get_file_metadata` / `get_file_permissions` — owner, modified time, sharing.
- `read_file_content` — read a doc/sheet's content (Google-native formats).
- `download_file_content` — pull binary content (PDF, images) for extraction.

## Write (rare)
- `create_file`, `copy_file` — create/duplicate. Most brain work is read-only ingest, not writing to Drive.

## Ingest pattern
Sweep: `list_recent_files` in the window → for substantive docs (decisions, deal terms, plans),
`read_file_content` and distill into the vault with a citation (`> from: drive <file name> <url>`).
Deep-dive: `search_files` for every doc naming the entity, read the relevant ones, add to the
timeline. Don't copy whole docs into the wiki — distill the durable facts and link the source.
