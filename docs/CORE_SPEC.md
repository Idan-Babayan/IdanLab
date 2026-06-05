# Idan.Lab — Core Spec (Source of Truth)

> **Status:** living document. This is the canonical reference for the Idan.Lab project.
> Update it whenever a durable fact changes. If something here conflicts with a chat,
> THIS FILE WINS. Volatile work lives in `ROADMAP.md`; rationale lives in `DECISIONS.md`.
> Last updated: 2026-05-31.

---

## 1. Identity

- **Project:** Idan.Lab — a personal cybersecurity lab notebook + portfolio.
- **Owner:** Idan Babayan (26), cybersecurity student. GitHub: `Idan-Babayan`.
- **Goal:** land a first security role (pentesting / red teaming) by showcasing
  CTF writeups and methodology with exceptional, memorable design.
- **Audience:** recruiters, hiring managers, and fellow security learners.
- **Positioning:** "Curiosity is my exploit." Confident, learning-focused, never
  self-deprecating. The writeups document *thinking* (recon → foothold → escalation →
  reflection), including dead ends, not just commands.

## 2. Live Infrastructure

- **Domain:** `idanstudio.click` (registered via AWS Route 53; nameservers delegated to
  Cloudflare: `tate.ns.cloudflare.com`, `melody.ns.cloudflare.com`).
- **Hosting:** Cloudflare Pages. Build command `npm run build`, output dir `dist`,
  framework preset Astro.
- **Repo:** `github.com/Idan-Babayan/idanstudio` (public). Push to `main` → Cloudflare
  Pages auto-deploys. Also serves at `idanstudio.pages.dev`.
- **Local dev:** `npm run dev` → `localhost:4321`.

## 3. Tech Stack (pinned)

- **Astro** `6.3.3`
- **@astrojs/starlight** `0.39.2`
- **astro-expressive-code** `0.42.0` — code blocks. Themes: `github-dark-dimmed` (dark),
  `catppuccin-latte` (light).
- **@astrojs/mdx** `5.0.6`
- **starlight-image-zoom** `0.14.2` — lightbox on content images.
- **Node.js** + npm. Build is fully static (SSG).
- Upgrade path: all packages are current as of 2026-05. Upgrade only from a stable
  checkpoint via `npx @astrojs/upgrade` (never hand-bump). See DECISIONS for rationale.

## 4. Repository Map

```
C:\dev\idanstudio\                    # chosen to avoid Hebrew chars in C:\Users\אידן\
├─ astro.config.mjs                   # Starlight config: sidebar, fonts(head), EC themes, image-zoom, vite alias
├─ src/
│  ├─ pages/
│  │  ├─ index.astro                  # HOMEPAGE — standalone immersive page (NOT Starlight). Dark-only.
│  │  └─ about.astro                  # ABOUT — standalone immersive page. Has dark/light toggle.
│  ├─ content/docs/                   # STARLIGHT docs (the writeups + platform landings)
│  │  ├─ hackthebox/{Easy,Medium,Hard}/{slug}.mdx   # difficulty dirs are Capitalized; sidebar autogenerate must match casing exactly
│  │  ├─ vulnhub/.../{slug}.mdx
│  │  ├─ picoctf/.../{slug}.mdx
│  │  ├─ overthewire/.../{slug}.mdx
│  │  └─ {platform}/index.mdx         # platform landing pages (.platform-intro header)
│  ├─ components/
│  │  └─ Toggle.astro                 # <details> wrapper; renders MDX (incl. code) inside slot
│  └─ styles/
│     └─ custom.css                   # Starlight theme + THEME PASS + badges + components
├─ public/
│  ├─ icons/{htb,vulnhub,picoctf,overthewire}.svg
│  ├─ ethical-hacking.png             # about portrait (TODO: replace with transparent SVG)
│  └─ images/{platform}/{difficulty}/{slug}/{slug}-N.ext   # writeup screenshots
└─ notion_cleaner.py                  # CONTENT PIPELINE (lives at repo root or /scripts)
```

- **Vite alias:** `@components` → `./src/components` (required for MDX imports; tsconfig
  paths do NOT work for Vite/MDX — the Vite alias is mandatory).
- **Routing rule:** `src/pages/index.astro` owns `/`, so `src/content/docs/index.mdx`
  MUST NOT exist (route collision). Same pattern for `/about`.

## 5. Architecture Model — "One bespoke page, everything else Starlight"

Two surfaces, deliberately different:

| Surface | Tech | Behavior | Why |
|---|---|---|---|
| **Marketing pages** (home, about) | Standalone `.astro` in `src/pages/` | Immersive, full creative control, own `<head>` | Starlight's splash can't do the hero/constellation |
| **Content pages** (all writeups + platform landings) | Starlight in `src/content/docs/` | Themed via CSS only; keeps sidebar, search, TOC, EC, a11y, toggle | Never rebuild Starlight's machinery |

- **The "theme pass"** = CSS-only layer in `custom.css` that overrides Starlight's design
  tokens so docs match the marketing pages. It does NOT touch Starlight functionality.
- **Theme behavior:** homepage is **dark-only** (identical on every device). About + all
  writeups support **light/dark**, synced via Starlight's `localStorage['starlight-theme']`
  key + `data-theme` on `<html>`. About **defaults to dark** (light is opt-in).

## 6. Design System — "Decrypted"

### Tokens (canonical)
- **Surfaces (dark):** `--ink #07090a`, `--ink-2 #0d1113`. **(light):** paper `#ece9e0`, `#f7f5ee`.
- **Text (dark):** `--text #e9f1ee`, `--muted #79857f`. **(light):** `#12181a`, `#586460`.
- **Accents (dark):** lime `#b6ff3c`, cyan `#41efff`, magenta `#ff4d9d`.
- **Accents (light, darkened for contrast):** lime `#4d7c0f`, cyan `#0b7e92`, magenta `#c41d6f`.
- **Fonts:** display = **Syne** (600/700/800); mono/body/UI = **JetBrains Mono** (400/500/700).
  Loaded from Google Fonts. (Self-hosting is a roadmap item.)
- **Starlight var overrides:** `--sl-color-accent` = lime, `--sl-color-bg` = ink,
  `--sl-font` = JetBrains Mono. Headings forced to Syne via CSS.

### Signature effects
- Interactive **constellation canvas** (nodes drift, react to cursor) in heroes.
- **Decode/scramble** text animation on one headline keyword.
- **Count-up** stats, **3D-tilt cards** with cursor-tracking glare, **magnetic buttons**.
- **Scroll-reveal** (IntersectionObserver), film **grain** overlay, atmospheric **glows**.
- **Reading-progress bar** (lime→cyan) on Starlight pages (injected via config `head`).
- All effects are **`prefers-reduced-motion` aware**. Reading content stays calm
  (NO tilt/scroll-reveal on writeup body text).

### Component inventory (current)
- Standalone: HUD/nav bar, hero, stats, platform/skill/practice cards, pipeline, contact, footer.
- Starlight: themed headings (Syne + lime `#` marker), lead blockquote, code frames,
  Toggle, `:::tip` admonition, metadata badges, sidebar dots.

### Platform palette (canonical, unified 2026-06-01)
One palette everywhere: HTB **lime**, VulnHub **red**, PicoCTF **purple**, OTW **amber** (used by
homepage cards, sidebar dots, about-page accents, and writeup badges). The old badge set (blue /
cyan / violet / orange) is retired. Because HTB lime overlaps Easy green, every `.platform-*` badge
carries a leading glowing dot so it never reads as a difficulty pill. (See DECISIONS 2026-06-01.)

## 7. Content Pipeline (Notion → site)

1. Author writeup in **Notion**, export as Markdown.
2. Run **`notion_cleaner.py`**:
   ```
   python notion_cleaner.py "Machine.md" -p hackthebox -d easy -o C:\dev\idanstudio \
     --description "..." --os Linux --title "Busqueda"
   ```
   - Args: input; `-p {hackthebox,vulnhub,picoctf,overthewire}`; `-d {easy,medium,hard,misc}`;
     `-o` astro root; `-t/--title`; `--description`; `--os` (default Linux); `--toggle-threshold` (8).
   - Note: `-d easy` must land the file in the Capitalized `Easy/` directory (the sidebar
     `autogenerate.directory` is case-sensitive, e.g. `hackthebox/Easy`). If/when the script
     is committed, confirm it Capitalizes the difficulty dir.
   - Output: `src/content/docs/{platform}/{difficulty}/{slug}.mdx`.
   - Manual step: copy + rename screenshots per the script's printed rename map into
     `public/images/{platform}/{difficulty}/{slug}/`.
3. Commit + push → Cloudflare deploys.

### MDX conventions the script enforces
- Absolute image paths only (`/images/...`); non-absolute paths fail as MDX imports.
- Frontmatter `title`/`description` + `import Toggle from '@components/Toggle.astro'`.
- Metadata badges div + description as a `>` blockquote lead.
- Long/indented code → wrapped in `<Toggle>`; all code blocks get `frame="code"` + a
  language `title` so bash and python look identical.
- Notion `<aside>` → `:::tip[Answer]`. Task headings → brown `.task-title`.
- `**Port 80**` → red `.port-label`. Inline code → red.
- Bold inside code fences is impossible (markdown); to emphasize a code line, manually
  use expressive-code line highlighting, e.g. ` ```bash {3} `.

### Badge / tag system (canonical colors in custom.css)
- Platform (badges): htb lime, vulnhub red, picoctf purple, overthewire amber (each with a
  leading glow dot; canonical palette, see §6).
- Difficulty: easy green, medium amber, hard red, misc slate.
- OS: linux slate, windows blue.
- Topic `.tag-*`: web orange, crypto teal, forensics amber, reversing pink, pentest green, etc.

## 8. Conventions & Non-Negotiables

- **NO em dashes** anywhere in site copy (use commas, colons, parentheses). Owner finds
  them "scream AI." Applies to all generated website text.
- **Tone:** confident, curious, learning-focused. No self-deprecation.
- **Type-safe scripts:** all TS inside `.astro` `<script>` uses explicit assertions
  (`as NodeListOf<HTMLElement>`, `as HTMLElement | null`, `!`, `?? ''`) → zero VS Code problems.
- **Code blocks:** every block has a language label; bash and python render identically.
- **Icons:** SVG for logos/icons; PNG acceptable only for detailed illustrations.
- **Landing is dark-only**; content pages keep the toggle.
- **Never rebuild Starlight**; content pages are themed via `custom.css` only.
- Real name is fine on the public site.

## 9. Environment & Tooling

- **Host OS:** Windows. Project at `C:\dev\idanstudio` (avoids Hebrew username path).
- **Kali** lives in a VM for actual security work (never the build host).
- **Editors/tools:** VS Code (+ Astro extension, optionally Claude Code), GitHub Desktop, Git.
- `npm config set cache C:\npm-cache`. PowerShell: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`.
- TODO (env): change Windows username from Hebrew to English (create new admin account).

## 10. Glossary

- **"Decrypted"** — the project's visual language (ink + lime/cyan duotone, Syne + JetBrains Mono).
- **Theme pass** — the CSS-only layer that styles Starlight to match the marketing pages.
- **Marketing pages** — standalone immersive pages (home, about).
- **Content pages** — Starlight docs (writeups + platform landings).
- **Platform codes** — HTB (HackTheBox), VH (VulnHub), Pico (PicoCTF), OTW (OverTheWire).
