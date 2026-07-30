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

### Which server to use

- `npm run dev` (localhost:4321) for implementation and visual iteration. HMR makes it the right loop
  for anything you are looking at rather than measuring.
- `npm run build` then `astro preview` for final production verification, for build or deployment
  behaviour, and for any computed-style measurement that gates a commit. CSS emission order differs
  between the two servers, and unlayered rules (the `overrides.css` tail and every Astro scoped style)
  are settled by source order, so dev can resolve a tie differently from production.
- Never use `astro preview` as the iteration loop.
- Never compare a baseline captured on one server against an after-state captured on the other.

`.claude/launch.json` carries both: `astro-dev` on 4321 and `astro-preview` on 4331, so a measurement
run does not have to displace the iteration server.

## Architecture

### Two surfaces: "one bespoke page system, everything else Starlight"

The site mixes two page systems on purpose. Picking the wrong one is the easiest mistake here.

- **Marketing pages** — standalone `.astro` files in `src/pages/` (`index.astro` = `/`, `about.astro` = `/about`). These live **outside** Starlight: each is a full HTML document with its own `<head>`, an inline `<style is:global>` design-token block, and an inline `<script>` for the interactive FX. Full creative control; immersive hero.
- **Content pages** — everything in `src/content/docs/`: all writeups + the per-platform landing pages (`{platform}/index.mdx`). These are Starlight docs and keep sidebar, search, TOC, expressive-code, a11y, and the theme toggle for free. Collection is wired in `src/content.config.ts` (`docsLoader` + `docsSchema`).

**Route-collision rule (important):** a `src/pages/` route and a Starlight doc must not both claim the same URL. So `src/content/docs/index.mdx` / `about.mdx` must not coexist with `src/pages/index.astro` / `about.astro`.

Both surfaces are now migrated: `/` is owned by `src/pages/index.astro` and `/about` by `src/pages/about.astro`; the old `src/content/docs/index.mdx` and `about.mdx` have been deleted. When adding a new marketing page, delete any Starlight doc that would claim the same route (and vice versa).

### The "theme pass" (CSS-only)

Content pages are made to match the marketing pages purely by overriding Starlight design tokens + targeted rules in the `src/styles/` modules (wired via `customCss` in `astro.config.mjs`: `layers.css` declares the cascade order, then `fonts.css`, then `tokens`, `base`, `prose`, `chrome`, `components`, `pages`, `utilities`, `overrides`). Layer order decides precedence, not file order and not selector weight; `overrides.css` is the only unlayered surface. **Never fork or rebuild Starlight components**: the CSS layer must not touch Starlight's functionality. Reading content stays calm (no tilt / scroll-reveal on writeup bodies).

### Theming model

- Homepage is **dark-only** (identical everywhere).
- About + all writeups support **light/dark**, synced via Starlight's `localStorage['starlight-theme']` key and `data-theme` on `<html>`. About **defaults to dark**; an inline `<script is:inline>` in `about.astro` applies the stored choice before paint. This shared key is what makes the toggle persist between the custom About page and the Starlight docs.

### Design system & brand

- **Fonts:** Syne (display/headings) + JetBrains Mono (body, UI, and code), self-hosted as subset WOFF2 served from `/fonts/` (see `src/styles/fonts.css`), with metric-matched size-adjust fallbacks so the swap is shift-free. There is no Google Fonts origin in source (migrated 2026-07-04, see DECISIONS).
- **Tokens:** ink/lime/cyan/magenta on dark; warm paper + darkened accents on light. The `--ink/--lime/--cyan/--magenta/--display/--mono` token block is **duplicated** inside both `index.astro` and `about.astro` `<style is:global>` (extracting it is a ROADMAP item — keep them in sync if you edit one).
- **Marketing-page FX** (inline JS, all `prefers-reduced-motion`-aware): constellation canvas, text decode/scramble, count-up stats, 3D-tilt cards with cursor glare, magnetic buttons, IntersectionObserver scroll-reveal, click-to-copy email, film-grain + glow overlays.
- **Reading-progress bar** on Starlight pages is a vanilla-JS snippet injected via the `head` config in `astro.config.mjs`, styled by `#tp-progress` in `chrome.css` (both files are involved).
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

- **Frontmatter is `title` + `description`, plus the writeup metadata: `os`, `environment`, and `difficulty`** (also optional `tags`, `principle`, `badges`). The in-page `WriteupMeta` badge row is **INJECTED, never hand-placed** (since 2026-07-20): `plugins/remark-inject-writeupmeta.mjs` builds it from frontmatter at build time, so do NOT import `WriteupMeta` and do NOT write a `<WriteupMeta ... />` tag in the body. Just set the frontmatter and follow it with the description repeated as a `>` blockquote lead. **`platform` is not a frontmatter field**: it is derived from the writeup's platform directory (`hackthebox` -> `HackTheBox`, and so on), so it can never be mistyped. The values are strict enums in `src/content.config.ts`, matching the component unions exactly, so casing matters (`Linux`, `Windows`, `Standalone`, `Active Directory`, `Progressive`, `Easy`/`Medium`/`Hard`/`Insane`). Omit `difficulty` for progressive wargames (OverTheWire Bandit), which have no rating, and its chip is not rendered. Set `badges: false` (unquoted boolean, never `no` or `off`, which YAML reads as truthy strings and which the injector rejects) to opt a page out. See DECISIONS 2026-07-20.
- Import the toggle: `import Toggle from '@components/Toggle.astro'`. `Toggle.astro` is a `<details>` wrapper whose `label` accepts an HTML string; code fences inside its slot are fully highlighted.
- **Writeup images live in `src/assets`** (parallel tree `src/assets/<platform>/<difficulty>/<slug>/...`), referenced from the `.mdx` by a relative Markdown path (`../../../../assets/...`, four `../` from a difficulty-tier writeup) so `astro:assets` optimizes and hashes them (served under `/_astro`). Use plain Markdown image syntax, not `<Image />`. Site-wide click-to-zoom is still provided by the `starlight-image-zoom` plugin (use `data-zoom-off` to opt an image out, e.g. logos).
- Code blocks use `frame="code"` + a language `title` so bash/python render identically. Bold inside a code fence is impossible — use expressive-code line highlighting (e.g. ```` ```bash {3} ````) to emphasize a line.
- Flag answers / spoilers go in `:::tip[Answer]` admonitions (often wrapped in a `<Toggle>`). Inline code renders red; `<span class="task-title">` for task headings.
- **The recon findings rail is a PLAIN MARKDOWN LIST inside `<Callout type="recon">`.** No component, no imports, no markup:

  ```mdx frame="code" title="src/content/docs/<platform>/<difficulty>/<slug>.mdx"
  <Callout type="recon">

  - 53/tcp : DNS, Simple DNS Plus
  - 389/tcp : LDAP for `htb.local`

  The concluding paragraph is treated as the Assessment.

  </Callout>
  ```

  `plugins/remark-transform-recon-rail.mjs` converts it at build time into `<dl class="findings">` with a `<dt>` chip and a `<dd>` note per row. **The ` : ` is a PARSE DELIMITER, consumed at build time and never rendered.** The separator the reader sees is a CSS rule drawn on `dt::after`, because a separator is presentation. The port token is everything before the first ` : `, so a colon later in the description is safe.

  Conversion is **all or nothing per list**: if any item fails to parse, the whole list is left alone and renders with its bullets, which is visibly wrong so you notice. Backticked inline code works anywhere in the description. The port column sizes itself to the widest chip, so nothing needs measuring when a longer port appears. Mixed rails (a prose bullet among findings) are unsupported by design: author prose as a paragraph outside the list.
- `<span class="port-label">` is emitted by the transform for rails, and remains available to hand-write for a port mentioned **inline in prose** (for example "the panel on 80/tcp").

### Content pipeline (Notion → MDX)

The authoring flow is: write in Notion, export Markdown, then polish it by hand into convention-compliant MDX (the badges, toggles, `frame="code"`, the `src/assets` relative image paths, and `:::tip` conversions above). The content pipeline is deliberate manual editorial polish against a Notion template, not a text-transformation script: the gap between a raw Notion export and the intended finished writeup is an editorial-judgment problem no script resolves. (A Python cleaner, `notion_cleaner.py`, was previously planned but is retired and was never committed; see `CORE_SPEC.md` §7 and DECISIONS.) These conventions are the source of truth.

## Conventions & deployment

- **No em dashes in any site copy** — hard rule (the owner reads them as an AI tell). Use commas, colons, or parentheses.
- TypeScript in `.astro` `<script>` blocks uses explicit assertions (`as HTMLElement | null`, `!`, `?? ''`) to keep a clean type-check; match that style.
- Real name is fine on the public site.
- **Domain:** the canonical domain is **`idanlab.dev`** (moved from `idanstudio.click`, 2026-06-06; old domain kept as a 301 redirect, then retired). See DECISIONS.
- **Deployment:** Cloudflare Pages auto-deploys on push to **`main`** (also at `idanlab.pages.dev`). Build `npm run build`, output `dist/` (gitignored).
- **Release hold (2026-07-26): LIFTED 2026-07-27 by owner instruction.** The hold kept `dev` off `main` while the branch carried the Geist prose face without the design refitted around it. Its stated purpose is satisfied: the prose foundation is locked and derived (`--sl-content-width` 46rem, `--prose-size` 18px, `--prose-leading` 1.7, `--prose-paragraph-gap` 1em, measured at 87.6 characters per line), so what production serves is a tuned body face. The retune work that remains is chrome and component internals, not the body face, and those clusters ship as their own pull requests from here. **Two standing rules were never part of the hold and did not lift with it:** `main` is reached only through a pull request, never a direct push, and force pushes, rebases, amends, resets and any history rewrite stay forbidden. See `docs/CORE_SPEC.md` §2 and DECISIONS 2026-07-27.

## Git policy
- Never run `git commit` or `git push` unless I explicitly ask. Edit locally; I commit myself.
- Only use main and dev branches. No others.
- Never create/rename branches unless I explicitly ask.
- Never create PRs unless I explicitly ask.
- Never commit, push, or run git commands unless I explicitly ask.
- Never add “Co-Authored-By: Claude” or modify commit authors.
- Never rewrite git history (rebase, amend, force push) unless I explicitly request it.
- If a task involves git, ask before doing anything.

Delegated authority (2026-07-25, owner instruction): Claude Code may run read
commands, stage, commit, and push to the working branch (dev) under the
phase-gate protocol, with build green before any commit. main is never pushed
directly; changes reach main only via a pull request opened and merged by the
owner. Force pushes, amends, rebases, resets, merges, and any history rewrite
remain forbidden without a new owner instruction.

Release hold (2026-07-26, owner instruction): LIFTED 2026-07-27 by owner
instruction, and dev merged to main by pull request that day. Its purpose was
to keep a half-refitted body face out of production; the prose foundation is
now locked and derived, and the remaining retune work is chrome and component
internals, so the purpose is satisfied. A future session should NOT refuse to
open a pull request on the strength of this paragraph.

What did NOT lift with it, because it was never part of the hold: main is
reached only through a pull request, never a direct push, and force pushes,
rebases, amends, resets and any history rewrite remain forbidden without a new
owner instruction. Outstanding retune clusters ship as individual pull
requests from here. See DECISIONS 2026-07-27.

## My rules
- NO em dashes in any copy (use commas, colons, or parentheses).
- Don't upgrade dependencies unless I ask (versions are pinned).
- Marketing pages (src/pages/*.astro) are standalone and dark-only. Writeups are Starlight,
  themed via the src/styles/ modules under the layer contract (tokens, base, prose, chrome,
  components, pages, utilities), with overrides.css as the only unlayered surface. Never
  rebuild Starlight.
- No !important inside a layer (it reverses layer order). Rules that must beat unlayered CSS,
  including our own Astro-scoped component styles, go in overrides.css with a comment naming
  what they beat.
- No selector flattening and no unit conversions in the theme pass. The unit rule is written in
  the layers.css header and is applied during the design retune, not before.
- Treat docs/CORE_SPEC.md as the source of truth once it's committed.