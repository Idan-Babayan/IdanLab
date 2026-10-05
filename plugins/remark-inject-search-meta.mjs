// plugins/remark-inject-search-meta.mjs
// A site search field every page blanks. It rides on an empty <span hidden data-pagefind-meta="image:">
// appended at the END of the content: `hidden` is display: none and leaves the accessibility tree, so
// there is nothing to see, hear or select, and with no next sibling it gives Starlight's sibling spacing
// rules nothing to act on. Pagefind reads data-pagefind-meta from the static HTML.
//
// `image` is set empty. Pagefind otherwise keeps the first image after the title, and its alt text, as a
// searchable field, and Starlight's search never shows images. On OverTheWire and PicoCTF pages that
// image was the badge row's logo, inlined as an SVG data URI, so every coordinate in the logo was a
// searchable number: on every Bandit page it scored 381 for "bandit 6 7", where the title of 6-7 scored
// 6, and it, not the text, made "svg" and "uploaded" find Bandit pages. Elsewhere it was a screenshot's
// file name and alt text, or a decorative image's file name.
// CORE_SPEC §5 "Search ranking and the search fields" has the measurements. Runs after the taxonomy
// guard, like the other generators, so the guard never sees the span.

export default function remarkInjectSearchMeta() {
  return (tree) => {
    tree.children.push({
      type: "mdxJsxFlowElement",
      name: "span",
      attributes: [
        { type: "mdxJsxAttribute", name: "hidden", value: null },
        { type: "mdxJsxAttribute", name: "data-pagefind-meta", value: "image:" },
      ],
      children: [],
    });
  };
}
