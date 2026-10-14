---
name: wiki-ingest
description: Fold a source into your LLM wiki from ANY project. Reads the source, writes its summary page, updates every entity and concept page it touches, flags contradictions, updates index.md and log.md. Use when the user says "ingest this", "add this to the wiki", "file this", or names a file in raw/.
argument-hint: [file in raw/, a URL, or pasted text]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch
---

# /wiki-ingest

Runs the wiki's `ingest` operation no matter what directory you are in.

**WIKI ROOT:** `/ABSOLUTE/PATH/TO/MyWiki`

## How to run

1. Read `<WIKI ROOT>/CLAUDE.md` first, every time. It is the schema and it wins over anything below.
2. Resolve `$ARGUMENTS`:
   - A path in `raw/`: use it.
   - A URL: fetch it, save it as markdown to `<WIKI ROOT>/raw/YYYY-MM-DD-slug.md`, then use that file.
   - Pasted text: save it to `<WIKI ROOT>/raw/YYYY-MM-DD-slug.md`, then use that file.
   - Empty: list the files in `raw/` that have no source page in `wiki/sources/` and ask which one.
3. Run the ingest steps exactly as `CLAUDE.md` defines them: takeaways first and wait for the user, then the source page, every entity and concept page the source touches, contradictions kept with both sources, the `index.md` line, the `log.md` line.
4. Never edit anything already in `raw/`. Always write with absolute paths under `<WIKI ROOT>`. Never create wiki files inside the current project.
5. Finish with a list of every page created or changed.

$ARGUMENTS
