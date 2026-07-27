// plugins/remark-transform-recon-rail.mjs
// Turns a plain markdown list inside <Callout type="recon"> into the findings rail's rendered
// structure at build time, so a writeup authors DATA (a port and a note per line) and never the
// presentation that displays it.
//
// Authored:
//   <Callout type="recon">
//
//   - 53/tcp : DNS, Simple DNS Plus
//   - 389/tcp : LDAP for `htb.local`
//
//   </Callout>
//
// Emitted: <dl class="findings"><dt><span class="port-label">53/tcp</span></dt><dd>...</dd>...</dl>
//
// This SUPERSEDES the <Findings> / <Finding> components (2026-07-27). Those produced the same DOM but
// required two import lines and JSX structure in every content file, which is presentation living in
// content: the exact rule the same workstream had just written into CORE_SPEC section 8. A component
// that must be imported into a content file is itself presentation in that file. The transform reads
// data the author was already writing, so the authoring is now simpler than it was before any of this.
//
// WHY ALL-OR-NOTHING PER LIST. A list is converted only if EVERY item parses as a finding. Convert a
// list partially and the page still builds, still looks nearly right, and quietly drops a row's
// structure: a silent failure on a green build. Leave the list alone and it renders with its bullets
// intact, which is visibly wrong at a glance, so the author sees it and fixes the row. Loud beats
// quiet whenever the build cannot tell which one the author meant.
//
// WHY dt AND dd ARE SIBLINGS WITH NO PER-ROW WRAPPER. Both must be DIRECT children of the dl so they
// are grid items of its two computed columns. A per-row wrapper would need `subgrid`, and subgrid
// blockifies an element child onto its own track: measured on 2026-07-26, a row containing inline
// <code> went from 28.80px to 51.83px with `htb.local` alone on a second line in the tag column. That
// measurement is why this emits a flat sequence rather than a row element.
//
// WHY THE DELIMITER IS A PARSE TOKEN, NOT A GLYPH. The authored " : " is consumed here and never
// rendered. The separator the reader sees is drawn in CSS, because a separator is presentation. The
// source keeps it only because it is the least ambiguous way to mark where the port token ends.
//
// MIXED RAILS ARE UNSUPPORTED BY DESIGN. A prose bullet inside a findings list has no port and would
// have to become a spanning row, which is a different layout wearing the same markup. Author prose as
// a paragraph before or after the list, which is what the Assessment treatment already expects.
//
// Dependency-free beyond the toolchain: unist-util-visit already ships as a transitive dep of
// @astrojs/mdx, so this adds nothing to package.json.

import { visit } from "unist-util-visit";

const CALLOUT_NAME = "Callout";
const RECON_TYPE = "recon";
const RAIL_CLASS = "findings";
const CHIP_CLASS = "port-label";

// The port token is everything before the first " : ". \S+ keeps it a single unbroken token, so a
// description that happens to contain a colon later in the line cannot be mistaken for the delimiter.
const FINDING = /^(\S+)\s:\s/;

const isReconCallout = (node) =>
  node.type === "mdxJsxFlowElement" &&
  node.name === CALLOUT_NAME &&
  node.attributes.some(
    (attribute) =>
      attribute.type === "mdxJsxAttribute" &&
      attribute.name === "type" &&
      attribute.value === RECON_TYPE
  );

// A convertible item is a listItem whose first child is a paragraph whose first child is a text node
// carrying the delimiter. Anything else (a nested list, a bare inlineCode opener, a loose item with
// no paragraph) fails, and one failure disqualifies the whole list.
const findingParts = (item) => {
  if (item.type !== "listItem") return null;

  const paragraph = item.children?.[0];
  if (!paragraph || paragraph.type !== "paragraph") return null;

  const first = paragraph.children?.[0];
  if (!first || first.type !== "text") return null;

  const match = FINDING.exec(first.value);
  if (!match) return null;

  return { paragraph, first, port: match[1], rest: first.value.slice(match[0].length) };
};

const element = (name, className, children) => ({
  type: "mdxJsxFlowElement",
  name,
  attributes: [{ type: "mdxJsxAttribute", name: "class", value: className }],
  children,
});

// `class`, not `className`. Verified on a scratch page that both render as class="findings" on a
// lowercase element, so this is a readability choice rather than a functional one: it matches how
// every other class in this codebase is authored.
const chip = (port) => ({
  type: "mdxJsxTextElement",
  name: "span",
  attributes: [{ type: "mdxJsxAttribute", name: "class", value: CHIP_CLASS }],
  children: [{ type: "text", value: port }],
});

const railFromList = (list) => {
  const rows = list.children.map(findingParts);
  if (rows.length === 0 || rows.some((row) => row === null)) return null;

  const children = [];
  for (const { paragraph, first, port, rest } of rows) {
    // The description keeps every other child of the source paragraph, in order and untouched, so
    // inline <code>, emphasis and links all survive. Only the leading text node is rewritten, and it
    // is dropped outright when the delimiter consumed the whole of it, rather than emitting an empty
    // text node that would render as a stray space before the first real child.
    const description = rest === "" ? paragraph.children.slice(1) : [
      { ...first, value: rest },
      ...paragraph.children.slice(1),
    ];

    children.push({
      type: "mdxJsxFlowElement",
      name: "dt",
      attributes: [],
      children: [chip(port)],
    });
    children.push({
      type: "mdxJsxFlowElement",
      name: "dd",
      attributes: [],
      children: description,
    });
  }

  return element("dl", RAIL_CLASS, children);
};

export default function remarkTransformReconRail() {
  return (tree) => {
    visit(tree, isReconCallout, (callout) => {
      // Direct children only. A list nested inside a toggle or a blockquote within the callout is
      // not a findings rail and is deliberately out of reach.
      callout.children = callout.children.map((child) => {
        if (child.type !== "list") return child;
        return railFromList(child) ?? child;
      });
    });
  };
}
