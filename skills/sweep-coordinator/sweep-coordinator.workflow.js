export const meta = {
  name: 'sweep-coordinator',
  description: 'Nightly second-brain sweep as a fan-out: per-source gather agents → single reconciling ingest into the shared vault',
  whenToUse: 'Run as the nightly sweep (or on demand) to ingest the last day across git/email/calendar/drive/notion/transcripts into the shared second brain.',
  phases: [
    { title: 'Gather', detail: 'one read-only agent per source pulls the window and returns cited findings' },
    { title: 'Ingest', detail: 'one agent reconciles all findings, dedups against the vault, writes entities + the daily roll-up' },
  ],
}

// ── Config comes in via `args` (the nightly runner passes it). Sensible defaults below. ──
// args = { founder, date, window, sources: ['git','gmail','calendar','drive','notion','transcripts'] }
const cfg = args || {}
const founder = cfg.founder || 'hugues'
const date = cfg.date || 'today'            // pass an ISO date; scripts can't call Date.now()
const window = cfg.window || 'last 24h'
const SOURCES = cfg.sources || ['git', 'gmail', 'calendar', 'drive', 'notion', 'transcripts']

const CONTRACT = `Read the vault operating manual CLAUDE.md FIRST (second-brain MCP read_note "CLAUDE",
or your vault CLAUDE.md). Obey its golden rules: never invent a name/number/date/
relationship; cite every fact; people are first-class. You are sweeping for founder "${founder}",
window "${window}", target date "${date}".`

// Each gather agent is READ-ONLY: it pulls its one source and returns cited findings. It does NOT
// write to the vault — that happens once, in the Ingest phase, to avoid concurrent-write races on
// shared pages (e.g. two agents appending to the same person dossier).
const FINDINGS_SCHEMA = {
  type: 'object',
  required: ['source', 'items'],
  properties: {
    source: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        required: ['entity', 'entityType', 'fact', 'sourceRef'],
        properties: {
          entity: { type: 'string', description: 'who/what this is about (person/company/project/deal name)' },
          entityType: { type: 'string', enum: ['person', 'company', 'client', 'project', 'deal', 'meeting', 'decision', 'idea', 'other'] },
          fact: { type: 'string', description: 'the distilled, sourced fact — verbatim where it matters' },
          date: { type: 'string', description: 'ISO date of the fact if known, else empty' },
          sourceRef: { type: 'string', description: 'citation: url, raw/sessions/<file>, gmail thread id, calendar event, etc.' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
      },
    },
    notes: { type: 'string', description: 'anything unreadable / ambiguous / needs-human — do NOT assert it as fact' },
  },
}

// One specialized gather agent per source. Same skeleton, source-specific instructions.
const SOURCE_PROMPTS = {
  git: `${CONTRACT}
SOURCE = local git work. Inspect today's commits and new files across ${founder}'s active repos
(see your sweep config SB_REPOS, or run the repo's digest.sh output if provided).
Return what was built/decided/shipped as cited findings (sourceRef = repo + commit sha).`,
  gmail: `${CONTRACT}
SOURCE = email (${window}). Use the Gmail MCP or your Gmail MCP or CLI. Pull threads in the
window: new people, deals, decisions, asks, intros. sourceRef = gmail thread id/subject+date.
Do NOT ingest excluded/private labels. Quote numbers only if literally present.`,
  calendar: `${CONTRACT}
SOURCE = Google Calendar (${window} + next 48h). List events: who, what, when. Each external
person → a finding (entityType person) so they get a dossier. sourceRef = event title+date.`,
  drive: `${CONTRACT}
SOURCE = Google Drive. Find docs/decks/contracts created or modified in the window. Summarize the
substantive ones (decisions, deal terms, plans) as cited findings. sourceRef = file name+url.`,
  notion: `${CONTRACT}
SOURCE = Notion ("The OS" workspace). notion-search for pages touched in the window. Distill
decisions/tasks/notes as cited findings. sourceRef = notion page title+url.`,
  transcripts: `${CONTRACT}
SOURCE = meeting transcripts. Scan raw/inbox/ and raw/sessions/ for new transcripts in the window.
For each: attendees (each a person finding), decisions, action items. sourceRef = raw/sessions/<file>.
Heavy transcript distillation can defer to the meeting-intel skill's PROCESS routine.`,
}

phase('Gather')
const gathered = await parallel(
  SOURCES.map((src) => () =>
    agent(SOURCE_PROMPTS[src] || `${CONTRACT}\nSOURCE = ${src}. Pull the window and return cited findings.`, {
      label: `gather:${src}`,
      phase: 'Gather',
      schema: FINDINGS_SCHEMA,
    })
  )
)

const findings = gathered.filter(Boolean)
const totalItems = findings.reduce((n, f) => n + (f.items?.length || 0), 0)
log(`Gathered ${totalItems} findings across ${findings.length}/${SOURCES.length} sources`)

if (totalItems === 0) {
  log('Nothing to ingest this run.')
  return { date, founder, sources: SOURCES, findings: 0, ingested: false }
}

// One reconciling ingest. Single writer = no race on shared pages; it dedups across ALL sources
// at once (the same person showing up in email + calendar + a transcript collapses into one update).
phase('Ingest')
const INGEST_PROMPT = `${CONTRACT}
You are the INGEST step. Below are cited findings gathered from every source this run. Write them
into the shared vault per CLAUDE.md:
- DEDUP first (search_notes + index.md); enrich existing pages in place, one entity per file.
- New real people → wiki/people/<id>.md (this is where new names enter the brain).
- Append dated "### ${date}" sections (newest first); NEVER overwrite history. End each with "> by: ${founder}".
- Cite every fact (carry the sourceRef through as "> from: <ref>"). Label any inference "(inferred)".
- Update wiki/index.md; append one line to wiki/log.md.
- Write the daily roll-up wiki/daily/${date}-${founder}.md: highlights, new people/deals, action
  items, and a "Needs your eyes" list for everything low-confidence or flagged in source notes.
Do NOT assert anything from a "notes"/low-confidence field as fact — route it to "Needs your eyes".

FINDINGS (JSON):
${JSON.stringify(findings, null, 2)}`

const result = await agent(INGEST_PROMPT, { label: `ingest:${founder}`, phase: 'Ingest' })

return { date, founder, sources: SOURCES, findings: totalItems, ingested: true, summary: result }
