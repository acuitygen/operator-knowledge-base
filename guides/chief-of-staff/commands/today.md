---
description: Morning briefing. Today's calendar, email and Slack triage, pending responses, and overdue tasks.
allowed-tools: Read, Grep, Glob, Bash(gog gmail search *), Bash(gog gmail thread get *), Bash(gog calendar events *), Bash(node scripts/calendar-suggest.js *)
---

Run my daily briefing as my chief of staff.

## 1. Load memory

Read these files first: `SOUL.md`, `private/relationships.md`, `private/preferences.md`, `private/todo.md`.

## 2. Fetch every channel

Fetch in parallel. Use whichever Gmail access is set up: the `gog` CLI if it is on PATH, otherwise the Gmail MCP server's search and read tools.

- **Email with gog:** `gog gmail search "is:unread -category:promotions -category:social" --max 20 --json`
- **Email with a Gmail MCP server:** search with the same query, max 20, then read each result.
- **Calendar with gog:** `gog calendar events --today --all --max 30 --json`
- **Calendar with MCP:** list today's events on every calendar with your calendar tool.
- **Slack (if a Slack MCP server is connected):** messages that mention me today, plus DMs and group DMs from the last 4 hours.

If a channel is not connected, say so in one line and continue with the rest.

## 3. Triage

Pass everything you fetched to the chief-of-staff agent. It classifies every message into exactly one tier, in this order: skip, info_only, meeting_info, action_required, after applying the overrides in `private/preferences.md`.

For every action_required message, the agent drafts a reply using the sender's section in `private/relationships.md` and the tone rules in `SOUL.md`. If the message asks to schedule something, get free slots with `node scripts/calendar-suggest.js` (defaults in `private/preferences.md`) and offer two or three of them.

## 4. Brief me

Output in this order:

- **Schedule:** today's events with time, title, location or link, and whether I need to prep.
- **Skipped:** count only.
- **Info only:** one line each.
- **Meeting info:** what was cross-referenced with the calendar and anything missing (link, room, time).
- **Action required:** numbered. Sender, subject, one-line summary, full draft reply, then `[Send] [Edit] [Skip]`.
- **Triage queue:** pending responses past their follow-up date and overdue tasks from `private/todo.md`.

## 5. Wait for me

Do not send anything. Wait for my choice on each draft. On Send, send through the same channel the message came in on, as a reply in the original thread. On Edit, apply my changes and show the draft again. On Skip, leave the message unread.

After each send, finish the follow-through checklist the hook gives you before moving to the next draft.
