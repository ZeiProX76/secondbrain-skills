# Web research (Jina MCP + built-ins)

For enrichment, corroboration, and "what is this company/person publicly".

## Jina MCP (`mcp__jina-mcp-server__*`) — preferred (no scraping-ToS risk, no API key juggling)
- `search_web` — web search. The default for "find X online".
- `read_url` — read/extract a page's content (clean text). Use after a search to read the best hit.
- `parallel_search_web` / `parallel_read_url` — fan out multiple queries/URLs at once (fast for a
  deep-dive gathering across many sources).
- `capture_screenshot_url` — see what a page looks like (visual proof).
- `extract_pdf` — pull tables/figures/text from a PDF.
- `search_images` — find images (a person's photo, a brand's assets).

## Built-in fallback
`WebSearch` + `WebFetch` work too if Jina isn't connected.

## Patterns
- **Person enrichment:** find the LinkedIn `/in/` URL (`search_web` for
  `"<name>" "<company>" site:linkedin.com/in`), then corroborate with company site + recent news.
- **Company:** current state, what they do, funding/press, headcount — `search_web` + `read_url`.
- **Always cite** the source URL on every fact pulled from the web. Web claims are inference until a
  primary source confirms — label uncertain ones.
