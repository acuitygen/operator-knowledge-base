#!/usr/bin/env bash
# Usage: scripts/new-wiki.sh /absolute/path/to/MyWiki
# Creates the day-one folder (raw/, raw/assets/, wiki/ and its four page folders), copies the
# schema, index, and log templates, writes the first log line, and initializes a git repo.
set -euo pipefail

TARGET="${1:?Usage: new-wiki.sh /absolute/path/to/MyWiki}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TPL="$HERE/../templates"
TODAY="$(date +%Y-%m-%d)"

if [ -e "$TARGET" ]; then
  echo "Refusing to overwrite: $TARGET already exists" >&2
  exit 1
fi

mkdir -p "$TARGET"/raw/assets "$TARGET"/wiki/{sources,entities,concepts,answers}
cp "$TPL/CLAUDE.md" "$TPL/index.md" "$TPL/log.md" "$TARGET/"
printf '## [%s] init | wiki created from llm-wiki-setup\n' "$TODAY" >> "$TARGET/log.md"

( cd "$TARGET" && git init -q && git add -A && git commit -q -m "Create wiki from llm-wiki-setup" )

echo "Wiki created at $TARGET"
echo "Next: fill in the Domain line in CLAUDE.md, open the folder in Obsidian, then run 'claude' inside it."
