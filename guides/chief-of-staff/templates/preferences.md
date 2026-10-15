# Preferences

Standing rules for triage and scheduling. The agent reads this before it classifies messages or proposes times. Change a rule here once instead of correcting the same thing in every session.

## Working hours

- **Timezone:** America/New_York
- **Working hours:** 09:00-18:00, Monday to Friday
- **Default meeting length:** 30 minutes
- **Buffer around meetings:** 10 minutes
- **No meetings:** Friday afternoons, and before 10:00 on Mondays
- **Focus block:** 09:00-11:00 daily. Offer it only if nothing else fits.

## calendar-suggest.js defaults

```bash
node scripts/calendar-suggest.js --tz America/New_York --hours 09:00-18:00 --duration 30 --buffer 10 --days 5 --pick 3
```

## Triage overrides

The agent applies these before the default four-tier rules.

- **Always skip:** newsletters@example-saas.com, any sender with "digest" in the subject
- **Always info_only:** receipts from billing@, anything where I am CC'd on a client thread with my team
- **Always action_required:** anything from a client domain listed in `relationships.md`, even if I am CC'd
- **Never auto-archive:** messages from my accountant or my bank, even if they come from a no-reply address

## Channels

- **Email:** Primary. Gmail, work account.
- **Slack:** Workspace "northwind". Triage DMs and mentions only, not channels.
- **Calendar:** Google Calendar, primary calendar.

## Follow-up timing

- **Client asked a question I have not answered:** reply within one working day
- **Waiting on a client reply:** nudge after three working days
- **Waiting on a vendor or partner:** nudge after five working days
