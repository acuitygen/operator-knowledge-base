#!/usr/bin/env bash
# Usage: scripts/new-vault.sh /absolute/path/to/MyVault
# Copies the starter vault to the target, stamps today's date into index.md and hot.md,
# writes the first log line, and initializes a git repo so you get history for free.
set -euo pipefail

TARGET="${1:?Usage: new-vault.sh /absolute/path/to/MyVault}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$HERE/../templates/vault"
TODAY="$(date +%Y-%m-%d)"
NOW="$(date '+%Y-%m-%d %H:%M')"

if [ -e "$TARGET" ]; then
  echo "Refusing to overwrite: $TARGET already exists" >&2
  exit 1
fi

mkdir -p "$(dirname "$TARGET")"
cp -R "$SRC" "$TARGET"
mkdir -p "$TARGET/sources/$(date +%Y)"

# Stamp real dates into the two root pages the agent reads first.
# Write to a temp file and move it back: `sed -i` differs between BSD (macOS) and GNU (Linux).
for f in "$TARGET/index.md" "$TARGET/hot.md"; do
  sed "s/YYYY-MM-DD/$TODAY/g" "$f" > "$f.tmp" && mv "$f.tmp" "$f"
done
printf '## [%s] init | vault created from agent-vault-starter\n' "$NOW" >> "$TARGET/log.md"

( cd "$TARGET" && git init -q && git add -A && git commit -q -m "Create vault from agent-vault-starter" )

echo "Vault created at $TARGET"
echo "Next: open it in Obsidian, then run 'claude' inside it and type /ingest"
