# The Prompts

Paste these into Claude Code (or any agent) opened inside the wiki folder. The agent reads `CLAUDE.md` on start, so the prompts stay short. The schema carries the detail.

## First session: co-write the schema

```
Read CLAUDE.md. This wiki is about [your domain]. Before we ingest anything, interview me
one question at a time about what I want to track, which page types I need beyond source,
entity, concept, and answer, and what each page type should always contain. Then propose
edits to CLAUDE.md. Do not change it until I approve.
```

## Ingest one source

```
Ingest raw/[filename]. Follow the ingest steps in CLAUDE.md. Stop after the takeaways and
wait for me.
```

## Ingest a batch

Once the schema has held up for a dozen sources.

```
Ingest every file in raw/ that does not have a source page yet. Follow CLAUDE.md. Skip the
takeaway discussion. At the end, list every page you created or changed and every
contradiction you found.
```

## Query

```
From the wiki only: [question]. Cite the pages you used. If the wiki does not know, tell me
which source would answer it.
```

## File an answer back

```
File that answer in wiki/answers/. Link it from every page it draws on, add it to the index,
and log it.
```

## Lint

```
Lint the wiki. Follow the lint steps in CLAUDE.md. Fix links, frontmatter, and index entries.
List everything else for me to decide.
```

## Find the next sources

```
Read index.md and the five most-linked concept pages. What are the three questions this wiki
cannot answer yet, and what sources would answer them?
```
