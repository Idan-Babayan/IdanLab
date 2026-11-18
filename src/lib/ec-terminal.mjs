// Expressive Code plugin: one colour system for every code block. It gives each piece of code a role
// (`cx-<role>` on a span), and src/styles/chrome.css colours the roles per theme in @layer chrome.
// CORE_SPEC section 6 "Code-block colour roles" is the reference; DECISIONS 2026-11-18 the reasoning.
//
// It works in three layers, each refining the one before:
//
//   1. Token roles, every language. Expressive Code writes each token's two theme colours as inline
//      custom properties (--0 tokyo-night, --1 one-light) and paints them through
//      :where(span[style^='--']:not([class])), so a span that gets a class is no longer painted by it
//      and takes its role colour from chrome.css instead. Expressive Code 0.44.1 highlights with
//      includeExplanation: false, so no TextMate scopes reach a plugin. With both themes pinned, the
//      (dark, light) colour pair a token renders in stands in for its scope: it names what the grammar
//      thought the token was. The pairs are the colours Expressive Code renders after its own contrast
//      adjustment, the stronger variants it uses on marked lines included, read from the build. A colour
//      in neither table leaves its span alone, still painted by Expressive Code. Changing either theme
//      needs a new table.
//   2. Line kinds. A block with a prompt line is a terminal transcript: prompt lines, the command lines
//      after the prompt, continuations, comments and output. A shell-language block without one is a
//      script, every line a command line. Anything else is code.
//   3. Character roles. Prompts, command lines, output and markup tags get a role per character, written
//      as <span class="cx-ROLE"> runs inside the token spans. A character with no role of its own keeps
//      its token's.
//
// Commands are found by position (the first word after a prompt, a separator, `$(`, `(` or `{`, or a
// privilege word), never by name: any tool on any OS is a command where it stands. Only the privilege
// group (sudo, su, doas, runas, pkexec) is named.

import { definePlugin, addClassName } from '@expressive-code/core';

// ── 1a. Token roles: (tokyo-night / one-light) colour pairs, a missing side written `-` ──
const PAIRS = {
  base: ['A9B1D6/383A42', 'A9B1D6/-', '-/383A42'],
  str: ['9ECE6A/387138', '9ECE6A/-', '9ECE6A/2A552A', '89DDFF/387138', '89DDFF/2A552A'],
  var: ['C0CAF5/3360C1', 'C0CAF5/274A94', 'C0CAF5/AF4238', 'C0CAF5/-', 'C0CAF5/83322A', '73DACA/AF4238', '73DACA/83322A',
    '7DCFFF/AF4238', 'E0AF68/383A42', 'E0AF68/AF4238'],
  pun: ['89DDFF/-', '89DDFF/383A42', '9ABDF5/383A42', '9ABDF5/-', 'CE74B5/383A42', 'E26E83/383A42', '89DDFF/AF4238',
    '89DDFF/016C9A', '89DDFF/015174', 'BB9AF7/383A42'],
  num: ['FF9E64/875D01', 'FF9E64/654601'],
  flag: ['E0AF68/875D01', 'E0AF68/-', 'BB9AF7/875D01'],
  com: ['8D92AA/646568'],
  kw: ['BB9AF7/A626A4', 'BB9AF7/-', 'C1A2F8/821E80', 'A283DA/A626A4', '7DCFFF/A626A4', '89DDFF/A626A4', 'F7768E/AF4238',
    'F994A7/83322A'],
  fn: ['0DB9D7/016C9A', '0DB9D7/-', '2BC2DC/015174', '7AA2F7/3360C1', '7AA2F7/-', '8FB1F8/274A94', 'C0CAF5/016C9A',
    'C0CAF5/885D01'],
};
// The fallback for a pair in neither list: the dark colour alone.
const DARK = {
  str: ['9ECE6A'],
  kw: ['BB9AF7', 'C1A2F8', 'A283DA', 'F7768E', 'F994A7'],
  fn: ['7AA2F7', '0DB9D7', '2BC2DC', '8FB1F8'],
  num: ['FF9E64'],
  com: ['8D92AA'],
  pun: ['89DDFF', '9ABDF5'],
  var: ['C0CAF5', '73DACA', '7DCFFF'],
  flag: ['E0AF68'],
  base: ['A9B1D6'],
};
const PAIR_ROLE = new Map(Object.entries(PAIRS).flatMap(([role, pairs]) => pairs.map((p) => [p, role])));
const DARK_ROLE = new Map(Object.entries(DARK).flatMap(([role, colours]) => colours.map((c) => [c, role])));

function tokenRole(style) {
  const dark = /--0:\s*#([0-9a-f]+)/i.exec(style);
  const light = /--1:\s*#([0-9a-f]+)/i.exec(style);
  if (!dark && !light) return null;
  const d = dark ? dark[1].toUpperCase() : '-';
  const l = light ? light[1].toUpperCase() : '-';
  return PAIR_ROLE.get(`${d}/${l}`) ?? DARK_ROLE.get(d) ?? null;
}

// ── 1b. Line kinds ──
const SHELLS = new Set(['bash', 'sh', 'shell', 'zsh', 'console', 'powershell', 'ps1', 'pwsh', 'ps', 'cmd', 'bat', 'batch']);
const WINDOWS_SHELLS = new Set(['powershell', 'ps1', 'pwsh', 'ps', 'cmd', 'bat', 'batch']);
const MARKUP = new Set(['html', 'php', 'xml', 'svg', 'vue', 'astro', 'svelte']);

// ── 1c. Prompts: [pattern, role per capture group, mark]. First match wins; `null` is not prompt. ──
const PROMPTS = [
  [/^(\s*[┌╭]─*\()([^)]*)(\)-)(\[)([^\]]*)(\])\s*$/d, ['pr', 'pr', 'prp', 'prb', 'prp', 'prb'], 'prompt-only'],
  [/^(\s*[└╰]─*)([>$#❯]?)(\s?)/d, ['pr', 'prp', null]],
  [/^([\w.-]+@[\w.-]+(?::[^\s$#]*)?[$#])(\s?)/d, ['pr', null]],
  [/^(\*Evil-WinRM\*\s+PS\s+[^>]*>)(\s?)/d, ['pr', null], 'windows'],
  [/^(PS\s+[A-Za-z]:\\[^>]*>)(\s?)/d, ['pr', null], 'windows'],
  [/^([A-Za-z]:\\[^>]*>)(\s?)/d, ['pr', null], 'windows'],
  [/^(\(gdb\)|msf\d*(?:\s+\S+\([^)]*\))?\s*>|meterpreter\s*>|smb:\s*\S*>|(?:mysql|MariaDB \[[^\]]*\]|sqlite|ftp|sftp)>|>>|\$)(\s)/d, ['pr', null]],
];

function matchPrompt(text) {
  for (const [pattern, groups, mark] of PROMPTS) {
    const match = pattern.exec(text);
    if (match) return { match, groups, mark: mark ?? null };
  }
  return null;
}

// Every line of a block is classified once, the first time any of its lines is rendered.
const blockKinds = new WeakMap();

function classify(codeBlock) {
  const cached = blockKinds.get(codeBlock);
  if (cached) return cached;
  const lang = String(codeBlock.language ?? '').toLowerCase();
  const shell = SHELLS.has(lang);
  const markup = MARKUP.has(lang);
  const texts = codeBlock.getLines().map((line) => line.text);
  const prompts = texts.map(matchPrompt);
  const transcript = prompts.some(Boolean);
  let windows = WINDOWS_SHELLS.has(lang);
  let prev = null;
  const kinds = texts.map((text, i) => {
    const prompt = prompts[i];
    let kind;
    if (prev && (prev.kind === 'prompt' || prev.kind === 'cont' || prev.kind === 'script') && /[\\`]\s*$/.test(prev.text)) {
      kind = 'cont';
    } else if (prompt) {
      kind = prompt.mark === 'prompt-only' ? 'prompt-only' : 'prompt';
      windows = prompt.mark === 'windows';
    } else if (!/\S/.test(text)) {
      kind = 'blank';
    } else if ((transcript || shell) && /^\s*#/.test(text)) {
      kind = 'comment';
    } else if (transcript) {
      kind = 'output';
    } else if (shell) {
      kind = 'script';
    } else {
      kind = 'code';
    }
    prev = { kind, text };
    return { kind, windows, prompt, markup };
  });
  blockKinds.set(codeBlock, kinds);
  return kinds;
}

// ── 1e. Entities and variables ──
const ENTITY = /(https?:\/\/[^\s'"`)\]]+)|(\b\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?\b)|(\b\d{1,5}\/(?:tcp|udp)\b)|(\b[\w-]+(?:\.[\w-]+)*\.(?:htb|local|com|org|net|io|lab|corp)\b)|(\b(?:open|Enabled)\b)/g;
const ENTITY_ROLE = ['url', 'ip', 'port', 'url', 'ok'];
const VAR = /^\$(\{[^}]*\}|[A-Za-z_][\w:]*|[0-9@#?*!$_-])/;

function fill(roles, from, to, role) {
  for (let k = from; k < to; k++) roles[k] = role;
}

function markEntities(text, from, to, roles, withOk) {
  for (const m of text.slice(from, to).matchAll(ENTITY)) {
    const role = ENTITY_ROLE[m.slice(1).findIndex((g) => g !== undefined)];
    if (role === 'ok' && !withOk) continue;
    fill(roles, from + m.index, from + m.index + m[0].length, role);
  }
}

function markVars(text, from, to, roles) {
  for (let k = from; k < to; k++) {
    if (text[k] !== '$') continue;
    const m = VAR.exec(text.slice(k, to));
    if (m) {
      fill(roles, k, k + m[0].length, 'var');
      k += m[0].length - 1;
    }
  }
}

// ── 1d. The command line ──
const KEYWORDS = new Set(['if', 'then', 'else', 'elif', 'fi', 'for', 'foreach', 'in', 'do', 'done', 'while', 'until', 'case',
  'esac', 'function', 'select', 'return']);
const KEYWORDS_ENDING = new Set(['fi', 'done', 'esac', 'in', 'return']);
const PRIVILEGE = new Set(['sudo', 'su', 'doas', 'runas', 'pkexec']);
const PRIVILEGE_ARG_FLAGS = new Set(['-u', '-g', '-U', '-C', '-p', '-h']);
const REDIRECTION = /^\d?(>>|>&|&>|>|<)(&?\d+)?/;
const ASSIGNMENT = /^[A-Za-z_]\w*=/;
const WORD_END = /[\s"'`|;&<>(){}]/;

function stringEnd(text, start) {
  const quote = text[start];
  for (let k = start + 1; k < text.length; k++) {
    if (quote === '"' && text[k] === '\\') k++;
    else if (text[k] === quote) return k + 1;
  }
  return text.length;
}

function scanCommand(text, start, roles, windows, commandPosition) {
  let command = commandPosition;
  let privilege = false;
  let privilegeArg = false;
  let i = start;
  while (i < text.length) {
    const c = text[i];
    const two = text.slice(i, i + 2);
    if (/\s/.test(c)) {
      i++;
    } else if (c === '#' && (i === start || /\s/.test(text[i - 1]))) {
      fill(roles, i, text.length, 'com');
      break;
    } else if (two === '$(') {
      fill(roles, i, i + 2, 'pun');
      i += 2;
      command = true;
    } else if (two === '||' || two === '&&' || two === '|&' || c === '|' || c === ';' || (c === '&' && text[i + 1] !== '>')) {
      const length = two === '||' || two === '&&' || two === '|&' ? 2 : 1;
      fill(roles, i, i + length, 'pun');
      i += length;
      command = true;
      privilege = false;
      privilegeArg = false;
    } else if (REDIRECTION.test(text.slice(i))) {
      const length = REDIRECTION.exec(text.slice(i))[0].length;
      fill(roles, i, i + length, 'pun');
      i += length;
      command = false;
    } else if ('(){}[]'.includes(c)) {
      fill(roles, i, i + 1, 'pun');
      i++;
      command = c === '(' || c === '{';
    } else if (c === '"' || c === "'") {
      const end = stringEnd(text, i);
      fill(roles, i, end, 'str');
      markEntities(text, i, end, roles, false);
      if (c === '"') markVars(text, i, end, roles);
      i = end;
      command = false;
    } else if (command && !privilege && ASSIGNMENT.test(text.slice(i))) {
      const length = ASSIGNMENT.exec(text.slice(i))[0].length;
      fill(roles, i, i + length - 1, 'var');
      fill(roles, i + length - 1, i + length, 'pun');
      i += length;
      command = false;
    } else {
      let end = i;
      while (end < text.length && !WORD_END.test(text[end])) end++;
      if (end === i) {
        fill(roles, i, i + 1, 'pun');
        i++;
        continue;
      }
      const word = text.slice(i, end);
      if (word === '=') {
        fill(roles, i, end, 'pun');
        if (windows) command = true;
      } else if (command) {
        if (privilegeArg) {
          markArg(text, i, end, roles, 'arg');
          privilegeArg = false;
        } else if (privilege && word.startsWith('-')) {
          fill(roles, i, end, 'flag');
          privilegeArg = PRIVILEGE_ARG_FLAGS.has(word);
        } else if (KEYWORDS.has(word)) {
          fill(roles, i, end, 'kw');
          if (KEYWORDS_ENDING.has(word)) command = false;
        } else if (word.startsWith('$')) {
          fill(roles, i, end, 'var');
          markEntities(text, i, end, roles, false);
          command = false;
        } else if (PRIVILEGE.has(word.toLowerCase())) {
          fill(roles, i, end, 'priv');
          privilege = true;
        } else {
          fill(roles, i, end, 'cmd');
          command = false;
        }
      } else if (/^--?[^-]/.test(word) || (windows && /^\/[A-Za-z?][\w-]*$/.test(word))) {
        markArg(text, i, end, roles, 'flag');
      } else if (/^\d+(\.\d+)?$/.test(word)) {
        fill(roles, i, end, 'num');
      } else {
        markArg(text, i, end, roles, 'arg');
      }
      i = end;
    }
  }
}

// A flag or argument word: its own role, with any variables and entities inside it keeping theirs.
function markArg(text, from, to, roles, role) {
  fill(roles, from, to, role);
  markEntities(text, from, to, roles, false);
  markVars(text, from, to, roles);
}

// ── 1g. Markup: tag names read as keywords, attribute names as flags ──
const TAG_NAME = /<\/?([A-Za-z][\w:-]*)/dg;
const TAG = /<[A-Za-z][^<>]*>?/g;
const ATTRIBUTE = /\s([A-Za-z_:][\w:.-]*)(?=\s*=)/dg;

function markMarkup(text, roles) {
  for (const m of text.matchAll(TAG_NAME)) fill(roles, m.indices[1][0], m.indices[1][1], 'kw');
  for (const tag of text.matchAll(TAG)) {
    for (const a of tag[0].matchAll(ATTRIBUTE)) fill(roles, tag.index + a.indices[1][0], tag.index + a.indices[1][1], 'flag');
  }
}

// ── 1b to 1g: one role per character of a line (null where none is set) ──
function lineRoles(text, info) {
  const roles = new Array(text.length).fill(null);
  if (info.kind === 'prompt' || info.kind === 'prompt-only') {
    const { match, groups } = info.prompt;
    groups.forEach((role, g) => {
      const span = match.indices[g + 1];
      if (role && span) fill(roles, span[0], span[1], role);
    });
    if (info.kind === 'prompt') scanCommand(text, match[0].length, roles, info.windows, true);
  } else if (info.kind === 'cont') {
    scanCommand(text, 0, roles, info.windows, false);
  } else if (info.kind === 'script') {
    scanCommand(text, 0, roles, info.windows, true);
  } else if (info.kind === 'output') {
    fill(roles, 0, text.length, 'out');
    markEntities(text, 0, text.length, roles, true);
  } else if (info.kind === 'code' && info.markup) {
    markMarkup(text, roles);
  }
  return roles;
}

// ── 1h. Writing the roles into the rendered line ──
function textOf(node) {
  if (node.type === 'text') return node.value;
  return (node.children ?? []).map(textOf).join('');
}

function findCode(node) {
  if (node.type !== 'element') return null;
  const classes = node.properties?.className;
  if (Array.isArray(classes) && classes.includes('code')) return node;
  for (const child of node.children ?? []) {
    const found = findCode(child);
    if (found) return found;
  }
  return null;
}

function tagTokens(node) {
  if (node.type !== 'element') return;
  const style = node.properties?.style;
  if (node.tagName === 'span' && typeof style === 'string' && /--[01]:/.test(style)) {
    const role = tokenRole(style);
    if (role) addClassName(node, `cx-${role}`);
  }
  for (const child of node.children ?? []) tagTokens(child);
}

// Split every text node into runs of one role; a run with a role becomes <span class="cx-ROLE">, a run
// without one stays a bare text node and keeps its token's role.
function wrapRuns(parent, roles, cursor) {
  const children = [];
  for (const child of parent.children) {
    if (child.type !== 'text') {
      if (child.type === 'element') wrapRuns(child, roles, cursor);
      children.push(child);
      continue;
    }
    const value = child.value;
    let k = 0;
    while (k < value.length) {
      const role = roles[cursor.at + k];
      let end = k + 1;
      while (end < value.length && roles[cursor.at + end] === role) end++;
      const run = { type: 'text', value: value.slice(k, end) };
      children.push(role ? { type: 'element', tagName: 'span', properties: { className: [`cx-${role}`] }, children: [run] } : run);
      k = end;
    }
    cursor.at += value.length;
  }
  parent.children = children;
}

export function pluginTerminal() {
  return definePlugin({
    name: 'terminal-roles',
    hooks: {
      postprocessRenderedLine({ codeBlock, line, lineIndex, renderData }) {
        const lineAst = renderData.lineAst;
        tagTokens(lineAst);
        const code = findCode(lineAst);
        if (!code || textOf(code) !== line.text) return;
        const info = classify(codeBlock)[lineIndex];
        if (!info || info.kind === 'blank' || info.kind === 'comment' || (info.kind === 'code' && !info.markup)) return;
        wrapRuns(code, lineRoles(line.text, info), { at: 0 });
        addClassName(lineAst, `cx-${info.kind}`);
      },
    },
  });
}
