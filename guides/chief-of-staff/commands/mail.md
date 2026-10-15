---
description: Email-only triage. Classify unread mail, draft replies, wait for Send, Edit, or Skip.
argument-hint: [optional Gmail search query]
allowed-tools: Read, Grep, Glob, Bash(gog gmail search *), Bash(gog gmail thread get *), Bash(gog calendar events *), Bash(node scripts/calendar-suggest.js *)
---

Triage my email as my chief of staff.

1. Read `SOUL.md`, `private/relationships.md`, and `private/preferences.md`.

2. Fetch mail. Query: `$ARGUMENTS`. If that is empty, use `is:unread -category:promotions -category:social`.
   - **With gog:** `gog gmail search "<query>" --max 20 --json`, then `gog gmail thread get <threadId> --json` for anything that needs the full thread.
   - **With a Gmail MCP server:** run the same query through its search tool, then read the threads.

3. Pass the threads to the chief-of-staff agent. It classifies each one into one tier (skip, info_only, meeting_info, action_required) after applying the overrides in `private/preferences.md`, and drafts a reply for each action_required thread.

4. Output:
   - **Skipped:** count, and the senders in one line.
   - **Info only:** one line each.
   - **Meeting info:** check each against my calendar (`gog calendar events --days 14 --all --max 100 --json` or the calendar MCP tool) and list what is missing.
   - **Action required:** numbered. Sender, subject, summary, the draft reply written with `SOUL.md` and the sender's relationship notes, then `[Send] [Edit] [Skip]`. Scheduling requests get two or three slots from `node scripts/calendar-suggest.js`.

5. Send nothing until I choose. On Send, reply in the original thread:
   - **With gog:** `gog gmail send --reply-to-message-id <messageId> --to <address> --subject "Re: <subject>" --body-file -` with the approved draft on stdin.
   - **With a Gmail MCP server:** its send tool, as a reply in the same thread.

6. After each send, finish the follow-through checklist the hook gives you, then move to the next draft.
