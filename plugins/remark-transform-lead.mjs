// plugins/remark-transform-lead.mjs
// Names the page's LEAD at build time. The lead is the first block of a page under one of the four
// platform directories, past its imports, MDX comments and the injected badge row. When that block is
// a quote it is the page's goal or its overview, and the page itself says which: a quote that opens
// with "Goal:" (any case) is a goal, any other quote is an overview. Every Bandit level and PicoCTF
// writeup opens with its "> Goal:" line, the first step of their template; the HackTheBox writeups and
// the Bandit hub open with an overview; the landings open with a component and have no lead.
//
// WHY A REMARK PLUGIN. CSS cannot read text, so no selector can tell a goal from an overview. And the
// table of contents is outside the markdown: Starlight adds its first entry itself (the #_top link,
// labelled from the tableOfContents.overview UI string), so no remark plugin can rename it. This pass
// DECIDES and records the verdict; overrides/PageSidebar.astro APPLIES it to the TOC.
//
// Gate: files under src/content/docs/{hackthebox,vulnhub,picoctf,overthewire}/, index pages (hubs and
// landings) included. Windows backslashes are normalised first. Any other file is left untouched.
//
// Outputs, on a page with a lead:
//   - the quote is marked data-lead="goal" or data-lead="overview" through data.hProperties (merged
//     with any already there), the hook for the lead label and the lead's edge in prose.css;
//   - on a goal, the "Goal:" prefix is removed and the next letter capitalized, because the label now
//     says it and a screen reader would otherwise read it twice; a goal that opens on inline code or a
//     link leaves an empty text node, which is dropped instead;
//   - the verdict is recorded as leadKind in the plugin frontmatter (file.data.astro.frontmatter),
//     which Astro returns as remarkPluginFrontmatter from render(entry). That is how the PageSidebar
//     override reads it to name the TOC's first entry Goal.
// A page with no lead gets neither: no label, and Starlight's Overview entry stays.
//
// Guards, each failing the build with the file named:
//   - leadKind in the authored frontmatter: it is derived from the first block, never authored;
//   - a "> Goal:" quote anywhere but the first block, with its line: a goal opens its page.
//
// Coupling: src/styles/prose.css keys the label and the edge on [data-lead], so a quote this pass does
// not mark (a section intro) stays as it is. The PageSidebar override's LEAD_PAGE path test names the
// same four directories as PLATFORM_DIRS below: keep the two in step.
//
// Dependency-free beyond the toolchain: unist-util-visit already ships as a transitive dep of
// @astrojs/mdx, so this adds nothing to package.json.

import { visit, SKIP } from "unist-util-visit";

// The four platform directories. The PageSidebar override's LEAD_PAGE test names the same four:
// keep the two in step.
const PLATFORM_DIRS = ["hackthebox", "vulnhub", "picoctf", "overthewire"];
// "Goal:" in any case, and the spaces after it, at the very start of the quote's first text.
const GOAL_PREFIX = /^goal:[ \t]*/i;
// The plugin-frontmatter key the override reads back through render(entry).
const KEY = "leadKind";

const onPlatform = (filePath) => {
  const match = filePath.replace(/\\/g, "/").match(/\/src\/content\/docs\/([^/]+)\//);
  return match !== null && PLATFORM_DIRS.includes(match[1]);
};

// What renders nothing at the top of a page, or is generated there: imports, MDX comments and
// expressions, frontmatter, and the injected badge row. The lead is the first node that is none of these.
const skippable = (node) =>
  node.type === "mdxjsEsm" ||
  node.type === "mdxFlowExpression" ||
  node.type === "yaml" ||
  node.type === "toml" ||
  (node.type === "mdxJsxFlowElement" && node.name === "WriteupMeta");

// A quote opens with "Goal:" when its first paragraph's first inline is text that starts with it.
const goalText = (blockquote) => {
  const paragraph = blockquote.children[0];
  if (paragraph?.type !== "paragraph") return null;
  const text = paragraph.children[0];
  return text?.type === "text" && GOAL_PREFIX.test(text.value) ? { paragraph, text } : null;
};

export default function remarkTransformLead() {
  return (tree, file) => {
    const filePath = file?.path ?? file?.history?.[0] ?? "";
    if (!onPlatform(filePath)) return;

    const frontmatter = file?.data?.astro?.frontmatter;
    if (frontmatter !== undefined && KEY in frontmatter) {
      throw new Error(
        `lead transform: "${KEY}" is derived from the page's first block, never authored. ` +
          `Remove it from the frontmatter of ${filePath}.`
      );
    }

    const first = tree.children.find((node) => !skippable(node));
    const lead = first?.type === "blockquote" ? first : null;

    if (lead !== null) {
      const goal = goalText(lead);
      const kind = goal === null ? "overview" : "goal";
      if (goal !== null) {
        const rest = goal.text.value.replace(GOAL_PREFIX, "");
        // Nothing left: the goal opened on inline code or a link, so drop the empty text node.
        if (rest === "") goal.paragraph.children.shift();
        else goal.text.value = /^[a-z]/.test(rest) ? rest[0].toUpperCase() + rest.slice(1) : rest;
      }
      lead.data = { ...lead.data, hProperties: { ...lead.data?.hProperties, dataLead: kind } };
      if (frontmatter !== undefined) frontmatter[KEY] = kind;
    }

    visit(tree, "blockquote", (node) => {
      if (node === lead) return SKIP;
      if (goalText(node) !== null) {
        throw new Error(
          `lead transform: a "> Goal:" quote must be the first block of its page, found one at line ` +
            `${node.position?.start.line ?? "?"} in ${filePath}. Move it to the top, or reword it if it ` +
            `is not the page's goal.`
        );
      }
    });
  };
}
