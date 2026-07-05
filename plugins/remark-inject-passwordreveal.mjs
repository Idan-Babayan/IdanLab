// plugins/remark-inject-passwordreveal.mjs
// Injects `import PasswordReveal from '...'` into an MDX file's AST at build time, so a
// writeup can use <PasswordReveal ... /> inline with no per-file import line.
// Conditional: only injects when the file actually renders a <PasswordReveal> element, and
// only when the file does not already import it itself (guards a manual import).
// Dependency-free beyond the toolchain: unist-util-visit and acorn both already ship as
// transitive deps of @astrojs/mdx, so this adds nothing to package.json.

import { visit } from "unist-util-visit";
import { parse } from "acorn";

const COMPONENT_NAME = "PasswordReveal";
const IMPORT_SPECIFIER = "@components/PasswordReveal.astro";

const isComponentUsage = (node) =>
  (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
  node.name === COMPONENT_NAME;

const importsComponent = (node) => {
  if (node.type !== "mdxjsEsm") return false;

  const body = node.data?.estree?.body ?? [];
  const hasEstreeImport = body.some(
    (statement) =>
      statement.type === "ImportDeclaration" &&
      statement.specifiers.some(
        (specifier) =>
          (specifier.type === "ImportDefaultSpecifier" || specifier.type === "ImportSpecifier") &&
          specifier.local.name === COMPONENT_NAME
      )
  );

  // Fallback for the rare case data.estree is missing: match the raw source text instead.
  const value = node.value ?? "";
  const hasTextImport = /^\s*import\b/.test(value) && new RegExp(`\\b${COMPONENT_NAME}\\b`).test(value);

  return hasEstreeImport || hasTextImport;
};

const createImportNode = (specifier) => {
  const source = `import ${COMPONENT_NAME} from '${specifier}';`;
  const estree = parse(source, { ecmaVersion: "latest", sourceType: "module" });
  return { type: "mdxjsEsm", value: source, data: { estree } };
};

export default function remarkInjectPasswordReveal() {
  return (tree) => {
    let usesComponent = false;
    let alreadyImported = false;

    visit(tree, (node) => {
      if (isComponentUsage(node)) usesComponent = true;
      if (importsComponent(node)) alreadyImported = true;
    });

    if (usesComponent && !alreadyImported) {
      tree.children.unshift(createImportNode(IMPORT_SPECIFIER));
    }
  };
}
