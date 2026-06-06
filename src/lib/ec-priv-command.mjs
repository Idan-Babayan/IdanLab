// Expressive Code plugin: tag privilege-escalation command words (sudo, ...) with a CSS class
// so they can be colored distinctly, theme-aware, in src/styles/custom.css.
//
// Mechanism choice (verified against astro-expressive-code 0.42.0):
//   - A Shiki `span` transformer (the obvious first try) is REJECTED by EC 0.42: it only allows
//     transformer hooks that modify highlighting tokens (code/line/pre/root/span/postprocess are
//     blocked with "hook not supported by Expressive Code yet"). So adding a DOM class via a Shiki
//     transformer is impossible in this version.
//   - EC's own plugin API IS supported: the `postprocessRenderedLine` hook runs on each rendered
//     line's hast, and the exported `addClassName` helper adds a class to a token node. That is the
//     clean, supported path here, so this is implemented as an Expressive Code plugin.
//
// Scope limitation (documented, not guessed): EC 0.42 highlights with includeExplanation:false,
// so per-token TextMate scopes are not available. We cannot filter strings/comments by scope.
// Instead we match only token spans whose FULL text is exactly a listed command word. A real
// command (`sudo -l`) renders as its own token span, whereas `sudo` inside a string or comment is
// part of a larger token (e.g. `[sudo] password`, `# run sudo`), so exact whole-token matching
// already excludes those cases. See the live verification notes in the PR/commit.

import { definePlugin, addClassName } from '@expressive-code/core';

// Small configurable list so su / doas can be added later without touching the mechanism.
const PRIV_COMMANDS = new Set(['sudo']);

// The class is the only thing this mechanism adds. Color lives in custom.css.
const PRIV_CLASS = 'ec-cmd-priv';

// Recursively read the text content of a hast node.
function textOf(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value ?? '';
  if (node.children) return node.children.map(textOf).join('');
  return '';
}

// Walk hast, tagging any element whose full text is exactly a privilege command.
function tagNode(node) {
  if (!node || node.type !== 'element') return;
  if (node.tagName === 'span' && PRIV_COMMANDS.has(textOf(node).trim())) {
    addClassName(node, PRIV_CLASS);
    return; // tagged at this level; no need to descend further
  }
  node.children?.forEach(tagNode);
}

export function pluginPrivCommand() {
  return definePlugin({
    name: 'priv-command',
    hooks: {
      postprocessRenderedLine(context) {
        context.renderData.lineAst.children?.forEach(tagNode);
      },
    },
  });
}
