# Log

Append-only. One line per operation, newest at the bottom. Every line starts with the same prefix so it can be read with grep.

`grep "^## \[" log.md | tail -5` returns the last five operations.

