---
description: Slack-only triage. Mentions and DMs, classified, with draft replies that wait for Send, Edit, or Skip.
argument-hint: [optional time window, default "today"]
allowed-tools: Read, Grep, Glob, Bash(gog calendar events *), Bash(node scripts/calendar-suggest.js *)
---

Triage my Slack as my chief of staff. This needs a Slack MCP server connected to Claude Code. If none is connected, say so and stop.

1. Read `SOUL.md`, `private/relationships.md`, and `private/preferences.md`. My Slack handle and the channels to watch are in `private/preferences.md`.

2. Fetch with the Slack MCP tools. Window: `$ARGUMENTS`, or today if empty.
   - Messages that mention me in that window.
   - DMs and group DMs with new messages in that window.
   - Threads I posted in that have new replies.

3. Pass the messages to the chief-of-staff agent. It classifies each one into one tier and drafts a reply for each action_required message:
   - **skip:** bots, joins and leaves, automated alerts.
   - **info_only:** `@channel` and `@here` announcements, file shares with no question, chatter.
   - **meeting_info:** meeting links, dates with meeting context, room shares.
   - **action_required:** a direct question to me, an `@mention` waiting on an answer, a scheduling ask.

4. Output skipped as a count, info_only as one line each, meeting_info checked against my calendar, and action_required numbered with the channel or person, the message, a draft reply in the register from `relationships.md`, then `[Send] [Edit] [Skip]`. Slack drafts are shorter than email. One to three sentences.

5. Send nothing until I choose. On Send, post with the Slack MCP post tool as a thread reply when the original was in a thread.

6. After each send, finish the follow-through checklist the hook gives you, then move to the next draft.
