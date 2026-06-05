# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Idan.Lab** — a personal cybersecurity lab notebook + portfolio ([idanstudio.click](https://idanstudio.click)). It hosts CTF writeups (HackTheBox, VulnHub, PicoCTF, OverTheWire) plus a recruiter-facing profile. Astro + Starlight, static (SSG), deployed on Cloudflare Pages. Content is the product; the design is deliberately high-effort ("Curiosity is my exploit").

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

- **Fonts:** Syne (display/headings) + JetBrains Mono (body, UI, and code), loaded from Google Fonts via `<link>`s (in the Starlight `head` config for docs; in each marketing page's `<head>`).
- **Tokens:** ink/lime/cyan/magenta on dark; warm paper + darkened accents on light. The `--ink/--lime/--cyan/--magenta/--display/--mono` token block is **duplicated** inside both `index.astro` and `about.astro` `<style is:global>` (extracting it is a ROADMAP item — keep them in sync if you edit one).
- **Marketing-page FX** (inline JS, all `prefers-reduced-motion`-aware): constellation canvas, text decode/scramble, count-up stats, 3D-tilt cards with cursor glare, magnetic buttons, IntersectionObserver scroll-reveal, click-to-copy email, film-grain + glow overlays.
- **Reading-progress bar** on Starlight pages is a vanilla-JS snippet injected via the `head` config in `astro.config.mjs`, styled by `#tp-progress` in `custom.css` — both files are involved.
- Code-block themes (`expressiveCode`): `github-dark-dimmed` (dark) / `catppuccin-latte` (light).
- ⚠️ **Known inconsistency** (tracked in ROADMAP): two platform color schemes coexist — homepage cards/sidebar dots (HTB lime, VulnHub red, Pico purple, OTW amber) vs. writeup badges (HTB blue, VulnHub cyan, Pico violet, OTW orange). Pick the canonical set before adding platform-colored UI.

### Sidebar (`astro.config.mjs`)

Hand-curated; each category points at an `autogenerate.directory` relative to `src/content/docs/`. Sidebar markers are CSS-injected colored dots (not emojis).

- **Starlight throws a build error if an `autogenerate` directory does not exist.** That's why HTB Medium/Hard are commented out — create the folder with at least one writeup *before* enabling its sidebar entry.
- **Directory casing must match exactly.** Difficulty folders are Capitalized (`Easy`/`Medium`/`Hard`) and each sidebar `autogenerate.directory` must use that exact casing. Starlight matches the directory against collection entry ids case-sensitively, so pointing at `hackthebox/easy` silently drops writeups in `hackthebox/Easy/` — the page still builds and is reachable by URL, it just never appears in the sidebar. Windows hides this by resolving the path case-insensitively; a Linux/Cloudflare build fails harder. (This bit once: busqueda.mdx vanished from the sidebar until config was fixed to `hackthebox/Easy`.)

### Path alias

`@components` → `src/components`. The **functional** alias is the Vite one in `astro.config.mjs` (`vite.resolve.alias`); it is required for MDX `import` statements to resolve. The matching `tsconfig.json` `paths` entry only satisfies the editor/TypeScript and does **not** affect the build — tsconfig path aliases don't resolve for Vite/MDX.

## Writeups

Writeups are `.mdx` under `src/content/docs/<platform>/<difficulty>/<slug>.mdx` (e.g. `hackthebox/Easy/busqueda.mdx`). Every writeup follows the same methodology loop: **Recon → Foothold → Escalation → Reflection**, documenting the actual thought process and dead ends, not just commands.

Conventions (see `busqueda.mdx` as the reference and `CORE_SPEC.md` §7):

- **Frontmatter is just `title` + `description`.** Machine metadata is *not* frontmatter — it's a `<div class="machine-meta">` of badge spans (`meta-badge platform-* / difficulty-* / os-*`) near the top, followed by the description repeated as a `>` blockquote lead.
- Import the toggle: `import Toggle from '@components/Toggle.astro'`. `Toggle.astro` is a `<details>` wrapper whose `label` accepts an HTML string; code fences inside its slot are fully highlighted.
- **Image paths must be absolute** (`/images/<platform>/<difficulty>/<slug>/...`); relative paths fail as MDX imports. Screenshots live under `public/images/...`. Site-wide click-to-zoom is provided by the `starlight-image-zoom` plugin (use `data-zoom-off` to opt an image out, e.g. logos).
- Code blocks use `frame="code"` + a language `title` so bash/python render identically. Bold inside a code fence is impossible — use expressive-code line highlighting (e.g. ```` ```bash {3} ````) to emphasize a line.
- Flag answers / spoilers go in `:::tip[Answer]` admonitions (often wrapped in a `<Toggle>`). Inline code renders red; `<span class="port-label">` for ports, `<span class="task-title">` for task headings.

### Content pipeline (Notion → MDX)

The intended authoring flow is: write in Notion → export Markdown → run **`notion_cleaner.py`** to normalize into convention-compliant MDX (it enforces the badges, toggles, `frame="code"`, absolute image paths, and `:::tip` conversions above). **Note:** this script is documented in `CORE_SPEC.md` §7 but is **not currently committed** to this repo. The conventions it produces are the source of truth even when authoring by hand.

## Conventions & deployment

- **No em dashes in any site copy** — hard rule (the owner reads them as an AI tell). Use commas, colons, or parentheses.
- TypeScript in `.astro` `<script>` blocks uses explicit assertions (`as HTMLElement | null`, `!`, `?? ''`) to keep a clean type-check; match that style.
- Real name is fine on the public site.
- **Deployment:** Cloudflare Pages auto-deploys on push to **`main`** (also at `idanstudio.pages.dev`). Build `npm run build`, output `dist/` (gitignored).

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