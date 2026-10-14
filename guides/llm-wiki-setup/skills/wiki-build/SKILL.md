---
name: wiki-build
description: Run one enrichment pass on your LLM wiki from ANY project. Picks the single highest-value gap, fixes it end to end, and logs it. Built to run on a loop. Use when the user says "build the wiki", "enrich the wiki", or as the body of /loop.
argument-hint: [optional focus: entities | concepts | sources | answers]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch, WebSearch
---

# /wiki-build

One enrichment iteration on the wiki, no matter what directory you are in.

**WIKI ROOT:** `/ABSOLUTE/PATH/TO/MyWiki`

## How to run

1. Read `<WIKI ROOT>/CLAUDE.md`, `<WIKI ROOT>/index.md`, and the last ten lines of `<WIKI ROOT>/log.md` so you do not repeat recent work.
2. Pick ONE task, highest value first:
   - A file in `raw/` with no source page yet: ingest it.
   - An entity or concept mentioned on three or more pages with no page of its own: create it from what the wiki already says.
   - A page with only one source behind it that a second source in `raw/` also covers: merge in the second source.
   - An orphan page: link it from the pages that should point to it and add its `index.md` line.
   - A gap a lint pass flagged: run the web search, save what you find to `raw/`, then ingest it.
   Treat `$ARGUMENTS` as an optional focus area.
3. Finish that one task completely, following every write rule in the schema.
4. Append one `log.md` line. Report what you did and what the next highest-value task is.
5. Do not chain tasks. The loop is the chain. Run it with `/loop 30m /wiki-build`.

$ARGUMENTS
