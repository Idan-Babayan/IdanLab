# Idan.Lab — Roadmap

> Volatile by design. Groom this often. Format: **Now** (active), **Next** (committed,
> not started), **Later** (parked). Move items down to DECISIONS.md when resolved.
> Each item: `[area] description — owner-note`. Areas: DESIGN, CONTENT, ENG, PRODUCT.

## Now (in progress)
- [ENG] Commit the uncommitted working-tree changes on `dev`: the platform-index cyan duotone
  (`PlatformIndex.astro`, `WriteupCard.astro`) and the command-highlighting categories
  (`src/lib/ec-priv-command.mjs`), plus their `custom.css` edits. Both verified, build passes; then push.
- [ENG] PR #3 (`dev` -> `main`, DRAFT): mark ready + merge to deploy. Carries platform index,
  busquedav2, easter-egg trail, light polish + art-direction, robots.txt, sidebar (`dev` is 6
  commits ahead of `main`). The two uncommitted items above are NOT in the PR yet.
- [ENG/INFRA] Domain rebrand: in-repo done (site=idanlab.dev, wordmark/titles, copy, robots Sitemap).
  Remaining (owner/other chats): Pages custom domain, 301 from idanstudio.click, Cloudflare email on
  @idanlab.dev, Search Console + sitemap resubmit, external link updates. Confirm
  `https://idanlab.dev/sitemap-index.xml` resolves after deploy.
- [CONTENT] Add flag/answer **spoiler toggle** to `notion_cleaner.py` so `:::tip[Answer]`
  becomes collapsible (no accidental spoilers). Applies to all future writeups; re-run on existing.

## Next (committed)
- [CONTENT] Finish or remove `busquedav2.mdx` (a design demo with a duplicate "Busqueda" title)
  before mass import; it exists only to dial in the card/index design.
- [CONTENT] Mass-import ~50 existing writeups via the pipeline (HTB / VulnHub / PicoCTF / OTW).
  Once HTB Medium/Hard folders have content, uncomment those sidebar groups in `astro.config.mjs`.
- [ENG] `og:image` + social preview cards (per-page Open Graph) for shareable links.
- [PRODUCT] Global `/writeups` index (path 3): reuse `WriteupCard` with `showPlatform` true for a
  mixed cross-platform grid (the card was built for this).

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

## Open bugs / known issues
- [ENG] **Uncommitted work on `dev`** (working tree): platform-index duotone + command-highlighting
  categories. Files: `src/components/PlatformIndex.astro`, `src/components/WriteupCard.astro`,
  `src/lib/ec-priv-command.mjs`, `src/styles/custom.css`. Verified live (both themes) and
  `npm run build` passes, but NOT committed or pushed: will be lost if the working tree is discarded.
- [INFRA] `public/robots.txt` holds ONLY the breadcrumb comment + a `Sitemap:` line. On deploy it is
  served as `/robots.txt` and can override the Cloudflare-managed bot disallows / Content-Signals.
  Add the full managed content (or confirm Cloudflare still appends its block) before relying on it.
- [CONTENT] `busquedav2.mdx` shares the frontmatter title "Busqueda" with `busqueda.mdx`, so both
  cards read "Busqueda" on the HTB index. Disambiguate or remove (it is a demo).
- [ENG] Command-highlighting residual risk: an OUTPUT line whose first word is exactly a listed
  command (e.g. `ls: cannot access`) can be mis-tagged. Rare; documented in `ec-priv-command.mjs`
  (EC 0.42 exposes no token scopes, so strings/comments cannot be skipped by scope).
- [ENG] `notion_cleaner.py` is documented (CORE_SPEC §7) but NOT committed to the repo.
- [DESIGN] Unused `--tp-deco-magenta` token left in `custom.css` after the rejected risograph title
  effect. Harmless; remove when convenient.
