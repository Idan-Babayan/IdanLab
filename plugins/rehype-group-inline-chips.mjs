// plugins/rehype-group-inline-chips.mjs
// Wraps each inline-code chip, together with every character glued to it, in <span class="chip-unit">,
// so a chip never splits across two lines unless its group is longer than the whole line. prose.css
// makes each group an atomic, column-capped inline-block.
//
// The rule, its invariant and its exclusions live in src/lib/chip-units.mjs, which Toggle.astro also
// runs over its set:html label, so the two paths share one implementation and cannot drift. This file
// only hands each page's tree to it. Hast elements and MDX JSX nodes are both handled there, the same
// way rehype-content-image-loading.mjs handles an <img> written either way.
//
// WHY REHYPE, NOT REMARK. The pass has to see the tree after every remark transform has run, including
// the recon rail's <dd>, which remarkTransformReconRail generates and which the remark-stage plugins
// deliberately never see. A chip in a rail description is grouped like any other, and the rail's <dt>
// port chip is excluded by name, because the grid track measures it.
//
// Dependency-free beyond the toolchain: the module binds to unist-util-visit, the same declared
// dependency the other plugins use, so this adds nothing to package.json.

import { groupChips } from "../src/lib/chip-units.mjs";

export default function rehypeGroupInlineChips() {
  return (tree) => {
    groupChips(tree);
  };
}
