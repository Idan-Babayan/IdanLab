// plugins/remark-validate-content-taxonomy.mjs
//
// Build-time guardrail. Fails the MDX compile when a writeup uses an unknown hand-authored
// badge/metadata class token, or an unknown component metadata value, so a content typo stops
// shipping as a silently unstyled element (for example `platform-hacktheboxx` renders a bare span
// today and the build stays green). This is the deliberate alternative to `astro check` (which was
// ruled out to avoid adding @astrojs/check + typescript): it targets the string/value surface that
// is authored by hand in MDX, which is the part that grows during the manual writeup pass.
//
// Why the remark (mdast) stage: this runs on the .mdx SOURCE, before any component renders, so it
// only ever sees HAND-AUTHORED markup. Component-generated classes (Callout's `cl-*`, WriteupMeta's
// `wm-*` / `pf-*`) are produced later during .astro rendering and are never visible here, so there
// is no way to false-positive on component output. Marketing pages (index.astro, about.astro) are
// not markdown, so their `platform-card` / `platform-grid` classes are never seen either. Within the
// hand-authored MDX we validate ONLY tokens in the families this guard OWNS (see below) and ignore
// every other class token (utility classes, component props like `spoiler-toggle`, and so on).
//
// Zero new dependencies. Uses only `unist-util-visit` (already a transitive dep via @astrojs/mdx,
// same as remark-inject-passwordreveal) plus Node built-ins. Nothing is added to package.json.
//
// SINGLE SOURCE OF TRUTH for validation. When the design taxonomy changes, update the allow-lists
// below and nowhere else. NOTE: the `.machine-meta` / `meta-badge` badge system is expected to be
// RETIRED when WriteupMeta fully rolls out. When that happens, remove the meta- / platform- /
// difficulty- / os- / machine- class families here and keep the WriteupMeta enum checks.

import { visit } from 'unist-util-visit';

// --- Owned class-token families: prefix -> the exact allowed full tokens --------------------------
// A hand-authored class token that STARTS WITH an owned prefix must be one of that prefix's exact
// tokens, otherwise the build fails. A token that starts with no owned prefix is out of scope and is
// ignored. Each of meta- / port- / task- / machine- maps to a single class, so owning the prefix is
// airtight. `platform-` is owned strictly: `.platform-card` / `.platform-grid` are marketing-only
// (.astro) classes that never appear in MDX, so a `platform-*` token here is always a badge modifier.
const CLASS_FAMILIES = {
  'meta-': ['meta-badge'],
  'platform-': ['platform-hackthebox', 'platform-overthewire', 'platform-picoctf', 'platform-vulnhub'],
  'difficulty-': ['difficulty-easy', 'difficulty-medium', 'difficulty-hard', 'difficulty-misc'],
  'os-': ['os-linux', 'os-windows'],
  'port-': ['port-label'],
  'task-': ['task-title'],
  'machine-': ['machine-meta'],
};

// A `meta-badge` element must carry exactly one modifier from one of these families.
const BADGE_MODIFIER_FAMILIES = ['platform-', 'difficulty-', 'os-'];
const BADGE_MODIFIERS = new Set(BADGE_MODIFIER_FAMILIES.flatMap((prefix) => CLASS_FAMILIES[prefix]));

// --- Component metadata enums: string prop values authored on component JSX elements ---------------
// The typed unions the components accept. WriteupMeta already throws at render on a bad value, but
// validating here fails earlier with a source position and a suggestion, and it also covers Callout
// and FlagCapture, whose .astro props are not type-checked at build. Only string-valued props are
// checked; a dynamic `{expr}` value is skipped.
const COMPONENT_ENUMS = {
  WriteupMeta: {
    platform: ['HackTheBox', 'VulnHub', 'PicoCTF', 'OverTheWire'],
    os: ['Linux', 'Windows'],
    environment: ['Standalone', 'Active Directory', 'Progressive'],
    difficulty: ['Easy', 'Medium', 'Hard', 'Insane'],
  },
  Callout: {
    type: ['recon', 'loot', 'intel', 'defense', 'vuln'],
  },
  FlagCapture: {
    type: ['user', 'root'],
  },
};

const JSX_NODE_TYPES = new Set(['mdxJsxFlowElement', 'mdxJsxTextElement']);
const CLASS_ATTR_NAMES = new Set(['class', 'className']);

// Levenshtein distance (small, dependency-free) so an error can suggest the closest allowed value.
function distance(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }
  return prev[n];
}

function closest(value, candidates) {
  let best = candidates[0];
  let bestDistance = Infinity;
  for (const candidate of candidates) {
    const d = distance(value, candidate);
    if (d < bestDistance) {
      bestDistance = d;
      best = candidate;
    }
  }
  return best;
}

function ownedPrefixOf(token) {
  for (const prefix of Object.keys(CLASS_FAMILIES)) {
    if (token.startsWith(prefix)) return prefix;
  }
  return null;
}

export default function remarkValidateContentTaxonomy() {
  return (tree, file) => {
    const locationOf = (node) => {
      const path = (file && (file.path || (file.history && file.history[0]))) || 'unknown file';
      const pos =
        node.position && node.position.start
          ? `:${node.position.start.line}:${node.position.start.column}`
          : '';
      return `${path}${pos}`;
    };
    const fail = (message, node) => {
      throw new Error(`[content-taxonomy-guard] ${message}\n  at ${locationOf(node)}`);
    };

    visit(tree, (node) => {
      if (!JSX_NODE_TYPES.has(node.type)) return;
      const attributes = Array.isArray(node.attributes) ? node.attributes : [];

      // 1. Class-token validation on any element carrying a hand-authored class string.
      for (const attr of attributes) {
        if (attr.type !== 'mdxJsxAttribute') continue;
        if (!CLASS_ATTR_NAMES.has(attr.name)) continue;
        if (typeof attr.value !== 'string') continue; // dynamic {expr}: not hand-authored text

        const tokens = attr.value.split(/\s+/).filter(Boolean);
        let hasMetaBadge = false;
        let badgeModifierCount = 0;

        for (const token of tokens) {
          if (token === 'meta-badge') hasMetaBadge = true;
          if (BADGE_MODIFIERS.has(token)) badgeModifierCount++;

          const prefix = ownedPrefixOf(token);
          if (!prefix) continue; // out of scope: unrelated / utility / component class, ignore

          const allowed = CLASS_FAMILIES[prefix];
          if (!allowed.includes(token)) {
            fail(
              `Unknown "${prefix}" class token "${token}". Did you mean "${closest(token, allowed)}"? ` +
                `Allowed ${prefix} tokens: ${allowed.join(', ')}.`,
              node,
            );
          }
        }

        // Structural rule: a meta-badge must carry exactly one platform / difficulty / os modifier.
        if (hasMetaBadge && badgeModifierCount === 0) {
          fail(
            `"meta-badge" element has no platform/difficulty/os modifier. Add exactly one of: ` +
              `${[...BADGE_MODIFIERS].join(', ')}.`,
            node,
          );
        }
        if (hasMetaBadge && badgeModifierCount > 1) {
          fail(
            `"meta-badge" element carries ${badgeModifierCount} family modifiers; it must carry exactly ` +
              `one (a single platform-, difficulty-, or os- token).`,
            node,
          );
        }
      }

      // 2. Component metadata enum validation (Callout, WriteupMeta).
      const enumsForComponent = COMPONENT_ENUMS[node.name];
      if (enumsForComponent) {
        for (const attr of attributes) {
          if (attr.type !== 'mdxJsxAttribute') continue;
          const allowed = enumsForComponent[attr.name];
          if (!allowed) continue;
          if (typeof attr.value !== 'string') continue; // dynamic value: skip
          if (!allowed.includes(attr.value)) {
            fail(
              `Unknown ${node.name} ${attr.name} "${attr.value}". Did you mean ` +
                `"${closest(attr.value, allowed)}"? Allowed: ${allowed.join(', ')}.`,
              node,
            );
          }
        }
      }
    });

    return tree;
  };
}
