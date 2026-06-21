# Google Calendar

**Status note:** a Calendar MCP is frequently NOT connected (the sweep has logged "Google Calendar
MCP not connected"). Calendar is high-value — it's the meeting timeline that powers `meeting-intel`
(who am I meeting, when did we last talk) — so wiring it in is worth it.

## If a Calendar MCP is connected
Use its tools to: list events in a window (past for the timeline, next 24–48h for prep), read
attendees + emails (each external attendee → a person finding so they get a dossier), and the event
title/description (the meeting's purpose). Build first-contact → cadence → last-touch per person.

## If it is NOT connected (close the gap)
Don't trust memory on the current setup — web-search the latest method (it changes), e.g.:
- a Google Calendar MCP server (community or official) added via `claude mcp add ...`, OR
- the `gcalcli` CLI (`brew install gcalcli`, OAuth), OR
- a calendar export / ICS feed the sweep reads.
Print the exact connect commands; for OAuth the person runs it themselves. Then re-probe to confirm.

## Ingest pattern
Each event → who/what/when. External attendees become `people/` findings. Feeds the meeting timeline
the rest of the kit relies on. Cite `> from: calendar <event title> <date>`.
