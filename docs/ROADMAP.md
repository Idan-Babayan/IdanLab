# Idan.Lab — Roadmap

> Volatile by design. Groom this often. Format: **Now** (active), **Next** (committed,
> not started), **Later** (parked). Move items down to DECISIONS.md when resolved.
> Each item: `[area] description — owner-note`. Areas: DESIGN, CONTENT, ENG, PRODUCT.

## Now (in progress)
- [ENG] PR #5 (`dev` -> `main`): OPEN, MERGEABLE. Merging deploys to production (idanlab.dev via
  Cloudflare Pages on push to `main`), so it is the owner's call. Carries: the FlagCapture "Decrypt to
  Capture" flag component, a fine-tune pass over the OverTheWire Bandit writeups, 404.mdx tweaks, and
  (committed `c59be70`) the inline-code chip system + TOC active-color ladder + code/toggle polish. (PR
  #3 and PR #4 already merged.)
- [ENG] Writeup-structure migration is complete LOCALLY but UNCOMMITTED (not yet in PR #5): writeups are
  flat `.mdx` under lowercase `hackthebox/easy/` (busqueda + return), screenshots moved to `src/assets`
  with relative `../` refs (astro:assets), `astro.config.mjs` autogenerate restored to `hackthebox/easy`,
  and `plugins/rehype-content-image-loading.mjs` lazy-loads content images. Build verified (hashed images
  under `_astro`); the busqueda case-rename is staged via `git mv`. Needs commit + push. See DECISIONS
  2026-06-30.
- [CONTENT] Apply PasswordReveal (NOT FlagCapture, see DECISIONS 2026-07-05) to the Bandit "Reveal
  Password" toggles across all 34 pages, replacing `<Toggle class="spoiler-toggle">`: component +
  styling shipped 2026-07-05 (amber waypoint identity, blur-to-reveal then copy-in-place, non-selectable
  value, copy-only). Now wired into `overthewire/bandit/0-1.mdx` alongside the existing spoiler-toggle
  (not yet removed); remove the redundant toggle there once confirmed, then roll out to the remaining 33
  pages. As of the remark auto-import plugin (DECISIONS 2026-07-05), rollout only needs the
  `<PasswordReveal password="..." />` tag per page, no import line. Keep the truncation rule for any PEM
  (DECISIONS 2026-06-26).
- [CONTENT] Revisit `404.mdx`: owner made manual changes on 2026-06-28 and wants to review/refine it
  again on a later day.
- [ENG/INFRA] Domain rebrand: in-repo done (site=idanlab.dev, wordmark/titles, copy, robots Sitemap).
  Remaining (owner/other chats): Pages custom domain, 301 from idanstudio.click, Cloudflare email on
  @idanlab.dev, Search Console + sitemap resubmit, external link updates. Confirm
  `https://idanlab.dev/sitemap-index.xml` resolves after deploy.
- [CONTENT] Verify the ToggleAll few-pixel shift fix in real browsers (see Open bugs), then it can be
  considered closed.

## Next (committed)
- [CONTENT] Mass-import ~50 existing writeups via the pipeline (HTB / VulnHub / PicoCTF / OTW), each as a
  flat `.mdx` with images under the parallel `src/assets` tree (DECISIONS 2026-06-30). Once HTB
  Medium/Hard folders have content, uncomment those (lowercase) sidebar groups in `astro.config.mjs`.
- [ENG] `og:image` + social preview cards (per-page Open Graph) for shareable links.
- [CONTENT] Author `principle:` frontmatter on writeups to surface the coda (the auto-append mechanism,
  footer silence, and true italic face all shipped 2026-07-04, see DECISIONS). Migrate busqueda's body
  `<Principle>` to frontmatter (remove the inline component + import, add `principle:`), and have
  `notion_cleaner.py` emit `principle:` so codas flow through the pipeline.
- [PRODUCT] Global `/writeups` index (path 3): reuse `WriteupCard` with `showPlatform` true for a
  mixed cross-platform grid (the card was built for this).
- [CONTENT] Pipeline (`notion_cleaner.py`) hooks for content-lane dependencies: emit a `.flag-title`
  class on flag headings (flag-gold currently targets slug ids `#user-flag`/`#root-flag` as an interim),
  emit the gold heading + `<FlagCapture type="..." flag="..." />` for User/Root flags (replacing the old
  heading + duplicate `<Toggle flag>` + `:::tip`; see CORE_SPEC §7 + DECISIONS 2026-06-27), emit
  `<PasswordReveal password="..." />` for wargame password levels (replacing
  `<Toggle class="spoiler-toggle">`; see DECISIONS 2026-07-05) with no accompanying import line needed
  (auto-injected, see DECISIONS 2026-07-05 remark-plugin entry), and optionally promote os/tags to
  frontmatter.

## Later (parked)
- [CONTENT] Surface topic tags as a browsable index (filter writeups by technique).
- [ENG] Starlight plugins: scroll-to-top button, mobile sidebar swipe, fullscreen code blocks.
- [DESIGN] Replace `ethical-hacking.png` about portrait with a transparent custom SVG.
- [ENG] Extract repeated UI into reusable Astro components (cards, badges, buttons, hero FX).
- [ENG] CI on push: type-check, build, link-check, (later) visual-regression screenshots.
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
- [INFRA] `public/robots.txt` holds ONLY the breadcrumb comment + a `Sitemap:` line. On deploy it is
  served as `/robots.txt` and can override the Cloudflare-managed bot disallows / Content-Signals.
  Add the full managed content (or confirm Cloudflare still appends its block) before relying on it.
- [DESIGN] Flag-gold targets the slug ids `#user-flag` / `#root-flag` as an interim (no `.flag-title`
  class exists; flag headings reuse `.task-title`). The TOC active-color ladder (DECISIONS 2026-06-29)
  also excludes flags by those same two slug ids so they stay gold instead of going cyan, so it shares the
  fragility. Breaks if those headings are renamed or another page reuses the slugs. Clean fix: a
  `.flag-title` class from the pipeline (see Next), used by both the gold rule and the cyan exclusion.
- [ENG] Command-highlighting residual risk: an OUTPUT line whose first word is exactly a listed command
  (e.g. `ls: cannot access`) can be mis-tagged. Rare; documented in `ec-priv-command.mjs` (EC 0.42
  exposes no token scopes, so strings/comments cannot be skipped by scope).
- [ENG] `notion_cleaner.py` is documented (CORE_SPEC §7) but NOT committed to the repo.
