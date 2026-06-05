# Idan.Lab — Decisions Log

> Append-only. Newest at top. Each entry records a decision and *why*, so future-you (and
> Claude) never re-litigate settled questions. Format: date · decision · rationale · status.
> When a ROADMAP item is resolved, record the decision here.

---

### 2026-06-01 · Canonical platform palette: lime / red / purple / amber
- **Decision:** Resolve the two competing platform color schemes in favor of the homepage /
  sidebar-dot / about-accent palette: HackTheBox lime, VulnHub red, PicoCTF purple,
  OverTheWire amber. Rewrote the writeup `.platform-*` badges in `custom.css` to match
  (light: `#4d7c0f` / `#d12f2f` / `#8b3dc4` / `#a86f04`; dark: `#b6ff3c` / `#ff5c5c` /
  `#d96bff` / `#ffc23d`). Retired the old blue / cyan / violet / orange badge set.
- **Why:** One palette everywhere; the badges were the lone holdout. The homepage palette is
  the brand, so the badges move to it rather than the reverse.
- **Side effect handled:** HTB lime now collides with `difficulty-easy` green. Every
  `.platform-*` badge gets a leading glowing `::before` dot (echoing the sidebar dot, colored
  via `currentColor`) so a platform badge never reads as a difficulty pill. `difficulty-*`,
  `os-*`, and `tag-*` rules are unchanged; Easy stays emerald.
- **Status:** Adopted.

### 2026-06-01 · Difficulty dirs are Capitalized; sidebar config matches casing exactly
- **Decision:** Standardize on Capitalized difficulty directories (`hackthebox/Easy`, etc.) and
  make every sidebar `autogenerate.directory` use that exact casing. Fixed `astro.config.mjs`
  from `hackthebox/easy` → `hackthebox/Easy`.
- **Why:** Starlight matches `autogenerate.directory` against collection entry ids
  case-sensitively. The lowercase config silently dropped `Easy/busqueda.mdx` from the sidebar
  (page still built and was URL-reachable, just unlisted). Windows masked it by resolving the
  path case-insensitively; a Linux/Cloudflare build would fail harder. Chose to match the
  existing on-disk Capitalized folders rather than rename them.
- **Status:** Adopted. (Pipeline note: `notion_cleaner.py -d easy` must output into `Easy/`.)

### 2026-05-31 · Sidebar markers: CSS colored dots, not emojis
- **Decision:** Replace sidebar emoji labels with CSS-injected colored circles targeting
  Starlight's `.top-level` / `.group-label` (About cyan, HTB lime, VulnHub red, Pico purple,
  OTW amber). Real platform-logo SVGs kept as a commented alternative.
- **Why:** Emojis looked amateur and render inconsistently per OS. Dots match the site's
  existing dot motif and are uniform. True SVG logos need a Sidebar component override (deferred).
- **Status:** Adopted.

### 2026-05-31 · Stay on current package versions (no upgrade)
- **Decision:** Remain on Astro 6.3.3 / Starlight 0.39.2 (both current). Upgrade only later,
  from a stable checkpoint, via `npx @astrojs/upgrade`.
- **Why:** Site works; mid-polish is the wrong time to absorb major-version breaking changes.
- **Status:** Adopted.

### 2026-05-31 · Writeup theme pass is CSS-only
- **Decision:** Bring Starlight writeups in line with the marketing pages purely by overriding
  Starlight design tokens + targeted CSS in `custom.css`. No component forks.
- **Why:** Preserves search, nav, TOC, expressive-code, a11y, and the theme toggle for free.
  Reading content stays calm (no tilt/scroll-reveal on body).
- **Status:** Adopted.

### 2026-05-31 · Body font is JetBrains Mono (not a proportional sans)
- **Decision:** Use JetBrains Mono for body/UI across both surfaces; Syne for display headings.
- **Why:** Maximum cohesion with the marketing pages and the "lab notebook / terminal" identity;
  the audience is technical and comfortable reading mono. Tuned line-height/size for readability.
- **Status:** Adopted. (Swappable to a sans via one CSS variable if reading ever feels heavy.)

### 2026-05-31 · Dark-only landing; toggle on content; shared theme key
- **Decision:** Homepage is dark-only (identical on every device). About + writeups support
  light/dark via Starlight's `localStorage['starlight-theme']`; About defaults to dark.
- **Why:** The hero is art-directed for dark; a light landing dilutes it. Content must stay
  readable in both. Sharing Starlight's key makes the toggle persist across custom + doc pages.
- **Status:** Adopted.

### 2026-05-31 · Two surfaces: standalone marketing pages + Starlight docs
- **Decision:** Home + About are standalone `.astro` pages in `src/pages/`; everything else is
  Starlight in `src/content/docs/`. `index.mdx`/`about.mdx` must not exist (route collision).
- **Why:** Starlight's splash can't deliver the immersive hero; Starlight's machinery is perfect
  for the writeups. Best of both, no fighting the framework.
- **Status:** Adopted.

### (earlier) · Notion → notion_cleaner.py → MDX pipeline
- **Decision:** Author in Notion, normalize with a Python script into clean MDX.
- **Why:** Comfortable authoring in Notion; the script enforces all conventions (badges,
  toggles, code-frame normalization, image paths) so 50+ writeups stay consistent.
- **Status:** Adopted.

### (earlier) · No em dashes in site copy
- **Decision:** Never use em dashes in any website text.
- **Why:** Owner reads them as an AI tell; they undercut a hand-crafted feel.
- **Status:** Adopted (hard rule).

### (earlier) · Vite alias for @components
- **Decision:** Map `@components` → `./src/components` in `astro.config.mjs` vite config.
- **Why:** tsconfig path aliases don't resolve for Vite/MDX imports; the Vite alias does.
- **Status:** Adopted.
