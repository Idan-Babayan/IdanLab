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
- [ENG/DESIGN] WriteupMeta badge system (`src/components/badges/`, DECISIONS 2026-07-10, revised same day
  to intentional per-axis color + restrained glow) is SHIPPED to production (commits `7fa5d82` + docs
  `02e8bab`, PR #9 merged 2026-07-11) but renders on NO page yet; two calls remain before it goes on real
  writeups. RESOLVED earlier: the platform palette now uses the canonical `--pf-accent` hexes verbatim (no
  drift), and the missing `Progressive` env color is set (teal `#3fd9a8`/`#0f8a63`).
  Remaining:
  1. **Icon marks:** `badges/icons.ts` ships placeholder-stub SVGs; Idan swaps in the real 24x24
     `currentColor` platform/OS/environment marks (full-color hue comes from the `.wm-ico { color: var(--wm-c) }`
     rule). The `Progressive` glyph is the placeholder steps mark (thematically a ladder, but on the same
     swap list).
  2. **Auto-injection vs manual:** decide with Engineering whether WriteupMeta is hand-placed under each
     title or injected (and whether it replaces the current `.machine-meta` badge row; note WriteupMeta's
     hue-free growing pips are a SECOND difficulty encoding vs the traffic-light `.difficulty-*` badge).
     The filter routes the chips link to (`/platform`, `/os`, `/environment`) do not exist yet; remove the
     chips' `data-astro-prefetch="false"` when they land.
- Wire WriteupMeta into the writeup and wargame-level pages (rollout: auto-inject vs manual).
  It currently renders on no page. Content/Product.
- Build the /platform, /os, /environment filter/aggregation routes the nav chips link to, and
  remove the temporary data-astro-prefetch="false" from the chips once they exist. Same
  machinery as the /principles index. Engineering.

## Next (committed)
- [ENG] Fold `ToggleAll.astro`'s hardcoded cyan focus ring into `--focus-ring` (DECISIONS 2026-07-13). It is
  the one element still bypassing the token: its scoped style carries
  `.toggle-all:focus-visible { outline: 2px solid color-mix(in oklab, var(--pf-accent-2) 60%, transparent) }`.
  The convention lists ToggleAll as a non-identity control that should ring the lime default, so dropping the
  bespoke outline (KEEPING its cyan hover/focus color + border + background state, which is its hover design)
  would let it inherit lime. Decide first whether the cyan ring was deliberate; if it was, record that instead
  and leave it.
- [ENG/DESIGN] Unify the two marketing pages (home, about) under the `--focus-ring` token established for
  content pages (DECISIONS 2026-07-13). The token system is content-only by decision; this second step
  folds the marketing pages' inline `:focus-visible` rings (currently `outline: 2px solid var(--lime)` +
  per-card `outline-color: var(--accent)` from the 2026-07-13 focus-states work) into the same model:
  an inline `:root{--focus-ring:var(--lime)}` default + the shared `:where(...)` rule + `--focus-ring:
  var(--accent)` on the platform cards, in EACH page's `<style is:global>` (they do not load custom.css).
  Net: no ring color hardcoded anywhere. Keep both themes, `:focus-visible` only, no motion.
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
- [CONTENT] Surface topic tags as a browsable index (filter writeups by technique).
- [ENG] Starlight plugins: scroll-to-top button, mobile sidebar swipe, fullscreen code blocks.
- [DESIGN] Replace `ethical-hacking.png` about portrait with a transparent custom SVG.
- [ENG] Extract repeated UI into reusable Astro components (cards, badges, buttons, hero FX).
- [ENG] CI on push: type-check, build, link-check, (later) visual-regression screenshots.
- [ENG] Content-taxonomy build guard (`plugins/remark-validate-content-taxonomy.mjs`) shipped as the
  astro-check alternative (DECISIONS 2026-07-12). Follow-ups: extend it to frontmatter `os`/`tags` if the
  pipeline ever promotes those to frontmatter, and narrow or remove the `meta-badge` / `platform-` /
  `difficulty-` / `os-` / `machine-` class families when WriteupMeta retires the `.machine-meta` badge row.
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
