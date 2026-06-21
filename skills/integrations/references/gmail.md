# Gmail

Two ways in — an MCP, or a CLI. Use whichever is connected for this person.

## Gmail MCP (`mcp__claude_ai_Gmail__*`)
- `search_threads` — search with Gmail operators (below). Primary read tool.
- `get_thread` — full thread content by id.
- `create_draft` — draft a reply (never auto-send; a human reviews).
- `list_labels` / `label_thread` / `label_message` — organize.

## CLI fallback
Some setups use a Python CLI (e.g. a `gmail.py`) with an OAuth token instead of the MCP. If the MCP
isn't connected, look for the person's CLI and use it the same way (search → read).

## Search operators (both paths)
- `newer_than:1d` / `newer_than:7d` — the sweep window.
- `from:alice@x.com`, `to:me`, `subject:"contract"`, `has:attachment`, `label:deals`, `is:unread`.
- All-time search (for `deep-dive`): drop the date filter, search the name/domain across everything.

## Ingest pattern
Sweep: pull the window, distill new people / deals / decisions / asks into the vault, cite the
thread (`> from: gmail <subject> <date>`). **Privacy first** — never ingest excluded/personal
labels; respect the person's stated exclusions. Numbers only if literally in the email.
