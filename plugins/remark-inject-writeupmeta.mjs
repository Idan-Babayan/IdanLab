// plugins/remark-inject-writeupmeta.mjs
// Injects the <WriteupMeta /> badge row (and its import) into every writeup at build time, so a
// writeup carries its metadata in frontmatter only and never hand-places the component.
// Platform is NOT a frontmatter field: it is derived from the platform directory in the path, the
// same way the sidebar and PlatformIndex treat the directory as authoritative. That removes the
// whole "missing or misspelled platform key" failure class structurally.
// os / environment / difficulty come from frontmatter and are all optional: each is forwarded only
// when it holds a non-empty string, so a progressive wargame with no rating (Bandit) simply omits
// difficulty and WriteupMeta renders without that chip.
// Reading frontmatter requires the transformer take the vfile as its SECOND argument; a (tree)-only
// transformer, like the PasswordReveal injector, never sees it.
// Dependency-free beyond the toolchain: unist-util-visit and acorn both already ship as transitive
// deps of @astrojs/mdx, so this adds nothing to package.json.

import { visit } from "unist-util-visit";
import { parse } from "acorn";

const COMPONENT_NAME = "WriteupMeta";
const IMPORT_SPECIFIER = "@components/badges/WriteupMeta.astro";

// SINGLE SOURCE OF TRUTH for platform. The directory is authoritative: a writeup's platform is a
// fact about where it lives, not a value an author restates (and can mistype) in frontmatter.
// Keys are the on-disk lowercase directory names under src/content/docs/.
const DIR_TO_PLATFORM = {
  hackthebox: "HackTheBox",
  vulnhub: "VulnHub",
  picoctf: "PicoCTF",
  overthewire: "OverTheWire",
};

// Frontmatter axes forwarded to the component, in the order they are rendered.
const OPTIONAL_FIELDS = ["os", "environment", "difficulty"];

const CONTENT_ROOT = "/src/content/docs/";

// A file is a writeup, and gets the badge row, only when it sits under one of the four platform
// directories and is not a section index. Hubs (index.mdx) and everything outside those directories
// are exempt, so a stray os/environment field elsewhere can never trigger an injection.
// Returns the derived platform name, or null when the file is not a writeup.
const writeupPlatform = (filePath) => {
  const normalized = String(filePath ?? "").replace(/\\/g, "/");
  const at = normalized.lastIndexOf(CONTENT_ROOT);
  if (at === -1) return null;

  const segments = normalized.slice(at + CONTENT_ROOT.length).split("/");
  if (segments.length < 2) return null;

  const platform = DIR_TO_PLATFORM[segments[0]];
  if (!platform) return null;

  const filename = segments[segments.length - 1];
  if (!/\.mdx$/i.test(filename)) return null;
  if (/^index\.mdx$/i.test(filename)) return null;

  return platform;
};

// Absent means "no usable value": undefined, null (an empty `os:` parses to null), a non-string, or
// an empty string. Deliberately not a bare `in` test, which reports an empty-valued key as present.
const presentString = (value) => typeof value === "string" && value.trim() !== "";

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

const createMetaNode = (attributes) => ({
  type: "mdxJsxFlowElement",
  name: COMPONENT_NAME,
  attributes,
  children: [],
});

// The badge row sits directly under the title, ahead of the body, so it goes in as the first
// non-import node. ESM nodes are hoisted to module scope by MDX regardless of position, but keeping
// the element after the file's own imports matches how these writeups read when hand-authored.
const firstBodyIndex = (tree) => {
  let index = 0;
  while (index < tree.children.length && tree.children[index].type === "mdxjsEsm") index += 1;
  return index;
};

// Only the unquoted boolean `false` opts a writeup out. YAML makes this a trap worth failing on:
// `badges: no` and `badges: off` parse as the strings "no" and "off", and `badges: "false"` as the
// string "false", all of which are truthy, so an author who meant to opt out would silently get
// badges anyway. Anything present that is not a real boolean is therefore a build error.
const optedOut = (frontmatter, filePath) => {
  if (!("badges" in frontmatter)) return false;

  const badges = frontmatter.badges;
  if (typeof badges !== "boolean") {
    throw new Error(
      `${COMPONENT_NAME} injector: invalid "badges" value ${JSON.stringify(badges)} in ${filePath}. ` +
        `The opt-out must be the unquoted boolean false (badges: false). A quoted or word form ` +
        `("false", no, off) parses as a truthy string and would silently fail to opt out.`
    );
  }

  return badges === false;
};

export default function remarkInjectWriteupMeta() {
  return (tree, file) => {
    const platform = writeupPlatform(file?.path ?? file?.history?.[0]);
    if (!platform) return;

    const frontmatter = file?.data?.astro?.frontmatter ?? {};
    if (optedOut(frontmatter, file?.path)) return;

    let alreadyImported = false;
    visit(tree, (node) => {
      if (importsComponent(node)) alreadyImported = true;
    });

    const attributes = [{ type: "mdxJsxAttribute", name: "platform", value: platform }];
    for (const field of OPTIONAL_FIELDS) {
      const value = frontmatter[field];
      if (presentString(value)) {
        attributes.push({ type: "mdxJsxAttribute", name: field, value });
      }
    }

    tree.children.splice(firstBodyIndex(tree), 0, createMetaNode(attributes));
    if (!alreadyImported) {
      tree.children.unshift(createImportNode(IMPORT_SPECIFIER));
    }
  };
}
