# Idan.Lab — Roadmap

> Volatile by design. Groom this often. Format: **Now** (active), **Next** (committed,
> not started), **Later** (parked). Move items down to DECISIONS.md when resolved.
> Each item: `[area] description — owner-note`. Areas: DESIGN, CONTENT, ENG, PRODUCT.

## Now (in progress)
- [ENG] PR #3 (`dev` -> `main`): READY for review, OPEN, ~16 commits ahead of `main`. Merging deploys to
  production (idanlab.dev via Cloudflare Pages on push to `main`), so it is the owner's call. The whole
  working tree is committed + pushed to `dev`; nothing is uncommitted. Carries (this session): platform-
  index duotone, OKLCH command palette, favicon fix, icon callouts, busquedav2 restructure, ToggleAll
  sidebar control + scroll fix, flag-gold loot system, homepage Reflection violet, plus the earlier
  easter-egg trail, light art-direction, robots.txt, sidebar polish, domain rebrand.
- [ENG/INFRA] Domain rebrand: in-repo done (site=idanlab.dev, wordmark/titles, copy, robots Sitemap).
  Remaining (owner/other chats): Pages custom domain, 301 from idanstudio.click, Cloudflare email on
  @idanlab.dev, Search Console + sitemap resubmit, external link updates. Confirm
  `https://idanlab.dev/sitemap-index.xml` resolves after deploy.
- [CONTENT] Verify the ToggleAll few-pixel shift fix in real browsers (see Open bugs), then it can be
  considered closed.

## Next (committed)
- [CONTENT] Finish or remove `busquedav2.mdx` (a design demo with a duplicate "Busqueda" title)
  before mass import; it exists only to dial in the card/index design.
- [CONTENT] Mass-import ~50 existing writeups via the pipeline (HTB / VulnHub / PicoCTF / OTW).
  Once HTB Medium/Hard folders have content, uncomment those sidebar groups in `astro.config.mjs`.
- [ENG] `og:image` + social preview cards (per-page Open Graph) for shareable links.
- [PRODUCT] Global `/writeups` index (path 3): reuse `WriteupCard` with `showPlatform` true for a
  mixed cross-platform grid (the card was built for this).
- [CONTENT] Pipeline (`notion_cleaner.py`) hooks for content-lane dependencies: emit a `.flag-title`
  class on flag headings (flag-gold currently targets slug ids `#user-flag`/`#root-flag` as an interim),
  wrap `:::tip[Answer]` in a `<Toggle flag>` spoiler reveal, and optionally promote os/tags to frontmatter.

## Later (parked)
- [CONTENT] Surface topic tags as a browsable index (filter writeups by technique).
- [ENG] Starlight plugins: scroll-to-top button, mobile sidebar swipe, fullscreen code blocks.
- [ENG] Self-host Syne + JetBrains Mono (drop Google Fonts dependency; faster, private).
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
- [DESIGN] Optional flag Root-vs-User hierarchy (Root as the bigger prize, e.g. crown icon or richer
  gold), once the pipeline emits distinct hooks so all three flag states (heading, toggle, TOC) stay in
  sync; not feasible cleanly CSS-only today (toggle icon is content-lane).

## Open bugs / known issues
- [ENG] ToggleAll few-pixel shift: expand/collapse can leave a small reversible content offset in real
  Chromium (Chrome/Edge/Opera GX), from native scroll anchoring fighting the manual correction. Fix
  applied: suppress `overflow-anchor` for the operation, restored next frame (DECISIONS 2026-06-20). NOT
  reproducible in headless Chromium (false negative), so the fix is UNVERIFIED visually; owner to confirm
  in a real browser. If a sub-pixel residual remains, it is rounding territory, leave it.
- [INFRA] `public/robots.txt` holds ONLY the breadcrumb comment + a `Sitemap:` line. On deploy it is
  served as `/robots.txt` and can override the Cloudflare-managed bot disallows / Content-Signals.
  Add the full managed content (or confirm Cloudflare still appends its block) before relying on it.
- [CONTENT] `busquedav2.mdx` shares the frontmatter title "Busqueda" with `busqueda.mdx`, so both cards
  read "Busqueda" on the HTB index. It is the live design testbed (icon callouts, flag-gold, ToggleAll,
  Title Case headers, Kali prompts, no line highlights). Disambiguate or remove before mass import.
- [DESIGN] Flag-gold targets the slug ids `#user-flag` / `#root-flag` as an interim (no `.flag-title`
  class exists; flag headings reuse `.task-title`). Breaks if those headings are renamed or another page
  reuses the slugs. Clean fix: a `.flag-title` class from the pipeline (see Next).
- [ENG] Command-highlighting residual risk: an OUTPUT line whose first word is exactly a listed command
  (e.g. `ls: cannot access`) can be mis-tagged. Rare; documented in `ec-priv-command.mjs` (EC 0.42
  exposes no token scopes, so strings/comments cannot be skipped by scope).
- [ENG] `notion_cleaner.py` is documented (CORE_SPEC §7) but NOT committed to the repo.
