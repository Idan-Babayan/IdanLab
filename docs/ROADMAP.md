# Idan.Lab — Roadmap

> Volatile by design. Groom this often. Format: **Now** (active), **Next** (committed,
> not started), **Later** (parked). Move items down to DECISIONS.md when resolved.
> Each item: `[area] description — owner-note`. Areas: DESIGN, CONTENT, ENG, PRODUCT.

## Now (in progress)
- [DESIGN/ENG] Three-column rebalance + full-width intro pages (custom.css): SHIPPED to production (commit
  `723c2ab`, PR #9 merged 2026-07-11) but STILL NEEDS A REAL-BROWSER FINE-TUNE. The rem values are
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
  full-width AND hero flush to the top with no dark band, homepage/About unchanged (they do not load custom.css).
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
  placeholder-stub icons, the "renders on no page" status, and the old rollout item 1 (WriteupMeta is
  HAND-PLACED under the title and it DOES replace `.machine-meta`; see DECISIONS 2026-07-19, which also made
  `difficulty` optional so a progressive wargame need not invent a rating). Remaining:
  1. **Filter routes:** the chips render as non-interactive `<span>` until `/platform`, `/os`,
     `/environment` exist; restore the commented `<a>` and drop `data-astro-prefetch="false"` when they land.
     Same machinery as the `/principles` index. Engineering.
  (The "retire the dead badge taxonomy" item that sat here is DONE and moved to DECISIONS 2026-07-19,
  with a correction: only `.machine-meta` was dead. The `.meta-badge` / `.difficulty-*` / `.os-*` /
  `.platform-*` rules are still emitted by `WriteupCard` on the platform landing pages and were kept.)

- [CONTENT] Reuse `AttackPath` on the other multi-hop writeups (shipped 2026-07-19 on Forest, under
  Summary; see DECISIONS). It is data-driven, so adding one is authoring a `nodes[]` array, no component
  change. Good candidates are any chain with 3 or more hops. Deliberately NOT retrofitted onto single-hop
  writeups, where a two-node path says less than the prose already does. Note it is linear only: a writeup
  whose escalation genuinely branches needs a design decision first, not a quiet extension of this component.

## Next (committed)
- [ENG/DESIGN] Unify the two marketing pages (home, about) under the `--focus-ring` token established for
  content pages (CORE_SPEC §6 "Focus ring system"; DECISIONS 2026-07-13). This is now the LAST gap in the
  token system: every content-page ring flows through `--focus-ring` (ToggleAll was the final holdout and
  landed 2026-07-17, see DECISIONS), so the marketing pages are the only place a ring color is still
  hardcoded. The token system is content-only by decision; this second step folds their inline
  `:focus-visible` rings (currently `outline: 2px solid var(--lime)` + per-card `outline-color:
  var(--accent)` from the 2026-07-13 focus-states work) into the same model: an inline
  `:root{--focus-ring:var(--lime)}` default + the shared `:where(...)` rule + `--focus-ring: var(--accent)`
  on the platform cards, in EACH page's `<style is:global>` (they do not load custom.css). Net: no ring
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
- [CONTENT/ENG] Promote `os` to a typed frontmatter enum (Linux | Windows, matching the `WriteupMeta` OS
  axis) and tighten the content-collection schema from a loose string to a two-value enum. Unlike tags this
  is a closed dimension, not a browsable tag, and it is cheap and renders today: it lights up the OS chip on
  the writeup cards via `WriteupCard`'s existing `os` read. Reconcile the value casing across the
  `WriteupCard` and `WriteupMeta` consumers when wiring it. Best folded into the mass-import pass so every
  imported writeup carries it, then backfill the existing few. Owner/ENG for the schema, CONTENT for the values.
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
  astro-check alternative (DECISIONS 2026-07-12). Remaining follow-up: extend it to frontmatter `os`/`tags`,
  which is now worth doing because `os:` IS in frontmatter on busqueda / return / forest and is a committed
  Next item (a bad value there currently fails silently, since the guard does not see frontmatter). The
  "narrow or remove the class families" half is CLOSED: only `machine-` was dead and it was removed
  2026-07-19; the rest stay because `WriteupCard` still emits them (see DECISIONS 2026-07-19).
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

## Open bugs / known issues
- [DESIGN/A11y] Non-badge `#a86f04` ambers unaudited for light-mode WCAG AA. The badge light palette pass
  (DECISIONS 2026-07-17) solved the OTW/Linux CHIP labels to AA and left the seven-way `#a86f04` collision
  forked (correctly: they are unrelated ambers). But the five NON-badge users of that hex were failing at
  2.97:1 on paper when the badges were, and nothing about their surfaces makes them pass. NARROWED
  2026-07-19: `.platform-overthewire` (the old machine-meta badge label) is now MOOT, since `.machine-meta`
  is gone from all content and that selector styles nothing (it goes away with the dead-taxonomy cleanup in
  Now). That leaves `.pf-overthewire` (platform-index accent) and PasswordReveal's button text as body-size
  text needing 4.5:1, plus the sidebar `nth-child(5)` focus ring and the spoiler-toggle border as non-text
  (3:1). Audit each on light and solve the text ones in OKLCH the same way (hold hue, drop
  lightness), leaving the forks independent. Small, self-contained, after the glyph pass.
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
