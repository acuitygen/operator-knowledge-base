---
description: Draft a scheduling reply with real free slots from your calendar.
argument-hint: "<who and what, e.g. Reply to Priya about the review call>"
allowed-tools: Read, Grep, Glob, Bash(gog gmail search *), Bash(gog gmail thread get *), Bash(gog calendar events *), Bash(node scripts/calendar-suggest.js *)
---

Draft a scheduling reply as my chief of staff. Request: $ARGUMENTS

1. Read `SOUL.md`, `private/preferences.md`, and the person's section in `private/relationships.md`. Note their timezone if it is listed.

2. Find the message to reply to. Search email first (`gog gmail search "from:<person> newer_than:14d" --max 5 --json`, or the Gmail MCP search tool), then Slack if a Slack MCP server is connected. If more than one thread matches, ask me which one.

3. Work out the meeting length and window from the message. If it does not say, use the defaults in `private/preferences.md`.

4. Get my busy blocks for the window as JSON:
   - **With gog:** `gog calendar events --days <N> --all --max 250 --json > /tmp/busy.json`
   - **With a calendar MCP server:** list the events and write them to `/tmp/busy.json` as a JSON array of `{"start": ..., "end": ...}` with ISO times.

5. Compute free slots. Do not do calendar math yourself:

   `node scripts/calendar-suggest.js --busy /tmp/busy.json --tz <my timezone> --hours <my hours> --duration <minutes> --days <N> --buffer <minutes> --pick 3`

6. Draft the reply with `SOUL.md` and the relationship tone. Offer two or three of the suggested slots, written in their timezone when known, with mine in parentheses. Show the draft with `[Send] [Edit] [Skip]`.

7. Send nothing until I choose. On Send, reply in the original thread on the same channel. Then finish the follow-through checklist the hook gives you, starting with `[Tentative]` holds on my calendar for every slot I offered.
