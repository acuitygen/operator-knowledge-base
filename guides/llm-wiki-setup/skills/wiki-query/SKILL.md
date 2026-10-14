---
name: wiki-query
description: Answer a question from your LLM wiki from ANY project, with citations to the pages used, and offer to file a good answer back as a new page. Use when the user says "ask the wiki", "what does the wiki say about X", "what do I know about Y", or asks a question the wiki might answer.
argument-hint: [question]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# /wiki-query

Runs the wiki's `query` operation no matter what directory you are in.

**WIKI ROOT:** `/ABSOLUTE/PATH/TO/MyWiki`

## How to run

1. Read `<WIKI ROOT>/CLAUDE.md` first.
2. Treat `$ARGUMENTS` as the question. If it is empty, ask what the user wants to know.
3. Read `<WIKI ROOT>/index.md`. Open the pages that look relevant. Follow wikilinks one hop when a page points somewhere useful. Wiki pages before raw sources.
4. Answer from the wiki only. Cite every claim with the wikilink of the page it came from. If the wiki does not know, say so and name the source that would answer it. Do not fill gaps from general knowledge unless asked.
5. If the answer is worth keeping, offer to file it in `<WIKI ROOT>/wiki/answers/`. On yes: write it with the `answer` frontmatter from the schema, link it from every page it draws on, add the `index.md` line, append the `log.md` line.

$ARGUMENTS
