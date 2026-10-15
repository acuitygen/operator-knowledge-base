#!/usr/bin/env node
// Usage: node calendar-suggest.js [--busy busy.json] [--tz America/New_York] [--hours 09:00-18:00] [--duration 30] [--days 5] [--pick 3] [--json]
// Reads busy blocks as JSON (from --busy or stdin) and prints the free slots inside your working hours.
// Node 18+, no dependencies.
'use strict';

const fs = require('fs');

const HELP = `calendar-suggest.js: free slots from busy blocks

Input (stdin or --busy FILE), any of these shapes:
  [{"start": "2026-10-16T10:00:00-04:00", "end": "2026-10-16T11:00:00-04:00"}]
  {"busy": [...]}  {"events": [...]}  {"items": [...]}
  Google Calendar events: start/end as {"dateTime": ...} or {"date": ...} (all-day)
  Google free/busy: {"calendars": {"primary": {"busy": [...]}}}

Options:
  --busy FILE         Busy blocks JSON file. Omit to read stdin.
  --tz ZONE           IANA timezone for working hours and output. Default: system zone.
  --hours HH:MM-HH:MM Working hours. Default: 09:00-18:00.
  --duration MIN      Meeting length in minutes. Default: 30.
  --days N            Working days to search. Default: 5.
  --from YYYY-MM-DD   First day to search. Default: today in --tz.
  --weekends          Include Saturday and Sunday.
  --buffer MIN        Gap kept before and after each busy block. Default: 0.
  --step MIN          Round slot starts up to this grid. Default: 15.
  --pick N            Also print N suggested start times, one per day.
  --json              Print JSON instead of text.
  --help              Show this help.`;

function parseArgs(argv) {
  const opts = {
    busy: null,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hours: '09:00-18:00',
    duration: 30,
    days: 5,
    from: null,
    weekends: false,
    buffer: 0,
    step: 15,
    pick: 0,
    json: false,
  };
  const flags = new Set(['weekends', 'json', 'help']);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) fail(`Unexpected argument: ${arg}`);
    const key = arg.slice(2);
    if (flags.has(key)) {
      opts[key] = true;
      continue;
    }
    if (!(key in opts)) fail(`Unknown option: ${arg}`);
    const value = argv[++i];
    if (value === undefined) fail(`Missing value for ${arg}`);
    opts[key] = value;
  }
  for (const key of ['duration', 'days', 'buffer', 'step', 'pick']) {
    const n = Number(opts[key]);
    if (!Number.isInteger(n) || n < 0) fail(`--${key} must be a whole number`);
    opts[key] = n;
  }
  if (opts.duration === 0 || opts.days === 0 || opts.step === 0) fail('--duration, --days, and --step must be above 0');
  const m = /^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/.exec(opts.hours);
  if (!m) fail('--hours must look like 09:00-18:00');
  opts.workStart = Number(m[1]) * 60 + Number(m[2]);
  opts.workEnd = Number(m[3]) * 60 + Number(m[4]);
  if (opts.workEnd <= opts.workStart) fail('--hours end must be after start');
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: opts.tz });
  } catch {
    fail(`Unknown timezone: ${opts.tz}`);
  }
  if (opts.from && !/^\d{4}-\d{2}-\d{2}$/.test(opts.from)) fail('--from must be YYYY-MM-DD');
  return opts;
}

function fail(message) {
  process.stderr.write(`calendar-suggest: ${message}\n`);
  process.exit(1);
}

// Wall-clock parts of a UTC timestamp in a timezone.
function partsIn(ts, tz) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
  });
  const out = {};
  for (const p of fmt.formatToParts(new Date(ts))) out[p.type] = p.value;
  return {
    year: Number(out.year),
    month: Number(out.month),
    day: Number(out.day),
    hour: Number(out.hour),
    minute: Number(out.minute),
    second: Number(out.second),
    weekday: out.weekday,
  };
}

function offsetMs(ts, tz) {
  const p = partsIn(ts, tz);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ts / 1000) * 1000;
}

// UTC timestamp for a wall-clock time in a timezone. Two passes settle DST edges.
function zonedToUtc(year, month, day, minutes, tz) {
  const guess = Date.UTC(year, month - 1, day, 0, minutes);
  let ts = guess - offsetMs(guess, tz);
  ts = guess - offsetMs(ts, tz);
  return ts;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function isoIn(ts, tz) {
  const p = partsIn(ts, tz);
  const off = Math.round(offsetMs(ts, tz) / 60000);
  const sign = off < 0 ? '-' : '+';
  const abs = Math.abs(off);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

function clock(ts, tz) {
  const p = partsIn(ts, tz);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

function addDays(ymd, n) {
  const d = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day + n));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function weekdayOf(ymd) {
  return new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day)).getUTCDay();
}

function readInput(path) {
  let raw;
  try {
    raw = path ? fs.readFileSync(path, 'utf8') : fs.readFileSync(0, 'utf8');
  } catch (err) {
    fail(`Could not read busy blocks: ${err.message}`);
  }
  if (!raw.trim()) return [];
  try {
    return JSON.parse(raw);
  } catch (err) {
    fail(`Busy blocks are not valid JSON: ${err.message}`);
  }
}

function collectBlocks(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    for (const key of ['busy', 'events', 'items']) {
      if (Array.isArray(data[key])) return data[key];
    }
    if (data.calendars && typeof data.calendars === 'object') {
      return Object.values(data.calendars).flatMap((c) => (c && Array.isArray(c.busy) ? c.busy : []));
    }
  }
  fail('Busy blocks must be an array, or an object with busy, events, items, or calendars');
}

// Returns [startMs, endMs] or null for blocks that do not count as busy.
function toInterval(block, tz) {
  if (!block || typeof block !== 'object') return null;
  if (block.transparency === 'transparent' || block.status === 'cancelled') return null;
  const edge = (v) => {
    if (typeof v === 'string') return { value: v, allDay: /^\d{4}-\d{2}-\d{2}$/.test(v) };
    if (v && typeof v === 'object') {
      if (v.dateTime) return { value: v.dateTime, allDay: false };
      if (v.date) return { value: v.date, allDay: true };
    }
    return null;
  };
  const s = edge(block.start);
  const e = edge(block.end);
  if (!s || !e) return null;
  const toMs = (x) => {
    if (x.allDay) {
      const [y, m, d] = x.value.split('-').map(Number);
      return zonedToUtc(y, m, d, 0, tz);
    }
    const ms = Date.parse(x.value);
    if (Number.isNaN(ms)) fail(`Unreadable time: ${x.value}`);
    return ms;
  };
  const start = toMs(s);
  const end = toMs(e);
  return end > start ? [start, end] : null;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    process.stdout.write(`${HELP}\n`);
    return;
  }

  const bufferMs = opts.buffer * 60000;
  const busy = collectBlocks(readInput(opts.busy))
    .map((b) => toInterval(b, opts.tz))
    .filter(Boolean)
    .map(([s, e]) => [s - bufferMs, e + bufferMs])
    .sort((a, b) => a[0] - b[0]);

  let day;
  if (opts.from) {
    const [y, m, d] = opts.from.split('-').map(Number);
    day = { year: y, month: m, day: d };
  } else {
    const p = partsIn(Date.now(), opts.tz);
    day = { year: p.year, month: p.month, day: p.day };
  }

  const durationMs = opts.duration * 60000;
  const stepMs = opts.step * 60000;
  const now = Date.now();
  const result = [];

  for (let searched = 0, guard = 0; searched < opts.days && guard < 366; guard++, day = addDays(day, 1)) {
    const wd = weekdayOf(day);
    if (!opts.weekends && (wd === 0 || wd === 6)) continue;
    searched++;

    const dayStart = zonedToUtc(day.year, day.month, day.day, opts.workStart, opts.tz);
    const dayEnd = zonedToUtc(day.year, day.month, day.day, opts.workEnd, opts.tz);
    let cursor = Math.max(dayStart, now);
    const windows = [];

    const pushWindow = (from, to) => {
      const aligned = dayStart + Math.ceil((from - dayStart) / stepMs) * stepMs;
      if (to - aligned >= durationMs) windows.push([aligned, to]);
    };

    for (const [bs, be] of busy) {
      if (be <= cursor || bs >= dayEnd) continue;
      if (bs > cursor) pushWindow(cursor, Math.min(bs, dayEnd));
      cursor = Math.max(cursor, be);
      if (cursor >= dayEnd) break;
    }
    if (cursor < dayEnd) pushWindow(cursor, dayEnd);

    result.push({
      date: `${day.year}-${pad(day.month)}-${pad(day.day)}`,
      weekday: partsIn(dayStart, opts.tz).weekday,
      free: windows.map(([s, e]) => ({ start: isoIn(s, opts.tz), end: isoIn(e, opts.tz), startMs: s, endMs: e })),
    });
  }

  const picks = [];
  for (const d of result) {
    if (picks.length >= opts.pick) break;
    if (d.free.length) picks.push({ start: d.free[0].start, end: isoIn(d.free[0].startMs + durationMs, opts.tz) });
  }

  if (opts.json) {
    const out = {
      timezone: opts.tz,
      hours: opts.hours,
      durationMinutes: opts.duration,
      days: result.map((d) => ({ date: d.date, weekday: d.weekday, free: d.free.map(({ start, end }) => ({ start, end })) })),
    };
    if (opts.pick) out.suggested = picks;
    process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
    return;
  }

  const lines = [`Free slots for a ${opts.duration} min meeting (${opts.tz}, ${opts.hours})`];
  for (const d of result) {
    const slots = d.free.map((w) => `${clock(w.startMs, opts.tz)}-${clock(w.endMs, opts.tz)}`).join(', ');
    lines.push(`${d.weekday} ${d.date}: ${slots || 'no free slot'}`);
  }
  if (opts.pick) {
    lines.push('', 'Suggested:');
    for (const p of picks) lines.push(`  ${p.start} to ${p.end}`);
    if (!picks.length) lines.push('  none in range');
  }
  process.stdout.write(`${lines.join('\n')}\n`);
}

main();
