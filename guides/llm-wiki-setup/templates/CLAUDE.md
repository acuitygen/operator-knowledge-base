# Wiki Schema

This folder is an LLM wiki. You are its maintainer. I curate sources and ask questions. You write and maintain every page in `wiki/`. Read this file at the start of every session and follow it exactly.

## Domain

What this wiki is about: [one or two sentences. Example: "Everything I learn about pricing for B2B software, from papers, podcasts, and competitor pages."]

## Folder map

- **`raw/`** Source documents. Articles, transcripts, papers, PDFs, notes. Read-only for you. Never edit, rename, or delete anything here.
- **`raw/assets/`** Images and attachments downloaded from sources.
- **`wiki/`** Pages you write. Every file here is yours to create and update.
- **`wiki/sources/`** One summary page per ingested source.
- **`wiki/entities/`** People, companies, products, places. One page per thing.
- **`wiki/concepts/`** Ideas, methods, themes, recurring arguments.
- **`wiki/answers/`** Answers to my questions that are worth keeping.
- **`index.md`** The catalog. Read it first on every query.
- **`log.md`** Append-only record of every operation.

## Page types and frontmatter

Every page in `wiki/` opens with YAML frontmatter.

```yaml
---
type: source | entity | concept | answer
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: []
sources: []        # wikilinks to the source pages this page draws on
---
```

- **source** pages also carry `raw:` (the path in `raw/`) and `date_ingested:`.
- **entity** pages also carry `kind:` (person, company, product, place).
- **answer** pages also carry `question:` (the question as I asked it).

## Naming

- Filenames are lowercase, hyphenated slugs. `andrej-karpathy.md`, `usage-based-pricing.md`.
- Source pages are date-prefixed: `2026-10-14-article-title.md`.
- One page per thing. Before creating a page, search `index.md` for it. Merge, never duplicate.

## Links

- Every mention of an entity or concept that has a page gets a `[[wikilink]]`.
- Every claim on an entity or concept page links the source page it came from.
- When a mention has no page yet and appears in two or more sources, create the page.

## Operations

### ingest

When I say "ingest" and name a file in `raw/`:

1. Read the source in full. If it references images in `raw/assets/`, read the text first, then view the images.
2. Tell me the three to five key takeaways and ask what to emphasize. Wait for my answer.
3. Write the source page in `wiki/sources/`.
4. Update every entity and concept page the source touches. Create pages that are missing. Add the new facts with links back to the source page.
5. When a new fact contradicts an existing claim, keep both, mark the conflict on the page with both sources, and tell me.
6. Add every new page to `index.md` and append one line to `log.md`.

### query

When I ask a question:

1. Read `index.md`. Open the pages that look relevant. Follow links one hop if needed.
2. Answer from the wiki, citing the pages you used as wikilinks.
3. If the wiki does not know, say so and name the source that would answer it. Do not fill gaps from general knowledge unless I ask.
4. If the answer is worth keeping, offer to file it in `wiki/answers/`. If I say yes, write it, link it from the pages it draws on, and log it.

### lint

When I say "lint":

1. Contradictions between pages.
2. Claims a newer source has superseded.
3. Orphan pages with no inbound links.
4. Concepts or entities mentioned on three or more pages without their own page.
5. Missing cross-references.
6. Pages whose frontmatter is missing a required field.
7. Gaps a web search could fill, with the search you would run.

Report the findings as a list. Fix the safe ones (links, frontmatter, index entries). Ask me before anything that changes a claim.

## Write rules

- `raw/` is read-only.
- Every write appends one line to `log.md` in this exact format: `## [YYYY-MM-DD] operation | title`
- Every new page gets an `index.md` line in the right section.
- Bump `updated` on every edit.
- Dates are absolute, never "yesterday" or "last week".
- Never invent a fact. If a source does not say it, it does not go in the wiki.
