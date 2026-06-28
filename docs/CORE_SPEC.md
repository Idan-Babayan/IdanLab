# Idan.Lab — Core Spec (Source of Truth)

> **Status:** living document. This is the canonical reference for the Idan.Lab project.
> Update it whenever a durable fact changes. If something here conflicts with a chat,
> THIS FILE WINS. Volatile work lives in `ROADMAP.md`; rationale lives in `DECISIONS.md`.
> Last updated: 2026-06-20.

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

- **Domain:** `idanlab.dev` (nameservers delegated to Cloudflare). Old domain
  `idanstudio.click` is kept as a 301 redirect during transition, then retired.
- **Hosting:** Cloudflare Pages. Build command `npm run build`, output dir `dist`,
  framework preset Astro.
- **Repo:** `github.com/Idan-Babayan/IdanLab` (public, mixed case). Push to `main` → Cloudflare
  Pages auto-deploys. Also serves at `idanlab.pages.dev`. `astro.config.mjs` sets
  `site: 'https://idanlab.dev'` (drives the sitemap + canonical URLs). Branches: only `main`
  and `dev`; work lands on `dev`, then a PR into `main`.
- **robots.txt:** managed in-repo at `public/robots.txt` (served at `/robots.txt`). It currently
  holds only the easter-egg breadcrumb comment + a `Sitemap:` line (NOT the Cloudflare-managed
  bot disallows; see ROADMAP open issues).
- **Local dev:** `npm run dev` → `localhost:4321`.

## 3. Tech Stack (pinned)

- **Astro** `6.3.3`
- **@astrojs/starlight** `0.39.2`
- **astro-expressive-code** `0.42.0` (code blocks). Themes: `tokyo-night` (dark),
  `one-light` (light). A custom EC plugin (`src/lib/ec-priv-command.mjs`) tags command words
  by semantic category for coloring (see §6).
- **@astrojs/mdx** `5.0.6`
- **starlight-image-zoom** `0.14.2` — lightbox on content images.
- **Node.js** + npm. Build is fully static (SSG).
- Upgrade path: all packages are current as of 2026-05. Upgrade only from a stable
  checkpoint via `npx @astrojs/upgrade` (never hand-bump). See DECISIONS for rationale.

## 4. Repository Map

```
C:\dev\idanlab\                       # chosen to avoid Hebrew chars in C:\Users\אידן\
├─ astro.config.mjs                   # Starlight config: site, sidebar, fonts(head), EC themes + pluginPrivCommand, reading-progress head script, image-zoom, vite alias, components override (PageSidebar)
├─ src/
│  ├─ content.config.ts               # docs collection (docsLoader + docsSchema), extended with optional os/tags
│  ├─ pages/
│  │  ├─ index.astro                  # HOMEPAGE: standalone immersive page (NOT Starlight). Dark-only.
│  │  └─ about.astro                  # ABOUT: standalone immersive page. Has dark/light toggle.
│  ├─ content/docs/                   # STARLIGHT docs (writeups + platform landings + 404 + secret)
│  │  ├─ hackthebox/{Easy,Medium,Hard}/{slug}.mdx   # difficulty dirs Capitalized; sidebar autogenerate must match casing exactly
│  │  ├─ vulnhub|picoctf|overthewire/.../{slug}.mdx
│  │  ├─ {platform}/index.mdx         # platform landing: minimal frontmatter + tableOfContents:false + <PlatformIndex/> (replaced the old .platform-intro markup)
│  │  ├─ 404.mdx                      # themed 404 (template: splash + hero), renders <NotFound/>; Starlight slug-404 override
│  │  └─ secret.mdx                   # hidden /secret (splash, pagefind:false, noindex), renders <SecretTerminal/>
│  ├─ components/
│  │  ├─ Toggle.astro                 # <details class="toggle"> wrapper; flag prop adds .toggle-flag; renders MDX (incl. code) in slot
│  │  ├─ FlagCapture.astro            # "Decrypt to Capture" gold flag control (props: type user|root, flag); replaces the heading-plus-duplicate flag Toggle
│  │  ├─ ToggleAll.astro              # Expand/Collapse-all control (vanilla TS, scroll-anchored); injected via PageSidebar override
│  │  ├─ Callout.astro                # icon-based tagged callout (recon/loot/intel/vuln/defense); .cl styles in custom.css
│  │  ├─ WriteupCard.astro            # presentational writeup card (props only, reusable for a future /writeups index)
│  │  ├─ PlatformIndex.astro          # data + hero + difficulty filter + WriteupCard grid; ported homepage effects
│  │  ├─ NotFound.astro               # 404 breadcrumb body (nudges to /robots.txt)
│  │  ├─ SecretTerminal.astro         # from-scratch, zero-dependency vanilla-TS fake terminal
│  │  └─ overrides/
│  │     └─ PageSidebar.astro         # additive Starlight override: renders <Default/> then <ToggleAll/> at the bottom of the right TOC
│  ├─ lib/
│  │  └─ ec-priv-command.mjs          # EC plugin: tags command words by category (priv/recon/net/inspect)
│  └─ styles/
│     └─ custom.css                   # Starlight theme + THEME PASS + light art-direction + badges + sidebar + components
├─ public/
│  ├─ robots.txt                      # in-repo; breadcrumb comment + Sitemap line (see §2)
│  ├─ icons/{htb,vulnhub,picoctf,overthewire}.svg
│  ├─ ethical-hacking.png             # about portrait (TODO: replace with transparent SVG)
│  └─ images/{platform}/{difficulty}/{slug}/{slug}-N.ext   # writeup screenshots
└─ notion_cleaner.py                  # CONTENT PIPELINE (documented in §7; NOT yet committed to the repo)
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
- **Content-embedded components:** platform landings, the 404, and `/secret` are Starlight docs
  that embed scoped Astro components via MDX (`PlatformIndex`, `NotFound`, `SecretTerminal`). They
  carry Starlight's `not-content` class so prose styling skips them; our `custom.css` prose rules
  are guarded with `:not(:where(.not-content *))`. Astro scopes component styles with `:where()`
  (zero specificity), so component CSS must not rely on out-ranking global rules.
- **Hiding a page from nav:** the sidebar is hand-curated in `astro.config.mjs`, so a new doc is
  hidden by simply not listing it (e.g. `/secret`); add `pagefind:false` + a noindex `head` meta
  to keep it out of search.

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
- Content-embedded (in `src/components/`): `PlatformIndex` (animated hero + difficulty filter rail
  + writeup-card grid; reuses the homepage effects), `WriteupCard` (presentational, `showPlatform`
  prop for a future mixed grid), `Callout` (icon-based tagged callout, used in writeup bodies),
  `NotFound` (404 body), `SecretTerminal` (vanilla-TS terminal).
- Chrome (Starlight override): `ToggleAll` (Expand/Collapse-all control) auto-injected into the right
  "On this page" sidebar by `overrides/PageSidebar.astro` (renders `<Default/>` then the control).

### Starlight Component Overrides
- Starlight Component Overrides: Additive Starlight component overrides are an approved architectural pattern alongside `custom.css` and custom components.
- Override Strategy: Overrides should wrap and render `<Default />` (or the upstream component) and layer behavior, styling, or markup on top rather than copying or replacing upstream implementations.
- No Forking by Default Forking, duplicating, or fully replacing Starlight components is discouraged and should only be considered when the desired result cannot be achieved through an additive override.
- User Approval Required: Introducing a new Starlight component override is a structural architectural change and should be proposed and approved by the user before implementation.

### Platform palette (canonical, unified 2026-06-01)
One palette everywhere: HTB **lime**, VulnHub **red**, PicoCTF **purple**, OTW **amber** (used by
homepage cards, sidebar dots, about-page accents, and writeup badges). The old badge set (blue /
cyan / violet / orange) is retired. Because HTB lime overlaps Easy green, every `.platform-*` badge
carries a leading glowing dot so it never reads as a difficulty pill. (See DECISIONS 2026-06-01.)

### Light-mode identity (paper-native "risograph")
Light is art-directed on its own terms (dark is unchanged). All rules scoped to
`[data-theme='light']` in `custom.css`:
- **Editorial ink:** body text near-black `#1a1815` on warm paper (crisp, premium).
- **Texture not glow:** a faint warm technical dot-grid behind content (`body::before`), replacing
  the old bottom atmosphere wash. Static, low contrast, prefers-reduced-motion safe.
- **Decorative accent palette (NON-text):** vivid `--pf-accent-2`-style trio for dots, fills,
  the `#` marker, the h2 rule, the sidebar active bar, panel accents. The darkened text inks stay
  for body text. Reading-progress bar light gradient: `#4d7c0f` to `#0b7e92`.
- **Crisp badges:** solid (no-glow) platform dots and bolder flat fills; per-badge text inks
  deepened so every pill clears WCAG AA on its own fill (a bright hue cannot clear AA on a light
  same-hue fill, so inspect-style inks go deep).
- A risograph title-misregistration (offset ghost) effect was tried and REJECTED (see DECISIONS).

### Sidebar (chrome)
Taller rows via larger block padding + line-height on `nav.sidebar a, nav.sidebar summary`
(fuller rail, better touch targets; no `<li>` margins, so the active pill / nesting guide / dots
stay aligned). Width trimmed via `--sl-sidebar-width: 17rem` (from Starlight's 18.75rem).

### Platform-index duotone
On the platform index each platform reads as its color (lead) plus a universal cyan secondary
(`--pf-accent-2`: `#41efff` dark, `#08697a` light): hero glow is a platform+cyan duotone, the stat
label + card eyebrow + "Read writeup" affordance are cyan, the count-up number + accent bar stay
the platform color, the stat breakdown segments are colored by difficulty, and the filter active
pill uses a cyan ring.

### Code-block command highlighting (by category, OKLCH palette)
`ec-priv-command.mjs` tags command words by semantic category, colored in `custom.css` (theme-aware,
`!important`). The palette is designed in OKLCH and measured against the rendered code bg
(tokyo-night `#1a1b26` dark, one-light `#fafafa` light), separating the three perceptual channels:
- **Lightness = contrast (uniform):** one target L per theme (dark `L 0.745`, light `L 0.43`) so all
  categories read at one brightness. Measured: dark recon 7.56 / net 7.96 / inspect 7.45 (all AAA);
  light recon 7.72 / net 7.45 (AAA). **Exception:** light inspect is deliberately lightened to `L 0.50`
  (~5.8:1, still AA) per owner preference, because the darker uniform brown read too heavy on paper.
- **Hue = category** (kept clear of the theme's string/keyword/function token hues): privilege magenta,
  recon gold `h95`, network cyan `h200`, inspect warm-sand `h60` (~145 deg off the theme's cool neutral
  text, so the near-neutral inspect still reads as a distinct tint).
- **Chroma = loud vs quiet** (NOT lightness): recon + network vivid (high C); inspect LOW C at the same
  L/contrast, so it is calm without going dim. This fixed the previously near-invisible inspect color
  (it had been quieted by dropping CONTRAST instead of chroma).
- Values: privilege `.ec-cmd-priv` `#ff4d9d`/`#c41d6f` (sudo, su, doas). recon `.ec-cmd-recon`
  `oklch(0.745 0.153 95)`/`oklch(0.43 0.088 95)` (nmap, gobuster, ffuf, feroxbuster, nikto, whatweb,
  enum4linux, smbclient). network `.ec-cmd-net` `oklch(0.745 0.126 200)`/`oklch(0.43 0.073 200)`
  (nc, ncat, netcat, penelope, socat, curl, wget, ssh, chisel). inspect `.ec-cmd-inspect`
  `oklch(0.745 0.045 60)`/`oklch(0.5 0.045 60)` (ls, cd, cat, echo, whoami, id, find, grep, pwd, ping).
- **Weight channel:** every recognized command is `font-weight:700`, so a command pops by weight while
  color only signals category. **sudo's COLOR is the fixed anchor (unchanged); it gains bold only** and
  sits at ~5.5:1 dark / ~5.4:1 light (just under the 7:1 the redesigned set meets, by design, because
  it must not be recolored).
- Mechanism: command-position detection (first word after prompt / `sudo` / `|` `&&` `;`); sudo stays
  content-matched. Command lists are one-line-extendable. Residual risk: an output line whose first
  word is exactly a listed command (rare) can be mis-tagged.
- Note: EC `{n}` line highlights are currently unused (dropped from busquedav2) and have no custom
  marked-line styling; if reintroduced, EC's default blue marked line would need restyling.

### Tagged callouts (icon-based, `Callout.astro` + `.cl*` in custom.css)
Five semantic writeup callouts, each a 3px accent left border + faint tint + a header (icon + UPPERCASE
label), theme-aware (vivid border, light-mode ink swap on icon/label): recon (cyan, magnifier), loot
(amber, padlock), intel (violet, information), vuln (red, warning), defense (green, an inline shield SVG
since Starlight has no shield). Icons via Starlight's `<Icon>`. Authored as `<Callout type="...">` in MDX.

### Flag loot gold (User Flag / Root Flag)
One gold signal across the flag's states via the `--flag-gold` token (`#ffc23d` dark / `#C6A243` light):
the body heading (gold, with a flag-SVG mask icon; replaces the brown `.task-title`) and the right TOC
entry (muted gold at rest, full gold on hover/current; other TOC entries keep the green
`--sl-color-text-accent`). Flag headings have no dedicated class yet, so the CSS targets the slug ids
`#user-flag` / `#root-flag` (interim; a `.flag-title` from the pipeline is the clean hook). See
DECISIONS 2026-06-20.

The flag VALUE is now the **FlagCapture** "Decrypt to Capture" control under the heading (DECISIONS
2026-06-27), which supersedes the old `.toggle-flag` reveal. The heading + gold TOC entry are unchanged;
FlagCapture renders below them and never repeats the flag name OR its glyph (it carries one neutral
lock-to-check icon, never a flag/crown). It adds tiers on top of `--flag-gold`: `--flag-gold-root`
(richer gold for ROOT, the only user-vs-root signal, color not glyph) and AA-grade value golds
`--flag-gold-val` / `--flag-gold-val-root` for the flag TEXT (the bright loot gold is decorative and not
text-AA on paper, so the value uses a deeper gold: light user 4.99:1, root 5.93:1; dark both >11:1). The
frame matches the writeup Toggle width + 6px radius but sits a bit taller for presence; an icon-only copy
button sits inside it (right, vertically centered) and shows a golden "Copied!" pill on copy. Capture
moment is a warm gold glow pulse in BOTH themes (tuned per theme,
light halo stronger for paper; no underline). Locked state is static (no idle animation); reduced-motion
skips the scramble + glow entirely.

### Expand/Collapse-all control (`ToggleAll.astro`)
A dependency-free control auto-injected at the bottom of the right TOC via `overrides/PageSidebar.astro`
(additive override, renders `<Default/>`; wired in `astro.config.mjs` `components`). Bordered pill (gray +
cyan hover), set apart by a gap + a `--sl-color-hairline` divider, desktop-only, self-hides when a page
has no toggles. Acts on `.sl-markdown-content details.toggle:not(.toggle-flag)` (skips flags, code, nav).
Preserves reading position: anchors on the current heading and corrects scroll synchronously, with native
`overflow-anchor` suppressed for the operation (see DECISIONS; ROADMAP has the unverified few-pixel shift).

## 7. Content Pipeline (Notion → site)

1. Author writeup in **Notion**, export as Markdown.
2. Run **`notion_cleaner.py`**:
   ```
   python notion_cleaner.py "Machine.md" -p hackthebox -d easy -o C:\dev\idanlab \
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
- **Flags:** emit the gold heading `### <span class="task-title">User Flag</span>` (or `Root Flag`)
  immediately followed by `<FlagCapture type="user" flag="..." />` (or `type="root"`), and add
  `import FlagCapture from '@components/FlagCapture.astro'`. This replaces the old heading + duplicate
  `<Toggle flag>` + `:::tip[Answer]`. Handle user-only and root-only writeups (emit only the flag that
  exists). See DECISIONS 2026-06-27.
- `**Port 80**` → red `.port-label`. Inline code → red.
- Bold inside code fences is impossible (markdown); to emphasize a code line, manually
  use expressive-code line highlighting, e.g. ` ```bash {3} `.

### Badge / tag system (canonical colors in custom.css)
- Platform (badges): htb lime, vulnhub red, picoctf purple, overthewire amber (each with a
  leading glow dot; canonical palette, see §6).
- Difficulty: easy green, medium amber, hard red, misc slate.
- OS: linux slate, windows blue.
- Topic `.tag-*`: web orange, crypto teal, forensics amber, reversing pink, pentest green, etc.
- **Frontmatter os/tags:** `content.config.ts` extends `docsSchema` with optional `os` and `tags`.
  Today writeups encode OS in the body `.machine-meta` badge row, so these stay undefined and
  `WriteupCard` omits the OS/tag chips gracefully. When the pipeline promotes os/tags to
  frontmatter, the cards render them with no component change (a content-lane enhancement).

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

- **Host OS:** Windows. Project at `C:\dev\idanlab` (avoids Hebrew username path).
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
