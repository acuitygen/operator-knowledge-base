---
name: wiki-lint
description: Health-check your LLM wiki from ANY project. Finds contradictions, superseded claims, orphan pages, missing pages, missing links, broken frontmatter, and gaps a web search could fill. Reports, and fixes the safe issues on request. Use when the user says "lint the wiki", "check the wiki", or for the weekly pass.
argument-hint: [report | fix]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# /wiki-lint

Runs the wiki's `lint` operation no matter what directory you are in.

**WIKI ROOT:** `/ABSOLUTE/PATH/TO/MyWiki`

## How to run

1. Read `<WIKI ROOT>/CLAUDE.md` first.
2. Mode from `$ARGUMENTS`: empty or `report` changes nothing. `fix` applies the safe fixes.
3. Check, in this order:
   - Contradictions between pages
   - Claims a newer source has superseded
   - Orphan pages: no inbound wikilinks and no `index.md` line
   - Entities or concepts mentioned on three or more pages without their own page
   - Mentions of an existing page that are not wikilinked
   - Broken wikilinks
   - Pages missing a required frontmatter field
   - Gaps a web search could fill, with the search you would run
4. Report every finding as a list, grouped by check, with the page path.
5. In `fix` mode, fix only links, frontmatter fields, and `index.md` lines. Anything that changes a claim goes back to the user as a question.
6. Append one `log.md` line for the pass.

$ARGUMENTS
