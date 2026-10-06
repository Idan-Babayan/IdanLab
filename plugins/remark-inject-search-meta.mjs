// plugins/remark-inject-search-meta.mjs
// Site search fields that a page's path implies but its text never states, and one field every page
// blanks. Each rides on an empty <span hidden data-pagefind-meta="..."> appended at the END of the
// content: `hidden` is display: none and leaves the accessibility tree, so there is nothing to see,
// hear or select, and with no next sibling it gives Starlight's sibling spacing rules nothing to act
// on. Pagefind reads data-pagefind-meta from the static HTML.
//
// How Pagefind scores a field (read from Pagefind 1.5.2's own source, 2026-10-05), which shapes every
// field below:
//   - a typed term matches every word that STARTS with it: "1" matches 1, 12 and 1718 alike;
//   - a field match gets no credit for being exact, as the page text does;
//   - every distinct word a term matches adds to the field's score, which then grows with the cube
//     of the share of the query the field covers.
//
// Every page: `image` is set empty. Pagefind otherwise keeps the first image after the title, and its
// alt text, as a searchable field, and Starlight's search never shows images. On OverTheWire and
// PicoCTF pages that image was the badge row's logo, inlined as an SVG data URI, so every coordinate
// in the logo was a searchable number: on every Bandit page it scored 381 for "bandit 6 7", where the
// title of 6-7 scored 6, and it, not the text, made "svg" and "uploaded" find Bandit pages. Elsewhere
// it was a screenshot's file name and alt text, or a decorative image's file name.
//
// A wargame level, overthewire/<wargame>/<N>-<M>.mdx, gets two fields:
//   - `level`: "<wargame> Level", N when N is one digit, the route's digits (N and M run together,
//     which is what Pagefind makes of a typed "17-18"), and M when M is one digit. So 1-2 carries
//     "bandit Level 1 12 2", 9-10 "bandit Level 9 910" and 17-18 "bandit Level 1718". A two-digit
//     level's number starts its route's digits, so the route alone answers "bandit 17" and "level 17".
//     A one-digit level carries its bare number as well, one word more than the two-digit levels that
//     share its digit, and that word is what wins it the query: titles such as "Bandit 12 → 13" hold
//     two words starting with 1, so without it "bandit 1" listed 12-13 first. M, when one digit, lets
//     "bandit 6 7" (the title as typed) prefer 6-7, which holds both numbers, to 7-8.
//   - `login`: the level's SSH user, <wargame>N ("bandit17"), so a pasted login finds the level played
//     as that user.
// A wargame hub, overthewire/<wargame>/index.mdx, gets `wargame`: its title, so "bandit" lists the hub
// first.
// astro.config.mjs weights the fields (starlight pagefind.ranking.metaWeights); CORE_SPEC §5 "Search
// ranking and the search fields" has the measurements. Runs after the taxonomy guard, like the other
// generators, so the guard never sees the spans.

const CONTENT_ROOT = "/src/content/docs/";
const LEVEL_FILE = /^(\d+)-(\d+)\.mdx$/i;

// The fields for a file: `image` on every page, then a level's or a hub's own, for OverTheWire pages
// one directory deep (overthewire/<wargame>/<file>).
const searchFields = (filePath, frontmatter) => {
  const fields = ["image:"];
  const normalized = String(filePath ?? "").replace(/\\/g, "/");
  const at = normalized.lastIndexOf(CONTENT_ROOT);
  if (at === -1) return fields;
  const segments = normalized.slice(at + CONTENT_ROOT.length).split("/");
  if (segments.length !== 3 || segments[0] !== "overthewire") return fields;
  const wargame = segments[1].toLowerCase();

  const level = segments[2].match(LEVEL_FILE);
  if (level) {
    const [n, m] = [Number(level[1]), Number(level[2])];
    const keys = [...(n < 10 ? [n] : []), `${n}${m}`, ...(m < 10 ? [m] : [])];
    fields.push(`level:${wargame} Level ${keys.join(" ")}`, `login:${wargame}${n}`);
    return fields;
  }

  if (/^index\.mdx$/i.test(segments[2])) {
    const title = typeof frontmatter.title === "string" ? frontmatter.title.trim() : "";
    if (title) fields.push(`wargame:${title}`);
  }
  return fields;
};

export default function remarkInjectSearchMeta() {
  return (tree, file) => {
    const fields = searchFields(file?.path ?? file?.history?.[0], file?.data?.astro?.frontmatter ?? {});
    for (const field of fields) {
      tree.children.push({
        type: "mdxJsxFlowElement",
        name: "span",
        attributes: [
          { type: "mdxJsxAttribute", name: "hidden", value: null },
          { type: "mdxJsxAttribute", name: "data-pagefind-meta", value: field },
        ],
        children: [],
      });
    }
  };
}
