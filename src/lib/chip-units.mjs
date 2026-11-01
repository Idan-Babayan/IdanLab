// src/lib/chip-units.mjs
// Groups every inline-code chip with the text glued to it, so a chip never splits at a line end unless
// its group is longer than the whole line. One module, two callers, so the two cannot drift:
// plugins/rehype-group-inline-chips.mjs runs groupChips over every page's tree, and Toggle.astro runs
// groupLabelHtml over its label string, which reaches the page through set:html and so never passes
// through the plugin. Both paths end in the same function on the same kind of tree.
//
// THE MECHANISM. A browser may break a line at any space inside a chip, or after a hyphen, which is how
// `DOMAIN ADMINS@HTB.LOCAL` ended one line with DOMAIN. prose.css makes each group an inline-block
// capped at its column: it stays whole whenever it fits, and wraps inside itself only when it is longer
// than the line. An inline-block around the chip ALONE is not enough, because a browser may also break
// on either side of an atomic inline, even beside punctuation, which strands `(` and `,`. So the box is
// the chip PLUS every character glued to it: its edges then always land where a break was allowed
// anyway, and inside it ordinary line breaking keeps the punctuation attached. This is a build-time
// stand-in for `wrap-inside: avoid` (CSS Text 4), which no browser implements.
//
// THE INVARIANT, which defines correct: the character just before a group's first character, and the
// one just after its last, is breakable whitespace, or nothing (the edge of the block), or a hard
// boundary. No group edge ever falls between two glued characters.
//
// THE OUTPUT. Each group is wrapped in <span class="chip-unit">, and nothing else changes: no attribute
// on any other node, no whitespace added or removed, and a text node is split only at a group's edge.
// It has to be a span: Starlight's markdown.css spaces flow content with a sibling rule that exempts
// span, so any other element could pick up a top margin. The class is generated here and is never
// hand-authored.
//
// CONSUMED BY BOTH NODE AND VITE, like src/lib/taxonomy.mjs: the plugin loads this at config time in
// plain Node, and Toggle.astro imports it through Vite. Its only import is unist-util-visit, a declared
// dependency that both resolve to the same copy (CORE_SPEC section 3, "Range form").

import { visit } from 'unist-util-visit';

/** The wrapper's class. Generated here, never hand-authored. */
export const UNIT_CLASS = 'chip-unit';

// Breakable whitespace, the only places a group may start or end. Everything else is glue: punctuation,
// quotes (smartypants' curly ones included), slashes, hyphens, and the no-break spaces U+00A0, U+202F,
// U+2007 and U+2060.
const BREAKABLE = new Set([' ', '\t', '\n', '\f', '\r', '\u200B']);

// The HTML phrasing elements a group may cross or swallow whole, as hast elements or as lowercase MDX
// JSX text elements. Anything else inside a line is a hard boundary: br, img, input, every capitalized
// MDX component, every MDX expression, and every element not on this list.
const PHRASING = new Set(['a', 'abbr', 'b', 'bdi', 'bdo', 'cite', 'code', 'data', 'del', 'dfn', 'em', 'i', 'ins',
  'kbd', 'mark', 'q', 's', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var']);

// Capitalized MDX components whose markdown children are running prose. Every other component's
// children are left alone: a component with a layout of its own (AttackPath, for one) owns its
// wrapping. Steps is here because two Bandit pages carry chips in its list items.
const PROSE_COMPONENTS = new Set(['Callout', 'Toggle', 'Steps']);

// A hand-written port label is a chip too: CORE_SPEC treats an inline port and a rail port as one
// object, and `Port 80` has a space to split at. The rail's own port chips sit in its dt, which the
// grid track measures, so the dt is out of reach below.
const PORT_CLASS = 'port-label';
const RAIL_CLASS = 'findings';

/**
 * A hast or MDX node, as far as grouping needs to see it. Text nodes in a parsed label also carry
 * `raw` (the author's own source for the text, character references included) and `map` (the raw
 * offset of each decoded character, plus one past the end), so a split keeps the source byte for byte.
 * @typedef {object} ChipNode
 * @property {string} type
 * @property {string} [value]
 * @property {string} [tagName]
 * @property {string | null} [name]
 * @property {Record<string, unknown>} [properties]
 * @property {Array<{ type: string, name?: string, value?: unknown }>} [attributes]
 * @property {ChipNode[]} [children]
 * @property {string} [raw]
 * @property {number[]} [map]
 */

// Sentinels for a node's edge character: nothing there at all, or a hard boundary.
const EMPTY = 0;
const HARD = 1;

/** @param {ChipNode} node @returns {boolean} */
const isJsx = (node) => node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement';

/** @param {ChipNode} node @returns {string | null} */
const nameOf = (node) => (node.type === 'element' ? node.tagName ?? null : isJsx(node) ? node.name ?? null : null);

/** @param {ChipNode} node @returns {string[]} */
function classesOf(node) {
  if (node.type === 'element') {
    const value = node.properties?.className;
    return Array.isArray(value) ? value.map(String) : typeof value === 'string' ? value.split(/\s+/) : [];
  }
  if (isJsx(node)) {
    const attribute = (node.attributes ?? []).find(
      (a) => a.type === 'mdxJsxAttribute' && (a.name === 'class' || a.name === 'className')
    );
    return typeof attribute?.value === 'string' ? attribute.value.split(/\s+/) : [];
  }
  return [];
}

/** @param {ChipNode} node @param {string} name @returns {boolean} */
const hasClass = (node, name) => classesOf(node).includes(name);

/** A capitalized MDX JSX element, which is a component rather than an HTML tag. @param {ChipNode} node @returns {boolean} */
const isComponent = (node) => isJsx(node) && typeof node.name === 'string' && /^[A-Z]/.test(node.name);

/** A phrasing element a group may cross. An existing group never counts: groups never nest. @param {ChipNode} node @returns {boolean} */
const isInline = (node) =>
  (node.type === 'element' || node.type === 'mdxJsxTextElement') &&
  PHRASING.has(nameOf(node) ?? '') &&
  !hasClass(node, UNIT_CLASS);

/** Inline code, or a hand-written port label. @param {ChipNode} node @returns {boolean} */
const isChip = (node) =>
  (node.type === 'element' || node.type === 'mdxJsxTextElement') &&
  (nameOf(node) === 'code' || (nameOf(node) === 'span' && hasClass(node, PORT_CLASS)));

/** @param {string | 0 | 1} edge @returns {boolean} */
const isGlue = (edge) => typeof edge === 'string' && !BREAKABLE.has(edge);

/**
 * The first (or last) character a node contributes to the line, looking through inline elements and
 * skipping empty text. EMPTY when there is none, HARD when a hard boundary comes first.
 * @param {ChipNode} node
 * @param {boolean} fromStart
 * @returns {string | 0 | 1}
 */
function edgeOf(node, fromStart) {
  if (node.type === 'text') {
    const value = node.value ?? '';
    return value === '' ? EMPTY : fromStart ? value[0] : value[value.length - 1];
  }
  if (!isInline(node)) return HARD;
  const kids = node.children ?? [];
  for (let k = 0; k < kids.length; k++) {
    const edge = edgeOf(kids[fromStart ? k : kids.length - 1 - k], fromStart);
    if (edge !== EMPTY) return edge;
  }
  return EMPTY;
}

/** @param {string} text @returns {number} index of the first breakable character, or -1 */
function firstBreak(text) {
  for (let k = 0; k < text.length; k++) if (BREAKABLE.has(text[k])) return k;
  return -1;
}

/** @param {string} text @returns {number} index of the last breakable character, or -1 */
function lastBreak(text) {
  for (let k = text.length - 1; k >= 0; k--) if (BREAKABLE.has(text[k])) return k;
  return -1;
}

/**
 * Split a text node at a decoded-character offset. A label text node keeps its raw source through the
 * split, so the author's character references survive unchanged.
 * @param {ChipNode} node
 * @param {number} at
 * @returns {[ChipNode, ChipNode]}
 */
function splitText(node, at) {
  const value = node.value ?? '';
  /** @type {ChipNode} */
  const head = { type: 'text', value: value.slice(0, at) };
  /** @type {ChipNode} */
  const tail = { type: 'text', value: value.slice(at) };
  if (node.raw !== undefined && node.map !== undefined) {
    const offset = node.map[at];
    head.raw = node.raw.slice(0, offset);
    tail.raw = node.raw.slice(offset);
    head.map = node.map.slice(0, at + 1);
    tail.map = node.map.slice(at).map((m) => m - offset);
  }
  return [head, tail];
}

/**
 * True when a chip sits where grouping must not reach: inside pre, inside the recon rail's dt, inside
 * a .not-content subtree, inside a component that is not a prose container, or already inside a group.
 * @param {ChipNode} chip
 * @param {Map<ChipNode, ChipNode>} parents
 * @returns {boolean}
 */
function isExcluded(chip, parents) {
  for (let node = parents.get(chip); node !== undefined; node = parents.get(node)) {
    const name = nameOf(node);
    if (name === 'pre' || hasClass(node, 'not-content') || hasClass(node, UNIT_CLASS)) return true;
    if (name === 'dt') {
      const list = parents.get(node);
      if (list !== undefined && nameOf(list) === 'dl' && hasClass(list, RAIL_CLASS)) return true;
    }
    if (isComponent(node) && !PROSE_COMPONENTS.has(node.name ?? '')) return true;
  }
  return false;
}

/**
 * Build one group around a chip and wrap it. The run starts as the chip and extends over its siblings
 * while the content stays glued: a text node contributes its characters up to the first breakable
 * whitespace (and is split there), an inline element joins WHOLE when its edge touching the run is
 * glue, and extension stops only at breakable whitespace, a hard boundary or the edge of the block.
 * When the run reaches the edge of an inline ancestor and the glue continues outside it, that ancestor
 * joins whole and extension continues at its level.
 * @param {ChipNode} chip
 * @param {Map<ChipNode, ChipNode>} parents
 */
function wrapGroup(chip, parents) {
  let level = /** @type {ChipNode} */ (parents.get(chip));
  let kids = /** @type {ChipNode[]} */ (level.children);
  let start = kids.indexOf(chip);
  let end = start;
  /** Offset in kids[start - 1] where its glued tail begins. @type {number | null} */
  let leftCut = null;
  /** Offset in kids[end + 1] where its glued head ends. @type {number | null} */
  let rightCut = null;

  /**
   * Extend the run over siblings on one side (1 is forward, -1 backward). True when it reached the
   * edge of the current level still glued; false when it stopped.
   * @param {1 | -1} dir
   * @returns {boolean}
   */
  const extend = (dir) => {
    if ((dir > 0 ? rightCut : leftCut) !== null) return false;
    const edge = edgeOf(kids[dir > 0 ? end : start], dir < 0);
    if (edge !== EMPTY && !isGlue(edge)) return false;
    for (let k = dir > 0 ? end + 1 : start - 1; k >= 0 && k < kids.length; k += dir) {
      const node = kids[k];
      if (node.type === 'text') {
        const value = node.value ?? '';
        if (value === '') continue;
        const at = dir > 0 ? firstBreak(value) : lastBreak(value);
        if (at === -1) {
          if (dir > 0) end = k; else start = k;
          continue;
        }
        if (dir > 0 && at > 0) { end = k - 1; rightCut = at; }
        if (dir < 0 && at < value.length - 1) { start = k + 1; leftCut = at + 1; }
        return false;
      }
      if (!isInline(node)) return false;
      const near = edgeOf(node, dir > 0);
      if (near === EMPTY) continue;
      if (!isGlue(near)) return false;
      if (dir > 0) end = k; else start = k;
      if (!isGlue(edgeOf(node, dir < 0))) return false;
    }
    return true;
  };

  /**
   * The run reached the edge of the current level on one side. If that level is inline and glue
   * continues outside it (looking through further ancestors whose edge the run also reaches, skipping
   * empty text), the ancestor joins whole and the run moves up to its parent.
   * @param {1 | -1} dir
   * @returns {boolean}
   */
  const climb = (dir) => {
    let inner = level;
    for (;;) {
      if (!isInline(inner)) return false;
      const outer = parents.get(inner);
      if (outer === undefined) return false;
      const siblings = /** @type {ChipNode[]} */ (outer.children);
      /** @type {string | 0 | 1} */
      let edge = EMPTY;
      for (let k = siblings.indexOf(inner) + dir; k >= 0 && k < siblings.length && edge === EMPTY; k += dir) {
        edge = edgeOf(siblings[k], dir > 0);
      }
      if (edge === EMPTY) { inner = outer; continue; }
      if (!isGlue(edge)) return false;
      level = outer;
      kids = siblings;
      start = end = siblings.indexOf(inner);
      leftCut = rightCut = null;
      return true;
    }
  };

  for (;;) {
    const reachedEnd = extend(1);
    const reachedStart = extend(-1);
    if ((reachedEnd && climb(1)) || (reachedStart && climb(-1))) continue;
    break;
  }

  const first = leftCut === null ? start : start - 1;
  const last = rightCut === null ? end : end + 1;
  /** @type {ChipNode[]} */ const before = [];
  /** @type {ChipNode[]} */ const inside = [];
  /** @type {ChipNode[]} */ const after = [];
  for (let k = first; k <= last; k++) {
    if (leftCut !== null && k === start - 1) {
      const [head, tail] = splitText(kids[k], leftCut);
      before.push(head);
      inside.push(tail);
    } else if (rightCut !== null && k === end + 1) {
      const [head, tail] = splitText(kids[k], rightCut);
      inside.push(head);
      after.push(tail);
    } else {
      inside.push(kids[k]);
    }
  }
  /** @type {ChipNode} */
  const group = { type: 'element', tagName: 'span', properties: { className: [UNIT_CLASS] }, children: inside };
  kids.splice(first, last - first + 1, ...before, group, ...after);
  for (const node of [...before, group, ...after]) parents.set(node, level);
  for (const node of inside) parents.set(node, group);
}

/**
 * Wrap every chip in the tree, with the characters glued to it, in <span class="chip-unit">. Chips are
 * taken in document order; a chip already swallowed by an earlier group is skipped, so chips glued to
 * each other share one group and groups never nest. Mutates the tree.
 * @param {ChipNode} tree
 * @returns {number} the number of groups created
 */
export function groupChips(tree) {
  /** @type {Map<ChipNode, ChipNode>} */
  const parents = new Map();
  /** @type {ChipNode[]} */
  const chips = [];
  visit(/** @type {import('unist').Node} */ (tree), (node, _index, parent) => {
    const chipNode = /** @type {ChipNode} */ (node);
    if (parent) parents.set(chipNode, /** @type {ChipNode} */ (parent));
    if (isChip(chipNode)) chips.push(chipNode);
  });
  let groups = 0;
  for (const chip of chips) {
    if (isExcluded(chip, parents)) continue;
    wrapGroup(chip, parents);
    groups++;
  }
  return groups;
}

// ── Labels rendered through set:html ──────────────────────────────────────────────────────────────
// A Toggle label is an HTML string, so the plugin never sees its chips. It is parsed into the same
// kind of tree and grouped by the same function. Only the markup labels actually use is supported
// (text, character references and a bare <code>, measured on 2026-09-24: 54 labels, <code> only);
// any other tag fails the build rather than shipping a structure nobody checked.

const CODE_OPEN = '<code>';
const CODE_CLOSE = '</code>';

// Named references that decode to breakable whitespace. Every other reference decodes to glue, so its
// exact character never matters here: it is classified as glue and the author's source is kept.
/** @type {Record<string, string>} */
const NAMED = {
  nbsp: '\u00A0', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  Tab: '\t', NewLine: '\n', ZeroWidthSpace: '\u200B', NegativeVeryThinSpace: '\u200B',
  NegativeThinSpace: '\u200B', NegativeMediumSpace: '\u200B', NegativeThickSpace: '\u200B',
};
const REFERENCE = /^&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|([A-Za-z][A-Za-z0-9]*));/;

/** @param {number} codePoint @returns {string} */
const fromCodePoint = (codePoint) =>
  codePoint === 0 || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff) ? '\uFFFD' : String.fromCodePoint(codePoint);

/**
 * A text node that classifies each character by what it decodes to (`&nbsp;` is glue) while keeping
 * the raw source for output.
 * @param {string} raw
 * @returns {ChipNode}
 */
function decodeText(raw) {
  let value = '';
  /** @type {number[]} */
  const map = [];
  for (let k = 0; k < raw.length;) {
    let decoded = raw[k];
    let length = 1;
    const match = decoded === '&' ? REFERENCE.exec(raw.slice(k)) : null;
    if (match !== null) {
      length = match[0].length;
      decoded = match[1] !== undefined ? fromCodePoint(parseInt(match[1], 10))
        : match[2] !== undefined ? fromCodePoint(parseInt(match[2], 16))
        : NAMED[match[3]] ?? '\uFFFD';
    }
    for (let unit = 0; unit < decoded.length; unit++) { map.push(k); value += decoded[unit]; }
    k += length;
  }
  map.push(raw.length);
  return { type: 'text', value, raw, map };
}

/**
 * @param {string} html
 * @param {string} where
 * @returns {ChipNode}
 */
function parseLabel(html, where) {
  /** @type {ChipNode} */
  const block = { type: 'element', tagName: 'summary', properties: {}, children: [] };
  /** @type {ChipNode[]} */
  const open = [block];
  for (let k = 0; k < html.length;) {
    const top = open[open.length - 1];
    const kids = /** @type {ChipNode[]} */ (top.children);
    if (html[k] === '<') {
      if (open.length === 1 && html.startsWith(CODE_OPEN, k)) {
        /** @type {ChipNode} */
        const code = { type: 'element', tagName: 'code', properties: {}, children: [] };
        kids.push(code);
        open.push(code);
        k += CODE_OPEN.length;
        continue;
      }
      if (open.length === 2 && html.startsWith(CODE_CLOSE, k)) {
        open.pop();
        k += CODE_CLOSE.length;
        continue;
      }
      const tag = /^<\/?[^\s>]*/.exec(html.slice(k))?.[0] ?? '<';
      throw new Error(`[chip-units] ${where}: unsupported markup "${tag}" in the Toggle label "${html}". ` +
        'A label is grouped through src/lib/chip-units.mjs, which supports text, character references and a bare <code> only.');
    }
    const next = html.indexOf('<', k);
    const stop = next === -1 ? html.length : next;
    kids.push(decodeText(html.slice(k, stop)));
    k = stop;
  }
  if (open.length !== 1) throw new Error(`[chip-units] ${where}: unclosed <code> in the Toggle label "${html}".`);
  return block;
}

/** @param {ChipNode[]} nodes @returns {string} */
function serialize(nodes) {
  let out = '';
  for (const node of nodes) {
    if (node.type === 'text') out += node.raw ?? '';
    else if (node.tagName === 'code') out += CODE_OPEN + serialize(node.children ?? []) + CODE_CLOSE;
    else out += `<span class="${UNIT_CLASS}">` + serialize(node.children ?? []) + '</span>';
  }
  return out;
}

/**
 * Group the chips in a label string before set:html renders it. A label without markup is returned
 * untouched; one with markup other than <code> throws, naming the file.
 * @param {string} html
 * @param {string} where
 * @returns {string}
 */
export function groupLabelHtml(html, where) {
  if (!html.includes('<')) return html;
  const block = parseLabel(html, where);
  groupChips({ type: 'root', children: [block] });
  return serialize(block.children ?? []);
}
