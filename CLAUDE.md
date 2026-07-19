# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Idan.Lab** — a personal cybersecurity lab notebook + portfolio ([idanlab.dev](https://idanlab.dev)). It hosts CTF writeups (HackTheBox, VulnHub, PicoCTF, OverTheWire) plus a recruiter-facing profile. Astro + Starlight, static (SSG), deployed on Cloudflare Pages. Content is the product; the design is deliberately high-effort ("Curiosity is my exploit").

### Source of truth — read `docs/` first

`docs/` is the canonical project memory. Read it before non-trivial changes:

- **`docs/CORE_SPEC.md`** — durable facts (infra, stack, architecture, conventions). If a chat conflicts with this file, the file wins.
- **`docs/DECISIONS.md`** — append-only decision log, **newest on top**. Add an entry whenever you make a durable technical/design decision.
- **`docs/ROADMAP.md`** — volatile Now / Next / Later work list. Groom it; move resolved items into DECISIONS.

These are far richer than this CLAUDE.md — treat them as primary.

## Commands

| Command | Action |
| --- | --- |
| `npm run dev` | Dev server at `localhost:4321` (alias: `npm start`) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the built site |
| `npm run astro -- <cmd>` | Astro CLI passthrough (e.g. `astro check`) |

- **No test runner or linter is configured.** `npm run build` is the validation gate — it fails on TypeScript errors (strict config) and on Starlight sidebar misconfiguration (see below). `npx astro check` does standalone type/content checking.
- **Never hand-bump dependency versions.** Packages are intentionally pinned at a known-good set; upgrade only from a stable checkpoint via `npx @astrojs/upgrade`. (See DECISIONS.)

## Architecture

### Two surfaces: "one bespoke page system, everything else Starlight"

The site mixes two page systems on purpose. Picking the wrong one is the easiest mistake here.

- **Marketing pages** — standalone `.astro` files in `src/pages/` (`index.astro` = `/`, `about.astro` = `/about`). These live **outside** Starlight: each is a full HTML document with its own `<head>`, an inline `<style is:global>` design-token block, and an inline `<script>` for the interactive FX. Full creative control; immersive hero.
- **Content pages** — everything in `src/content/docs/`: all writeups + the per-platform landing pages (`{platform}/index.mdx`). These are Starlight docs and keep sidebar, search, TOC, expressive-code, a11y, and the theme toggle for free. Collection is wired in `src/content.config.ts` (`docsLoader` + `docsSchema`).

**Route-collision rule (important):** a `src/pages/` route and a Starlight doc must not both claim the same URL. So `src/content/docs/index.mdx` / `about.mdx` must not coexist with `src/pages/index.astro` / `about.astro`.

Both surfaces are now migrated: `/` is owned by `src/pages/index.astro` and `/about` by `src/pages/about.astro`; the old `src/content/docs/index.mdx` and `about.mdx` have been deleted. When adding a new marketing page, delete any Starlight doc that would claim the same route (and vice versa).

### The "theme pass" (CSS-only)

Content pages are made to match the marketing pages purely by overriding Starlight design tokens + targeted rules in `src/styles/custom.css` (wired via `customCss` in `astro.config.mjs`). **Never fork or rebuild Starlight components** — the CSS layer must not touch Starlight's functionality. Reading content stays calm (no tilt / scroll-reveal on writeup bodies).

### Theming model

- Homepage is **dark-only** (identical everywhere).
- About + all writeups support **light/dark**, synced via Starlight's `localStorage['starlight-theme']` key and `data-theme` on `<html>`. About **defaults to dark**; an inline `<script is:inline>` in `about.astro` applies the stored choice before paint. This shared key is what makes the toggle persist between the custom About page and the Starlight docs.

### Design system & brand

- **Fonts:** Syne (display/headings) + JetBrains Mono (body, UI, and code), self-hosted as subset WOFF2 served from `/fonts/` (see `src/styles/fonts.css`), with metric-matched size-adjust fallbacks so the swap is shift-free. There is no Google Fonts origin in source (migrated 2026-07-04, see DECISIONS).
- **Tokens:** ink/lime/cyan/magenta on dark; warm paper + darkened accents on light. The `--ink/--lime/--cyan/--magenta/--display/--mono` token block is **duplicated** inside both `index.astro` and `about.astro` `<style is:global>` (extracting it is a ROADMAP item — keep them in sync if you edit one).
- **Marketing-page FX** (inline JS, all `prefers-reduced-motion`-aware): constellation canvas, text decode/scramble, count-up stats, 3D-tilt cards with cursor glare, magnetic buttons, IntersectionObserver scroll-reveal, click-to-copy email, film-grain + glow overlays.
- **Reading-progress bar** on Starlight pages is a vanilla-JS snippet injected via the `head` config in `astro.config.mjs`, styled by `#tp-progress` in `custom.css` — both files are involved.
- Code-block themes (`expressiveCode`): `github-dark-dimmed` (dark) / `catppuccin-latte` (light).
- **Platform palette (unified):** one canonical set everywhere (homepage cards, sidebar dots, about-page accents, and writeup badges): HTB lime, VulnHub red, PicoCTF purple, OTW amber. The old writeup-badge set (HTB blue, VulnHub cyan, Pico violet, OTW orange) is retired. Because HTB lime overlaps Easy green, every `.platform-*` badge carries a leading glow dot so it never reads as a difficulty pill. (See CORE_SPEC §6 / DECISIONS 2026-06-01.)

### Sidebar (`astro.config.mjs`)

Hand-curated; each category points at an `autogenerate.directory` relative to `src/content/docs/`. Sidebar markers are CSS-injected colored dots (not emojis).

- **Starlight throws a build error if an `autogenerate` directory does not exist.** That's why HTB Medium/Hard are commented out — create the folder with at least one writeup *before* enabling its sidebar entry.
- **Directory casing must match exactly.** Difficulty folders are lowercase (`easy`/`medium`/`hard`) and each sidebar `autogenerate.directory` must use that exact casing. Starlight matches the directory against collection entry ids case-sensitively, so pointing at `hackthebox/Easy` would silently drop writeups in `hackthebox/easy/` (the page still builds and is reachable by URL, it just never appears in the sidebar). Windows hides this by resolving the path case-insensitively; a Linux/Cloudflare build fails harder, and a case-only folder rename needs `git mv` (`core.ignorecase=true`). (This bit once: busqueda.mdx vanished from the sidebar until the casing matched; the tree was later migrated from `Easy` to lowercase `easy`.)

### Path alias

`@components` → `src/components`. The **functional** alias is the Vite one in `astro.config.mjs` (`vite.resolve.alias`); it is required for MDX `import` statements to resolve. The matching `tsconfig.json` `paths` entry only satisfies the editor/TypeScript and does **not** affect the build — tsconfig path aliases don't resolve for Vite/MDX.

## Writeups

Writeups are flat `.mdx` files under `src/content/docs/<platform>/<difficulty>/<slug>.mdx` (e.g. `hackthebox/easy/busqueda.mdx`), one file per writeup with no per-writeup folder. Every writeup follows the same methodology loop: **Recon → Foothold → Escalation → Reflection**, documenting the actual thought process and dead ends, not just commands.

Conventions (see `busqueda.mdx` as the reference and `CORE_SPEC.md` §7):

- **Frontmatter is `title` + `description`** (plus optional `os`, `tags`, `principle`). The in-page metadata row is the `WriteupMeta` component, placed under the title and followed by the description repeated as a `>` blockquote lead: `import WriteupMeta from '@components/badges/WriteupMeta.astro'`, then `<WriteupMeta platform="..." os="..." environment="..." difficulty="..." />`. All four props are typed unions, so match the casing exactly (`OverTheWire`, `Linux`, `Progressive`). `difficulty` is the only optional one: omit it for progressive wargames (OverTheWire Bandit), which have no rating, and its chip is then not rendered. This replaced the old hand-authored `<div class="machine-meta">` badge row, which is gone from every writeup (see DECISIONS 2026-07-19).
- Import the toggle: `import Toggle from '@components/Toggle.astro'`. `Toggle.astro` is a `<details>` wrapper whose `label` accepts an HTML string; code fences inside its slot are fully highlighted.
- **Writeup images live in `src/assets`** (parallel tree `src/assets/<platform>/<difficulty>/<slug>/...`), referenced from the `.mdx` by a relative Markdown path (`../../../../assets/...`, four `../` from a difficulty-tier writeup) so `astro:assets` optimizes and hashes them (served under `/_astro`). Use plain Markdown image syntax, not `<Image />`. Site-wide click-to-zoom is still provided by the `starlight-image-zoom` plugin (use `data-zoom-off` to opt an image out, e.g. logos).
- Code blocks use `frame="code"` + a language `title` so bash/python render identically. Bold inside a code fence is impossible — use expressive-code line highlighting (e.g. ```` ```bash {3} ````) to emphasize a line.
- Flag answers / spoilers go in `:::tip[Answer]` admonitions (often wrapped in a `<Toggle>`). Inline code renders red; `<span class="port-label">` for ports, `<span class="task-title">` for task headings.

### Content pipeline (Notion → MDX)

The authoring flow is: write in Notion, export Markdown, then polish it by hand into convention-compliant MDX (the badges, toggles, `frame="code"`, the `src/assets` relative image paths, and `:::tip` conversions above). The content pipeline is deliberate manual editorial polish against a Notion template, not a text-transformation script: the gap between a raw Notion export and the intended finished writeup is an editorial-judgment problem no script resolves. (A Python cleaner, `notion_cleaner.py`, was previously planned but is retired and was never committed; see `CORE_SPEC.md` §7 and DECISIONS.) These conventions are the source of truth.

## Conventions & deployment

- **No em dashes in any site copy** — hard rule (the owner reads them as an AI tell). Use commas, colons, or parentheses.
- TypeScript in `.astro` `<script>` blocks uses explicit assertions (`as HTMLElement | null`, `!`, `?? ''`) to keep a clean type-check; match that style.
- Real name is fine on the public site.
- **Domain:** the canonical domain is **`idanlab.dev`** (moved from `idanstudio.click`, 2026-06-06; old domain kept as a 301 redirect, then retired). See DECISIONS.
- **Deployment:** Cloudflare Pages auto-deploys on push to **`main`** (also at `idanlab.pages.dev`). Build `npm run build`, output `dist/` (gitignored).

## Git policy
- Never run `git commit` or `git push` unless I explicitly ask. Edit locally; I commit myself.
- Only use main and dev branches. No others.
- Never create/rename branches unless I explicitly ask.
- Never create PRs unless I explicitly ask.
- Never commit, push, or run git commands unless I explicitly ask.
- Never add “Co-Authored-By: Claude” or modify commit authors.
- Never rewrite git history (rebase, amend, force push) unless I explicitly request it.
- If a task involves git, ask before doing anything.

## My rules
- NO em dashes in any copy (use commas, colons, or parentheses).
- Don't upgrade dependencies unless I ask (versions are pinned).
- Marketing pages (src/pages/*.astro) are standalone and dark-only. Writeups are Starlight,
  themed via src/styles/custom.css only. Never rebuild Starlight.
- Treat docs/CORE_SPEC.md as the source of truth once it's committed.