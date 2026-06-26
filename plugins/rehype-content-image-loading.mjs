// plugins/rehype-content-image-loading.mjs
// Sets loading and decoding on content images in markdown and MDX.
// The first image on a page stays eager so the above-fold LCP image is not deferred.
// Every later image is lazy. Self-contained: no imports, no new dependencies.

export default function rehypeContentImageLoading() {
  return (tree) => {
    let seenFirstImage = false;

    const isHastImg = (node) =>
      node && node.type === "element" && node.tagName === "img";

    const isMdxImg = (node) =>
      node &&
      (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
      node.name === "img";

    const setHastProp = (node, name, value) => {
      node.properties = node.properties || {};
      node.properties[name] = value;
    };

    const setMdxAttr = (node, name, value) => {
      node.attributes = node.attributes || [];
      node.attributes = node.attributes.filter(
        (attr) => !(attr.type === "mdxJsxAttribute" && attr.name === name)
      );
      node.attributes.push({ type: "mdxJsxAttribute", name, value });
    };

    const applyLoading = (node, eager) => {
      if (isHastImg(node)) {
        setHastProp(node, "decoding", "async");
        setHastProp(node, "loading", eager ? "eager" : "lazy");
        if (eager) setHastProp(node, "fetchpriority", "high");
      } else {
        setMdxAttr(node, "decoding", "async");
        setMdxAttr(node, "loading", eager ? "eager" : "lazy");
        if (eager) setMdxAttr(node, "fetchpriority", "high");
      }
    };

    const walk = (node) => {
      if (!node || typeof node !== "object") return;
      if (isHastImg(node) || isMdxImg(node)) {
        applyLoading(node, !seenFirstImage);
        seenFirstImage = true;
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) walk(child);
      }
    };

    walk(tree);
    return tree;
  };
}
