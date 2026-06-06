# Idan.Lab — Roadmap

> Volatile by design. Groom this often. Format: **Now** (active), **Next** (committed,
> not started), **Later** (parked). Move items down to DECISIONS.md when resolved.
> Each item: `[area] description — owner-note`. Areas: DESIGN, CONTENT, ENG, PRODUCT.

## Now (in progress)
- [ENG] Domain rebrand idanstudio.click -> idanlab.dev. In-repo renames done. Remaining:
  Pages custom domain, 301 from old domain, Cloudflare email on @idanlab.dev, Search Console
  + sitemap resubmit, external link updates.
- [ENG/DESIGN] Deploy the writeup theme pass; verify sidebar colored dots align on the real
  Starlight build (screenshot check). Adjust `nth-child` selectors if needed.
- [CONTENT] Add flag/answer **spoiler toggle** to `notion_cleaner.py` so `:::tip[Answer]`
  becomes collapsible (no accidental spoilers). Applies to all future writeups; re-run on existing.

## Next (committed)
- [CONTENT] Mass-import ~50 existing writeups via the pipeline (HTB / VulnHub / PicoCTF / OTW).
  Once HTB medium/hard folders have content, uncomment those sidebar groups.
- [ENG] `og:image` + social preview cards (per-page Open Graph) for shareable links.
- [DESIGN] Verify the faint top-glow renders on real Starlight container backgrounds.

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
