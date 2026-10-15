#!/usr/bin/env node
// Usage: Claude Code PostToolUse hook. Reads the hook JSON on stdin. When the tool call was a send
// (gog gmail send or gog gmail drafts send through Bash, a Gmail MCP send tool, a Slack MCP post tool), prints the
// follow-through checklist as additionalContext. Every other tool call exits 0 with no output.
'use strict';

const fs = require('fs');

const CHECKLIST = [
  'Calendar: create [Tentative] events for any dates you proposed, and update meeting links.',
  "Relationships: append this interaction to the recipient's section in private/relationships.md.",
  'Todo: update the upcoming events list in private/todo.md and mark completed items.',
  'Pending responses: set a follow-up deadline for anything you are now waiting on, and remove items this message resolved.',
  'Archive: remove the processed message from the inbox.',
  'Triage files: update the draft status of any other channel you triage from files (LINE, Messenger).',
  'Git commit and push: commit the knowledge file changes to your private repo.',
];

// True for gog gmail send and gog gmail drafts send (gmail, mail, and email are the same command).
// Flags are dropped first, so a search for the word "send" does not count.
function isGogSend(command) {
  for (const segment of command.split(/&&|\|\||[|;&\n]/)) {
    const m = /(?:^|\s|\/)gog\s+(.*)$/.exec(segment.trim());
    if (!m) continue;
    const words = m[1]
      .replace(/--(account|client|color|enable-commands)(=|\s+)\S+/g, ' ')
      .split(/\s+/)
      .filter((w) => w && !w.startsWith('-'));
    if (!['gmail', 'mail', 'email'].includes(words[0])) continue;
    if (words[1] === 'send') return true;
    if (['drafts', 'draft'].includes(words[1]) && words[2] === 'send') return true;
  }
  return false;
}

function isSend(toolName, toolInput) {
  if (toolName === 'Bash') {
    const command = toolInput && typeof toolInput.command === 'string' ? toolInput.command : '';
    if (!isGogSend(command)) return null;
    return { channel: 'An email', via: 'gog CLI', to: flagValue(command, 'to') };
  }
  if (!toolName.startsWith('mcp__')) return null;
  const name = toolName.toLowerCase();
  const action = name.split('__').pop();
  if (/draft|search|list|get|read|history/.test(action) && !/send/.test(action)) return null;

  if (/gmail|mail/.test(name) && /send/.test(action)) {
    return { channel: 'An email', via: toolName, to: pick(toolInput, ['to', 'recipient', 'recipients']) };
  }
  if (/slack/.test(name) && /(send|post|add_message|reply)/.test(action)) {
    return { channel: 'A Slack message', via: toolName, to: pick(toolInput, ['channel_id', 'channel', 'thread_ts']) };
  }
  return null;
}

function flagValue(command, flag) {
  const m = new RegExp(`--${flag}(?:=|\\s+)("([^"]*)"|'([^']*)'|(\\S+))`).exec(command);
  return m ? m[2] || m[3] || m[4] : null;
}

function pick(obj, keys) {
  if (!obj || typeof obj !== 'object') return null;
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === 'string' && v) return v;
    if (Array.isArray(v) && v.length) return v.join(', ');
  }
  return null;
}

function main() {
  let input;
  try {
    input = JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    process.exit(0);
  }
  if (input.hook_event_name && input.hook_event_name !== 'PostToolUse') process.exit(0);

  const send = isSend(String(input.tool_name || ''), input.tool_input);
  if (!send) process.exit(0);

  const target = send.to ? ` to ${send.to}` : '';
  const context = [
    `${send.channel} was just sent${target} (${send.via}).`,
    'Before moving on to anything else, complete the chief-of-staff follow-through checklist:',
    ...CHECKLIST.map((step, i) => `${i + 1}. ${step}`),
    'Skip a step only when it does not apply to this message, and say which steps you skipped.',
  ].join('\n');

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: context,
      },
    })
  );
}

main();
