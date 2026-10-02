// plugins/validate-decorative-glyphs.mjs
//
// Build-time guardrail for CORE_SPEC §8 "Decoration says nothing to a screen reader". A character that
// is on the page for its look (the // before a label, the arrow on a button, the dot between two words)
// stays visible but is never read aloud, and one that stands for something is read as what it stands
// for (the 404's "cd ~" is announced "cd home"). After every build this reads each built page and
// stylesheet and fails the build when a character it knows would still reach a screen reader:
//   - text: a character from GLYPHS anywhere in a text run, or a marker from TOKENS (a bare //, /, #,
//     $ or >, a >_ or [+] prompt mark, an ASCII arrow such as -> or =>);
//   - names: the same in an aria-label, alt or title;
//   - generated content: a CSS `content` whose effective (last) declaration in its rule carries either
//     without an alternative, or with an alternative that is itself decoration, or with its alternative
//     but no plain declaration of the same value before it, the fallback for browsers without
//     alternative text (`content: "→"; content: "→" / "";`);
//   - list markers: a CSS `list-style` string carrying either (it has no alternative-text form).
// What it does not see, so check it by hand, in Chrome's accessibility tree:
//   - writeup prose and the component chrome inside it (a Callout label, a Toggle summary, FlagCapture,
//     PasswordReveal, Principle, the recon rail): everything under .sl-markdown-content that is not back
//     inside a .not-content component. In prose a character is notation (22/tcp, a URL, a file name);
//     the chrome is skipped with it;
//   - code (pre, code, kbd, samp), the document <head>, anything under aria-hidden, and the content of a
//     link or button that carries its own aria-label (the label is what is read, and it is checked);
//   - characters outside GLYPHS and TOKENS, and search excerpts (Pagefind indexes aria-hidden text, so a
//     hidden glyph in indexed content carries data-pagefind-ignore by hand);
//   - text a script writes at run time (the copy confirmation, the decode animations, the /secret
//     terminal's output).
// A character that is content in chrome text ("CVSS > 9") fails the build: reword it. The one allowance
// is LEVEL_TITLE, and it holds only where Starlight prints a title as plain text.
//
// Zero new dependencies: hast-util-from-html arrives with @astrojs/markdown-remark, a direct dependency.
// It is not itself declared in package.json and resolves because npm hoists it, so an upgrade that stops
// hoisting it fails the build at this import, loudly. The tree walk is written here.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fromHtml } from 'hast-util-from-html';

// Middle dots and bullets (·, •, ‣, ∙, ⋅), guillemets, arrows, box drawing, block elements, geometric
// shapes (triangles, squares, circles), miscellaneous symbols and dingbats (★, ✓, ❯, ➜), long arrows,
// arrows and symbols (⬅, ⭐), emoji, the pipe, and the tilde (outside prose and code it always stands for
// something: home in "cd ~", about in "~50").
const GLYPHS = /[\u00AB\u00B7\u00BB\u2022\u2023\u2039\u203A\u2190-\u21FF\u2219\u22C5\u2500-\u25FF\u2600-\u27BF\u27F0-\u27FF\u2B00-\u2BFF\u{1F300}-\u{1FAFF}|~]/u;
// A marker standing as its own word ("// Contact", "01 / HTB", "## Recon", "$ whoami", "> run", ">_",
// "[+] found"), a // opening a word ("//whoami"), or an ASCII arrow anywhere ("About ->", "=>", "<-").
const TOKENS = /(?:^|\s)(?:\/{1,2}|#{1,6}|\$|>|>_|\[[+*!-]\])(?=\s|$)|(?:^|\s)\/\/|->|<-|=>/;
// A wargame level's title, "Bandit 0 → 1" in the h1 and "0 → 1" in the pager. Starlight prints a title
// there as plain text, so the arrow cannot get a spoken form without changing what the page shows or
// rebuilding a Starlight component. Accepted in those two places only: the sidebar entry can carry a
// spoken form, and must (sidebar.attrs, "0 to 1").
const LEVEL_TITLE = /^(?:[A-Z][A-Za-z]* )?\d+ \u2192 \d+$/u;
const SKIP = new Set(['head', 'pre', 'code', 'kbd', 'samp', 'script', 'style', 'noscript', 'template']);
const NAMES = { ariaLabel: 'aria-label', alt: 'alt', title: 'title' };

const decorative = (s) => GLYPHS.test(s) || TOKENS.test(s);
const cls = (el) => el?.properties?.className ?? [];
const hidden = (el) => String(el.properties?.ariaHidden) === 'true';
const labelled = (el) => (el.tagName === 'a' || el.tagName === 'button') && Boolean(el.properties?.ariaLabel || el.properties?.ariaLabelledBy);
// The text's parent is the page's h1, or a pager link's title.
const titleSlot = (ancestors) => {
  const parent = ancestors.at(-1);
  if (!parent) return false;
  return (parent.tagName === 'h1' && parent.properties?.id === '_top')
    || (cls(parent).includes('link-title') && ancestors.some((a) => cls(a).includes('pagination-links')));
};

const trail = (ancestors) => ancestors.slice(-2)
  .map((a) => [a.tagName, ...cls(a).filter((c) => !c.startsWith('astro-')).slice(0, 2)].join('.'))
  .join(' > ');

// --- generated content ---------------------------------------------------------------------------
const unescapeCss = (s) => s.replace(/\\(?:([0-9a-fA-F]{1,6})\s?|([^0-9a-fA-F\n]))/g,
  (_, hex, ch) => (hex ? String.fromCodePoint(parseInt(hex, 16)) : ch));
// A declaration's value runs to the next ; or } outside a string.
const VALUE = String.raw`((?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^;}"'])*)`;
const CONTENT = new RegExp(String.raw`(?<![-\w])content\s*:\s*` + VALUE, 'g');
const LIST_STYLE = new RegExp(String.raw`(?<![-\w])list-style(?:-type)?\s*:\s*` + VALUE, 'g');

// Every string in a content value, joined: what is drawn (before a top-level /) and its alternative
// (after it; null when the value has none). counter(), attr() and the like are passed over, the strings
// around them are not.
function splitContent(value) {
  let depth = 0;
  let main = '';
  let alt = null;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < value.length && value[j] !== ch) j += value[j] === '\\' ? 2 : 1;
      const s = unescapeCss(value.slice(i + 1, j));
      if (alt === null) main += s; else alt += s;
      i = j;
    } else if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === '/' && depth === 0 && alt === null) alt = '';
  }
  return { main, alt };
}

function checkCss(css, where, add) {
  for (const chunk of css.split('}')) {
    const open = chunk.lastIndexOf('{');
    if (open < 0) continue;
    const body = chunk.slice(open + 1);
    const selector = chunk.slice(0, open).split(/[{;]/).pop().trim();
    const decls = [...body.matchAll(CONTENT)].map((m) => splitContent(m[1]));
    const last = decls.at(-1);
    if (last && decorative(last.main)) {
      if (last.alt === null) add(where, `${selector} { content: "${last.main}" } has no empty alternative`);
      else if (decorative(last.alt)) add(where, `${selector} { content: "${last.main}" / "${last.alt}" } has an alternative that is itself decoration`);
      else if (!decls.slice(0, -1).some((d) => d.alt === null && d.main === last.main)) add(where, `${selector} { content: "${last.main}" / "${last.alt}" } has no plain declaration before it to fall back to`);
    }
    for (const m of body.matchAll(LIST_STYLE)) {
      const { main } = splitContent(m[1]);
      if (decorative(main)) add(where, `${selector} { list-style: "${main}" } is read as the item's marker: draw it with ::marker content and an empty alternative`);
    }
  }
}

// --- pages ----------------------------------------------------------------------------------------
function checkPage(tree, where, add) {
  // Stylesheets first, wherever they sit (Astro puts its inline <style> in the <head>).
  const styles = (node) => {
    if (node.type === 'element' && node.tagName === 'style') checkCss(node.children.map((c) => c.value ?? '').join(''), where, add);
    else for (const c of node.children ?? []) styles(c);
  };
  styles(tree);
  // Then everything a screen reader meets. prose is true under .sl-markdown-content until a .not-content
  // component takes the subtree back.
  const visit = (node, ancestors, prose) => {
    if (node.type === 'text') {
      const t = node.value.trim();
      if (!prose && decorative(t) && !(titleSlot(ancestors) && LEVEL_TITLE.test(t))) add(where, `${trail(ancestors)}: "${t}"`);
      return;
    }
    if (node.type === 'element') {
      if (SKIP.has(node.tagName) || hidden(node)) return;
      if (cls(node).includes('sl-markdown-content')) prose = true;
      if (cls(node).includes('not-content')) prose = false;
      if (!prose) {
        for (const [prop, attr] of Object.entries(NAMES)) {
          const v = node.properties?.[prop];
          if (typeof v === 'string' && decorative(v)) add(where, `${trail([...ancestors, node])} [${attr}]: "${v}"`);
        }
      }
      if (labelled(node)) return;
      ancestors = [...ancestors, node];
    }
    for (const c of node.children ?? []) visit(c, ancestors, prose);
  };
  visit(tree, [], false);
}

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (name !== 'pagefind') walk(p, out); } else out.push(p);
  }
  return out;
};

// Every place a known decorative character would reach a screen reader in a built site, one entry per
// distinct finding with the pages it is on. Exported so a session can run it against any dist directory.
export function findReadAloudDecoration(root) {
  const found = new Map();
  const add = (where, what) => { const pages = found.get(what) ?? []; pages.push(where); found.set(what, pages); };
  for (const file of walk(root)) {
    const where = '/' + relative(root, file).split('\\').join('/').replace(/index\.html$/, '');
    if (file.endsWith('.css')) checkCss(readFileSync(file, 'utf8'), where, add);
    else if (file.endsWith('.html')) checkPage(fromHtml(readFileSync(file, 'utf8')), where, add);
  }
  return [...found].map(([what, pages]) => `${what}  (${pages.length === 1 ? pages[0] : `${pages.length} files, first ${pages[0]}`})`);
}

export default function validateDecorativeGlyphs() {
  return {
    name: 'validate-decorative-glyphs',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const problems = findReadAloudDecoration(fileURLToPath(dir));
        if (problems.length === 0) {
          logger.info('no known decorative character reaches a screen reader');
          return;
        }
        for (const p of problems) logger.error(p);
        throw new Error(`${problems.length} place(s) where a decorative character would be read aloud. Wrap the glyph in an aria-hidden span (or give its CSS content an empty alternative, after its plain fallback), or name its control with an aria-label that says what it means. See CORE_SPEC §8.`);
      },
    },
  };
}
