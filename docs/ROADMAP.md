# Idan.Lab — Roadmap

> Volatile by design. Groom this often. Format: **Now** (active), **Next** (committed,
> not started), **Later** (parked). Move items down to DECISIONS.md when resolved.
> Each item: `[area] description — owner-note`. Areas: DESIGN, CONTENT, ENG, PRODUCT.

## Now (in progress)

- [DESIGN] **THE GEIST RETUNE. This is the top item and it is the gate on merging `dev` to `main`.**
  `dev` is 17 commits ahead of `main` and carries the Geist prose face WITHOUT the design being refitted
  around it. Merging now would deploy a half-tuned body face to production, so nothing merges until this
  is done and the owner has seen it on a real screen. The refactor and the retune ship as ONE release.
  See DECISIONS 2026-07-26 (the merge gate) for why splitting them was rejected.

  What the retune inherits, and why it should be a values exercise rather than an archaeology one: the
  theme pass is now layered, purged and tokenized. Every dial below is a custom property in ONE block at
  the top of `tokens.css`, precedence is decided by layer order rather than selector weight, and the dead
  rules that would have made a retune ambiguous are gone.

  1. **The prose dials** (structurally done since 2026-07-25, still genuine eye-calls on a real screen):
     `--prose-size` (18.5px now, `1.125rem` for the 18px variant), `--prose-leading` (~1.5 to 1.55),
     `--prose-strong-weight` (600 vs 700 against Geist), and the two toggle-title dials
     `--toggle-title-face` (`var(--body-face)` reads as a content label, `var(--sl-font-mono)` as terminal
     voice) + `--toggle-title-weight` (600 vs 700). Also the re-tuned spacing
     (`--prose-paragraph-gap`, `--prose-heading-gap`, `--blockquote-pad-y`), and confirm italic prose
     renders Geist's drawn italic rather than a slant. Both themes, wide and 375px.
  2. **The rest of the design against the new body face.** Geist changed the body but the surfaces around
     it were tuned for mono: the measure, the vertical rhythm between prose and components, and how the
     mono chrome (badges, callout labels, code frames, the Principle coda) now reads BESIDE a proportional
     face rather than matching it. This is the part that has not been done at all.
  3. **The three-column pass folds in here** (see the item below): it needs the same real-browser session
     and its values interact with the prose measure.
  4. **The unit rule is written and not applied** (`layers.css` header): rem or px for component geometry,
     em only where scaling with the local font size is the declared intent. Applying it belongs to THIS
     retune, because converting a unit changes rendered geometry and each conversion needs its own
     before-and-after measurement. Do not sweep it.

  Then move the settled values to DECISIONS, and only then open the PR.

- [ENG] **The CSS refactor is DONE and needs no further work** (DECISIONS 2026-07-26). Recorded here only
  so it is not reopened: `custom.css` is gone, the theme pass is ten modules under `src/styles/` on a
  declared cascade-layer contract, the dead rules are purged, the specificity armor is retired, and the
  OverTheWire amber is an accent/ink pair solved to WCAG AA. Verified at zero changed cells of 7,536 at
  every gate except the amber's intended 17. Selector flattening and unit conversions were deliberately
  excluded from the workstream (the unit rule is written but unapplied, see the retune item above).
- [DESIGN/ENG] Three-column rebalance + full-width intro pages (now in `tokens.css` and `chrome.css`):
  SHIPPED to production (commit
  `723c2ab`, PR #9 merged 2026-07-11) but STILL NEEDS A REAL-BROWSER FINE-TUNE. **Do this inside the Geist
  retune session above:** the content cap and the prose measure interact, so tuning them apart wastes a
  pass. The rem values are
  analysis-based starting targets and the required Chrome/Firefox visual pass has not yet run. Changes: (1) writeup content
  cap `--sl-content-width` 45rem -> 50rem (~75-char line); (2) right TOC tightened, which needs TWO widths because
  the visible TOC text column is `.right-sidebar-panel .sl-container` (Starlight derives it from --sl-sidebar-width,
  ~15rem), NOT `.right-sidebar-container` (the layout column) -- narrowing only the container would leave the 17rem
  panel overflowing, so both are set in sync (text 13rem, container 15rem; `overflow-wrap:anywhere` makes entries wrap,
  not clip); (3) `.main-pane` set to flex:1 + content `.sl-container` `margin-inline:auto` so the reading column
  centers with matching gutters (fixes the Principle looking off-center); (4) intro pages (.pi-index) go full
  width via `body:has(.pi-index){--sl-content-width:100%}` (superseded the old 60rem); (5) intro hero flush to
  top: added `padding-top:0` to the hero panel rule `body:has(.pi-index) .content-panel + .content-panel`
  (the 2nd ContentPanel, holding .pi-index; the 1st holds the hidden PageTitle). Diagnosed analytically, NOT
  in a browser: `<main>` has no top padding (--sl-main-pad `0 0 3vh 0`), the hero's own top is only 0.5rem, so
  the ~1.5rem "small gap" is Starlight's `.content-panel` top padding on the hero panel. OPEN QUESTION for the
  browser pass: the 1st (hidden-title) panel is an empty `.content-panel` with 1.5rem top+bottom padding (~3rem);
  the hero's `.pi-glow` is `position:absolute; top:-40%` and unclipped so it should bleed up and cover that, but
  if a residual band remains above the hero, also collapse that panel
  (`body:has(.pi-index) .content-panel:not(:has(.pi-index)){padding-block:0}`). To verify + finalize: wide
  Chrome + Firefox, both themes -- confirm balanced gutters, no ugly TOC wrap at 13/15rem (nudge up if so),
  50rem line length reads ~75 chars and comfortable (step down further only if it feels long), intro pages truly
  full-width AND hero flush to the top with no dark band, homepage/About unchanged (they do not load the
  theme-pass modules).
  Then move to DECISIONS. (Values updated 52->50 / 12,14->13,15 in a later tuning pass.)
- [ENG/INFRA] Post-deploy verification (PR #9 merged 2026-07-11, `dev` -> `main`): confirm the Cloudflare
  Pages production build for `main` went green and spot-check idanlab.dev (CSP enforced with no console
  violations, fonts load and cache from `/fonts/*`, no visual regressions from the layout rebalance). The
  enforced-CSP deploy, PR #5, and the writeup-structure migration are all done now (see DECISIONS
  2026-07-11 / 2026-07-06 / 2026-06-30).
- [CONTENT] Revisit `404.mdx`: owner made manual changes on 2026-06-28 and wants to review/refine it
  again on a later day.
- [ENG/INFRA] Domain rebrand: in-repo done (site=idanlab.dev, wordmark/titles, copy, robots Sitemap).
  Remaining (owner/other chats): Pages custom domain, 301 from idanstudio.click, Cloudflare email on
  @idanlab.dev, Search Console + sitemap resubmit, external link updates. Confirm
  `https://idanlab.dev/sitemap-index.xml` resolves after deploy.
- [CONTENT] Verify the ToggleAll few-pixel shift fix in real browsers (see Open bugs), then it can be
  considered closed.
- [ENG/DESIGN] WriteupMeta badge system (`src/components/badges/`) is now the metadata row on EVERY
  writeup, and the hand-authored `.machine-meta` row it replaced is gone from `src/content/docs` entirely
  (busqueda / return / forest earlier, then all 34 OverTheWire Bandit pages on 2026-07-19). The DESIGN is
  complete and documented (CORE_SPEC §6/§7 "Badge system"): real icon marks on a 14px grid, light-mode
  labels solved to WCAG AA in OKLCH, the Linux OS chip re-hued off OverTheWire's amber, accessibility clean.
  RESOLVED and recorded in DECISIONS: the palette reconciliation, the `Progressive` env colour, the
  placeholder-stub icons, the "renders on no page" status, and `difficulty` becoming optional so a
  progressive wargame need not invent a rating (DECISIONS 2026-07-19). RESOLVED 2026-07-20: the
  hand-placement question is settled the other way. WriteupMeta is now INJECTED from frontmatter by
  `plugins/remark-inject-writeupmeta.mjs`, with `platform` derived from the writeup's directory rather
  than authored, and all 37 writeups migrated. Validation was consolidated in the same pass (strict Zod
  enums in `content.config.ts`; the dormant WriteupMeta prop checks retired from the taxonomy guard).
  See DECISIONS 2026-07-20. Remaining:
  1. **Filter routes:** the chips render as non-interactive `<span>` until `/platform`, `/os`,
     `/environment` exist; restore the commented `<a>` and drop `data-astro-prefetch="false"` when they land.
     Same machinery as the `/principles` index. Engineering.
  (The "retire the dead badge taxonomy" item that sat here is DONE and moved to DECISIONS 2026-07-19,
  with a correction: only `.machine-meta` was dead. The `.meta-badge` / `.difficulty-*` / `.os-*` /
  `.platform-*` rules are still emitted by `WriteupCard` on the platform landing pages and were kept.)

- [CONTENT] Reuse `AttackPath` on the other multi-hop writeups. Live on TWO so far, both under `## Summary`:
  Forest (6 hops, 2026-07-19) and Return (5 hops, 2026-07-20; see the production-polish DECISIONS entry). It
  is data-driven, so adding one is authoring a `nodes[]` array, no component change. Good candidates are any
  chain with 3 or more hops. Deliberately NOT retrofitted onto single-hop writeups, where a two-node path
  says less than the prose already does. Note it is linear only: a writeup whose escalation genuinely branches
  needs a design decision first, not a quiet extension of this component. The component itself had a
  production-polish pass on 2026-07-20 (parallel connector-label rule, loaded-face-only weight step, 24px dot
  touch targets, plus the edge mask moved onto a gutter so it no longer softens the start / goal nodes;
  validated across both themes / phone-tablet-desktop / touch + keyboard / reduced-motion), followed by a
  production-readiness audit the same day that fixed eight more findings, including two real WCAG AA text
  failures (the future state's group opacity, and the active kind label on paper), a keyboard focus-loss bug
  at the end of the chain, and progress state not reaching assistive tech. It is considered signature-quality
  and stable, so further reuse is purely authoring new chains. One knob is left to taste:
  `--ap-fade-w` sets both the mask band and its gutter, so raising or lowering it is the single, safe way to
  make the edge fade stronger or weaker (endpoints stay clear at any value).

## Next (committed)
- [ENG/DESIGN] Unify the two marketing pages (home, about) under the `--focus-ring` token established for
  content pages (CORE_SPEC §6 "Focus ring system"; DECISIONS 2026-07-13). This is now the LAST gap in the
  token system: every content-page ring flows through `--focus-ring` (ToggleAll was the final holdout and
  landed 2026-07-17, see DECISIONS), so the marketing pages are the only place a ring color is still
  hardcoded. The token system is content-only by decision; this second step folds their inline
  `:focus-visible` rings (currently `outline: 2px solid var(--lime)` + per-card `outline-color:
  var(--accent)` from the 2026-07-13 focus-states work) into the same model: an inline
  `:root{--focus-ring:var(--lime)}` default + the shared `:where(...)` rule + `--focus-ring: var(--accent)`
  on the platform cards, in EACH page's `<style is:global>` (they do not load the theme-pass modules). Net: no ring
  color hardcoded anywhere. Keep both themes, `:focus-visible` only, no motion. Note the marketing pages
  have no Starlight `markdown.css` under them, so the orphaned-margin geometry bug fixed on content toggles
  (DECISIONS 2026-07-17) does not apply there.
- [CONTENT] Mass-import ~50 existing writeups via the pipeline (HTB / VulnHub / PicoCTF / OTW), each as a
  flat `.mdx` with images under the parallel `src/assets` tree (DECISIONS 2026-06-30). Once HTB
  Medium/Hard folders have content, uncomment those (lowercase) sidebar groups in `astro.config.mjs`.
- [ENG] `og:image` + social preview cards (per-page Open Graph) for shareable links.
- [CONTENT] Author `principle:` frontmatter on writeups to surface the coda (the auto-append mechanism,
  footer silence, and true italic face all shipped 2026-07-04, see DECISIONS). Migrate busqueda's body
  `<Principle>` to frontmatter (remove the inline component + import, add `principle:`).
- [PRODUCT] Global `/writeups` index (path 3): reuse `WriteupCard` with `showPlatform` true for a
  mixed cross-platform grid (the card was built for this).

## Later (parked)
- [CONTENT] Revisit a scripted content-cleaning pass only if manual polish proves to not scale; deliberately deferred, not abandoned.
- [CONTENT] Surface topic tags as a browsable index (filter writeups by technique). DEFERRED by decision,
  not abandoned: a canonical tag taxonomy is drafted and parked as a spelling reference, but tags stay out
  of frontmatter until writeup volume (~30 to 40) makes a filter earn its place. Below that a tag maps to
  one or two writeups and a filter returns a dead end, so it is pure invisible metadata for now. When it
  activates, tag emission + validation ride the import pipeline (see the content-taxonomy guard follow-up
  in this section) so there is no separate backfill.
- [ENG] Starlight plugins: scroll-to-top button, mobile sidebar swipe, fullscreen code blocks.
- [DESIGN] Replace `ethical-hacking.png` about portrait with a transparent custom SVG.
- [ENG] Extract repeated UI into reusable Astro components (cards, badges, buttons, hero FX).
- [ENG] CI on push: type-check, build, link-check, (later) visual-regression screenshots.
- [ENG] Content-taxonomy build guard (`plugins/remark-validate-content-taxonomy.mjs`) shipped as the
  astro-check alternative (DECISIONS 2026-07-12). Both original follow-ups are now CLOSED. The
  "narrow or remove the class families" half: only `machine-` was dead and it was removed 2026-07-19; the
  rest stay because `WriteupCard` still emits them (DECISIONS 2026-07-19). The "extend it to frontmatter"
  half: frontmatter metadata is now validated by strict Zod enums in `content.config.ts` instead, which is
  the better home for it (the remark stage does not see frontmatter cleanly, and Zod gives editor support),
  so the guard keeps its hand-authored-markup boundary and its WriteupMeta prop checks were retired
  (DECISIONS 2026-07-20). Only `tags` remains unvalidated, and it is deliberately unused for now.
- [CONTENT] Writeup `_template.mdx` so every new writeup starts consistent.
- [ENV] Change Windows username from Hebrew to English (new admin account).
- [ENG] Real platform-logo SVGs in sidebar via a Starlight Sidebar component override
  (alternative to the colored dots).
- [ENG] ToggleAll on mobile: currently desktop-only (hidden below the lg breakpoint). To put it inside
  the collapsed "On this page" dropdown would need a second override (`MobileTableOfContents`); deferred
  (owner judged the bulk control a poor fit for narrow screens; individual toggles still work on mobile).
- [DESIGN] Answer-callout (:::tip) accent color: tips currently render purple (the rocket-to-check icon
  swap on 2026-06-27 kept the inherited tip color). Experiment with a tip accent that better matches the
  overall theme (e.g. green/teal or a paper-harmonious hue), both themes, CSS-only via the Starlight aside
  color tokens. Owner wants to try options later.
- [DESIGN] Revisit the Active Directory topology glyph (low priority, no urgency). The diamond is not
  broken and ships as-is: it passes the silhouette test (its outline reads at 15px with the interior
  contributing nothing, which is exactly why it works). Parked only because Idan may want to move off it
  later, not because anything is wrong. Context for whoever picks it up, so the dead ends are not re-walked:
  - Concept A ("one node vs three linked nodes") is REJECTED, do not retry it. Two independently fatal
    reasons: three ~4px nodes fuse into a Λ letterform at 15px, and Active Directory and Standalone occupy
    the same scalar `environment` slot so they never co-occur, meaning a node-count contrast has no on-page
    reference to read against.
  - The design bar for any replacement: the silhouette carries the meaning, the interior does nothing (at
    15px, part-count is not a legible channel). Starting directions that fit the bar: folder-tree bracket,
    nested/concentric forms, hierarchy fork.
  - Standalone's ring stays regardless. It beat every candidate by resolving its hole at 15px and dodging
    the prospective PicoCTF two-disc collision. This item is AD only.
  - Any redraw inherits the current 15px hull-area grid (model B, cap 1.128) and, being a we-authored
    geometric glyph, should size by hull area rather than clamp. It also retires the Amido `<metadata>`
    attribution the diamond asset currently carries.

## Open bugs / known issues

- [DESIGN/A11y] **NEW 2026-07-26: the HackTheBox and VulnHub platform-index eyebrows fail WCAG AA on
  paper.** `.pi-eyebrow` is 12.8px/400, so it needs 4.5:1, and measured by canvas readback on the real
  element it reads **4.11:1 for HackTheBox (`#4d7c0f`)** and **4.16:1 for VulnHub (`#d12f2f`)**. PicoCTF
  passes at 4.86:1. This is the same defect the OverTheWire amber pass just fixed, in a different hue
  family, and it was found by that pass rather than by a separate audit. Each needs its own OKLCH solve
  (hold hue, drop lightness, gamut-map chroma) and its own ink token, following the `--otw-amber` /
  `--otw-amber-ink` model. Note the delivery constraint that made the amber fix awkward and will apply
  again: `.pi-eyebrow`'s colour comes from `PlatformIndex.astro`'s own scoped style via `--pf-accent`, so
  a layered rule cannot reach it; the OverTheWire fix needed an unlayered tail rule. Doing all three
  platforms at once would justify either a shared `--pf-accent-ink` token or a single tail rule keyed off
  `.pf-*`, which is tidier than three separate tail rules. Do NOT retint `--pf-accent` itself: it also
  feeds display type (`.pi-name`, `.pi-num`) that legitimately passes at the 3:1 large-text bar, plus
  around fifteen non-text uses. See DECISIONS 2026-07-26.

- [DESIGN/A11y] Non-badge `#a86f04` ambers unaudited for light-mode WCAG AA. **LARGELY RESOLVED 2026-07-26
  for the OverTheWire family** (DECISIONS): the shared token became the `--otw-amber` / `--otw-amber-ink`
  pair, so PasswordReveal's button text, its block-mode summary, the OverTheWire platform-index eyebrow and
  the sidebar rail ring are now one identity with an AA text variant, all measured (4.78 to 5.98:1 for text,
  3.21 and 3.50:1 for the non-text rings against a 3:1 bar). What remains of the original entry: nothing in
  the OverTheWire family. `.platform-overthewire` was already moot, and the Linux badge amber stays forked
  correctly (a different identity that merely shares a hex). Kept here only for the history below.
  The badge light palette pass
  (DECISIONS 2026-07-17) solved the OTW/Linux CHIP labels to AA and left the seven-way `#a86f04` collision
  forked (correctly: they are unrelated ambers). But the five NON-badge users of that hex were failing at
  2.97:1 on paper when the badges were, and nothing about their surfaces makes them pass. NARROWED
  2026-07-19: `.platform-overthewire` (the old machine-meta badge label) is now MOOT, since `.machine-meta`
  is gone from all content and that selector styles nothing (it goes away with the dead-taxonomy cleanup in
  Now). That leaves `.pf-overthewire` (platform-index accent) and PasswordReveal's button text as body-size
  text needing 4.5:1, plus the sidebar `nth-child(5)` focus ring and PasswordReveal's block-mode open border
  as non-text (3:1). NARROWED AGAIN 2026-07-25: the spoiler-toggle border is no longer a separate user. The
  class is retired and its border is now `.pwreveal-block` reading the SHARED amber, the same token as
  PasswordReveal's button text (DECISIONS 2026-07-25), so the two PasswordReveal entries are one fix.
  **CLOSED 2026-07-26:** that single fix was made, and it turned out to need a token PAIR rather than one
  re-solved value, because the same amber serves both body text (4.5:1) and borders and rings (3:1) and no
  single value clears both jobs on paper. `--otw-amber` keeps the identity for the non-text uses and
  `--otw-amber-ink` carries the AA text ink, solved in OKLCH by the recorded method (hold hue, drop
  lightness). Every user listed above is now measured and passing; the genuinely unrelated forks (the Linux
  badge amber) were left independent, as this entry always intended.
- [ENG] ToggleAll few-pixel shift: expand/collapse can leave a small reversible content offset in real
  Chromium (Chrome/Edge/Opera GX), from native scroll anchoring fighting the manual correction. Fix
  applied: suppress `overflow-anchor` for the operation, restored next frame (DECISIONS 2026-06-20). NOT
  reproducible in headless Chromium (false negative), so the fix is UNVERIFIED visually; owner to confirm
  in a real browser. If a sub-pixel residual remains, it is rounding territory, leave it.
- Known minor (low priority): few-pixel content shift on bulk expand/collapse (ToggleAll), traced to sub-pixel scroll rounding that scales with correction size; native-anchoring suppression reduced but did not eliminate it. Revisit by confirming overflow-anchor:none is on document.scrollingElement and instrumenting delta vs actual scrollY landing in a real browser.
- [DESIGN] Flag-gold targets the slug ids `#user-flag` / `#root-flag` as an interim (no `.flag-title`
  class exists; flag headings reuse `.task-title`). The TOC active-color ladder (DECISIONS 2026-06-29)
  also excludes flags by those same two slug ids so they stay gold instead of going cyan, so it shares the
  fragility. Breaks if those headings are renamed or another page reuses the slugs. Clean fix: add a
  `.flag-title` class to flag headings during authoring, used by both the gold rule and the cyan exclusion.
- [ENG] Command-highlighting residual risk: an OUTPUT line whose first word is exactly a listed command
  (e.g. `ls: cannot access`) can be mis-tagged. Rare; documented in `ec-priv-command.mjs` (EC 0.42
  exposes no token scopes, so strings/comments cannot be skipped by scope).
