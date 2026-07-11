# Idan.Lab — Core Spec (Source of Truth)

> **Status:** living document. This is the canonical reference for the Idan.Lab project.
> Update it whenever a durable fact changes. If something here conflicts with a chat,
> THIS FILE WINS. Volatile work lives in `ROADMAP.md`; rationale lives in `DECISIONS.md`.
> Last updated: 2026-07-11.

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
- **robots.txt:** managed in-repo at `public/robots.txt` (served at `/robots.txt`). The in-repo file
  holds the easter-egg breadcrumb comment + a `Sitemap:` line. On deploy, Cloudflare composes its own
  managed block (the Content-Signals header plus the managed bot disallow list: Amazonbot,
  Applebot-Extended, Bytespider, CCBot, ClaudeBot, CloudflareBrowserRenderingCrawler, Google-Extended,
  GPTBot, meta-externalagent) with this in-repo content, so the deployed `/robots.txt` carries both
  intact. There is no override: the two compose as intended (verified on the production site).
- **Security headers:** application-layer headers are served via `public/_headers` (Cloudflare Pages),
  additive to zone-level hardening (HSTS, Full Strict TLS, DNSSEC live at the Cloudflare zone; HSTS is
  NOT duplicated in `_headers` to avoid a conflicting max-age). Enforced now: `X-Content-Type-Options:
  nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, a deny-most
  `Permissions-Policy`, and immutable `Cache-Control` for `/_astro/*` and the self-hosted `/fonts/*`.
  Content-Security-Policy is ENFORCED IN PRODUCTION (live since PR #9 merged 2026-07-11; flipped from `Content-Security-Policy-Report-Only` after full
  cross-browser plus real-Safari verification): `font-src 'self'` (fonts self-hosted, no external origins),
  `style-src 'self' 'unsafe-inline'` (Starlight / Expressive Code inline styles, effectively permanent),
  `img-src 'self' data:` (icon data URIs), `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`,
  plus `frame-ancestors 'none'` and `upgrade-insecure-requests`, which were inert under Report-Only and are
  now ACTIVE (frame-ancestors backs up the enforced `X-Frame-Options: DENY`; upgrade-insecure-requests
  upgrades same-origin subresources to HTTPS). `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'`:
  `'unsafe-inline'` because the build emits 18 distinct inline scripts (Starlight's own plus our
  marketing/writeup FX) and a hash would disable `'unsafe-inline'` and block the rest; `'wasm-unsafe-eval'`
  because Starlight search (Pagefind) instantiates WebAssembly in a Web Worker, which CSP blocks without it
  (see DECISIONS). No third-party script origin, so `script-src 'self'` is honest: the site loads only
  same-origin scripts (see the Web Analytics bullet below). No reporting endpoint (report-to / report-uri)
  by design. The CSP must NOT use Trusted Types (the SecretTerminal renders via `innerHTML`). The
  `Permissions-Policy` was pruned of six tokens current browsers no longer recognize (ambient-light-sensor,
  battery, document-domain, execution-while-not-rendered, execution-while-out-of-viewport,
  speaker-selection). Cache caveat: `/fonts/*` is immutable for a year and filenames are not
  content-hashed, so replacing a font requires a new filename.
- Cloudflare Web Analytics (RUM) is disabled and removed (deleted at the dashboard, not just
  toggled off); no static.cloudflareinsights.com beacon is injected. Consequently the
  Content-Security-Policy keeps script-src 'self' with no third-party script origin, and the
  site loads no external scripts (all scripts are same-origin). Re-enabling analytics in any
  mode would require allowlisting static.cloudflareinsights.com in script-src.
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
├─ astro.config.mjs                   # Starlight config: site, sidebar, customCss[fonts.css, custom.css], EC themes + pluginPrivCommand, reading-progress head script (no font preloads, see DECISIONS 2026-07-07), image-zoom, vite alias, components overrides (PageSidebar + Footer), markdown remarkPlugins (PasswordReveal import injection) + rehypePlugins (content image loading)
├─ src/
│  ├─ content.config.ts               # docs collection (docsLoader + docsSchema), extended with optional os/tags/principle
│  ├─ pages/
│  │  ├─ index.astro                  # HOMEPAGE: standalone immersive page (NOT Starlight). Dark-only.
│  │  └─ about.astro                  # ABOUT: standalone immersive page. Has dark/light toggle.
│  ├─ content/docs/                   # STARLIGHT docs (writeups + platform landings + 404 + secret)
│  │  ├─ hackthebox/{easy,medium,hard}/{slug}.mdx   # flat writeups, lowercase difficulty dirs; sidebar autogenerate matches this casing (Linux is case-sensitive)
│  │  ├─ vulnhub|picoctf|overthewire/.../{slug}.mdx
│  │  ├─ {platform}/index.mdx         # platform landing: minimal frontmatter + tableOfContents:false + <PlatformIndex/> (replaced the old .platform-intro markup)
│  │  ├─ 404.mdx                      # themed 404 (template: splash + hero), renders <NotFound/>; Starlight slug-404 override
│  │  └─ secret.mdx                   # hidden /secret (splash, pagefind:false, noindex), renders <SecretTerminal/>
│  ├─ assets/{platform}/{difficulty}/{slug}/{slug}-N.ext   # writeup screenshots; astro:assets optimizes + hashes them, referenced by relative ../ from writeups (NOT public/)
│  ├─ components/
│  │  ├─ Toggle.astro                 # <details class="toggle"> wrapper; flag prop adds .toggle-flag; renders MDX (incl. code) in slot
│  │  ├─ FlagCapture.astro            # "Decrypt to Capture" gold flag control (props: type user|root, flag); replaces the heading-plus-duplicate flag Toggle
│  │  ├─ PasswordReveal.astro         # amber wargame password waypoint (prop: password); blur-to-reveal then copy-in-place, deliberately distinct from FlagCapture (no gold, no decode animation); no per-file import needed, see plugins/remark-inject-passwordreveal.mjs
│  │  ├─ ToggleAll.astro              # Expand/Collapse-all control (vanilla TS, scroll-anchored); injected via PageSidebar override
│  │  ├─ Callout.astro                # icon-based tagged callout (recon/loot/intel/vuln/defense); .cl styles in custom.css
│  │  ├─ Principle.astro              # closing epigraph (aside.principle, prop: text): centered italic mono maxim + dinkus + PRINCIPLE label; no card/border/bg; .principle styles in custom.css
│  │  ├─ WriteupCard.astro            # presentational writeup card (props only, reusable for a future /writeups index)
│  │  ├─ PlatformIndex.astro          # data + hero + difficulty filter + WriteupCard grid; ported homepage effects
│  │  ├─ NotFound.astro               # 404 breadcrumb body (nudges to /robots.txt)
│  │  ├─ SecretTerminal.astro         # from-scratch, zero-dependency vanilla-TS fake terminal
│  │  └─ overrides/
│  │     ├─ PageSidebar.astro         # additive Starlight override: renders <Default/> then <ToggleAll/> at the bottom of the right TOC
│  │     └─ Footer.astro              # additive Starlight override: auto-appends the <Principle> coda from frontmatter and suppresses pagination on writeups that carry one
│  ├─ lib/
│  │  └─ ec-priv-command.mjs          # EC plugin: tags command words by category (priv/recon/net/inspect)
│  └─ styles/
│     ├─ custom.css                   # Starlight theme + THEME PASS + light art-direction + badges + sidebar + components
│     └─ fonts.css                    # self-hosted @font-face (subset WOFF2) + metric-matched fallbacks; loaded via customCss and imported by the marketing pages
├─ plugins/
│  ├─ rehype-content-image-loading.mjs # rehype: sets loading/decoding on content <img> (first eager, rest lazy); wired via astro.config markdown.rehypePlugins
│  └─ remark-inject-passwordreveal.mjs # remark: conditionally injects `import PasswordReveal from '@components/PasswordReveal.astro'` into an MDX file's AST at build time, only when that file uses <PasswordReveal/> and has no import of its own; wired via astro.config markdown.remarkPlugins
└─ public/
   ├─ robots.txt                      # in-repo; breadcrumb comment + Sitemap line (see §2)
   ├─ favicon.svg                     # site favicon
   ├─ fonts/*.woff2                   # self-hosted subset fonts (Syne 600/700/800; JetBrains Mono 400/500/700 + 400/500 italic); served at /fonts/
   ├─ icons/{htb,vulnhub,picoctf,overthewire}.svg
   └─ ethical-hacking.png             # about portrait (TODO: replace with transparent SVG). Writeup screenshots now live in src/assets (see §7); marketing images, if any, go under public/images
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
- **Fonts:** display = **Syne** (600/700/800); mono/body/UI = **JetBrains Mono** (400/500/700, plus italic 400/500 for the Principle coda maxim).
  Self-hosted as subset WOFF2 in public/fonts/ (see src/styles/fonts.css), with metric-matched
  size-adjust fallbacks so the font swap is shift-free; no Google Fonts origin. See DECISIONS 2026-07-04.
- **Starlight var overrides:** `--sl-color-accent` = lime, `--sl-color-bg` = ink,
  `--sl-font` = JetBrains Mono. Headings forced to Syne via CSS.

### Signature effects
- Interactive **constellation canvas** (nodes drift, react to cursor) in heroes. Its `draw()` loop pauses
  off-screen via an `IntersectionObserver` (perf-only; no visual change while visible, reduced-motion gate
  intact). See DECISIONS 2026-07-11.
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
  `NotFound` (404 body), `SecretTerminal` (vanilla-TS terminal), `badges/WriteupMeta` (navigational
  Platform/OS/Environment chip row + trailing hue-free Difficulty pip chip, under a writeup title;
  each nav chip is intentionally colored via a single `--wm-c` per value (platform = canonical
  `--pf-accent`, OS/Env = identity colors), with a restrained glow (halo on dark, hue-shadow on light);
  Difficulty magnitude is filled+growing pips; chips are `<a>` to future filter routes, `.not-content`
  + `data-astro-prefetch="false"`; icons live in `badges/icons.ts`; runtime-validates its four union
  props. Not yet applied to any writeup. See DECISIONS 2026-07-10).
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
- EC `{n}` line highlights get a decisive-line focus treatment (custom.css, after the scrollbar rules):
  `.ec-line.mark` gets a lime gutter bar + a low tint (dark accent 10%, light `--tp-deco-lime` 12%) that
  sits under the command-token colors. custom.css is unlayered so it overrides EC's default blue marked
  line cleanly (no `styleOverrides`). See DECISIONS 2026-07-04.

### Tagged callouts (icon-based, `Callout.astro` + `.cl*` in custom.css)
Five semantic writeup callouts, each a 3px accent left border + faint tint + a header (icon + UPPERCASE
label), theme-aware (vivid border, light-mode ink swap on icon/label): recon (cyan, magnifier), loot
(amber, padlock), intel (violet, information), vuln (red, warning), defense (green, an inline shield SVG
since Starlight has no shield). Icons via Starlight's `<Icon>`. Authored as `<Callout type="...">` in MDX.

### Flag loot gold (User Flag / Root Flag)
One gold signal across the flag's states via the `--flag-gold` token (`#ffc23d` dark / `#C6A243` light):
the body heading (gold, with a flag-SVG mask icon; replaces the brown `.task-title`) and the TOC entry
(muted gold at rest, full gold on hover/current; non-flag TOC entries follow the active-color ladder
below). The TOC treatment applies on both the desktop right column and the mobile dropdown (mobile added
DECISIONS 2026-07-10). Flag headings have no dedicated class yet, so the CSS targets the slug ids
`#user-flag` / `#root-flag` (interim; a `.flag-title` from the pipeline is the clean hook). The same two
slug ids are what the active-color ladder excludes, so flags keep gold instead of going cyan. See
DECISIONS 2026-06-20.

### Password waypoint amber (PasswordReveal)
`PasswordReveal.astro` (prop: `password: string`) is the wargame-password counterpart to FlagCapture,
deliberately built as its own component (not a FlagCapture variant) because a wargame password
(OverTheWire Bandit, etc.) is a waypoint the reader pastes into SSH, not a trophy: no gold/loot tokens,
no signature decode/scramble animation. Layout: a `PASSWORD` label, the value blurred via CSS `filter`
as plain text with no border/background/hover affordance of its own, then ONE control on the right, the
ONLY interactive element in the row: it starts as an eye + "Reveal" and swaps in place to a copy icon +
"Copy" on click (single slot, so there is no layout shift). A second click copies and briefly shows
"Copied" before reverting. No native `title` tooltip (tried, then dropped for looking bad); the
accessible name lives entirely in `aria-label`. Real `<button>`; reveal/copy are announced via a VISUALLY
HIDDEN `aria-live` region (`.pw-live.sr-only`, screen-reader-only, no visible "Password
revealed"/"Password copied" text). Only the button reads as interactive: the container (`.pwreveal`), the
label, and the value are all `user-select: none` (copying is the only way to take the value, matching
FlagCapture's captured-value pattern), and the container/value both get `cursor: default` with no `:hover`
change to filter/cursor/color. The row itself IS a passive amber card (not a neutral hairline frame):
literal `rgba(245, 158, 11, ...)` washes/borders (dark 0.08 fill / 0.4 border, light 0.14 fill / 0.55
border, stronger and more golden), matching the site's canonical OverTheWire system, the same values
`.spoiler-toggle` uses. The button text/icon is the OTW accent directly, `#ffc23d` dark / `#a86f04` light,
with an `rgba(245, 158, 11, ...)` border/hover wash. Every color is a literal hex/rgba value (no
`color-mix()` custom-property indirection, after an intermediate token-based pass rendered as a
neutral/near-black box in practice), deliberately NOT `--flag-gold`. The only motion is the blur-to-clear
filter transition, gated behind `prefers-reduced-motion: no-preference`; the value's `:hover` rule
deliberately does NOT declare `filter` at all (an earlier `filter: inherit` attempt resolved to the
parent's "none" and silently un-blurred the still-locked password on hover, see DECISIONS). Styled in
`custom.css` near the `.spoiler-toggle` rules, including a project-first `.sr-only` utility. Wired into
`overthewire/bandit/0-1.mdx` alongside the existing spoiler-toggle; rolling out to the remaining 33 Bandit
pages is tracked in ROADMAP. See DECISIONS 2026-07-05.

### TOC active-entry color ladder
The right "On this page" entry the reader is currently on (`aria-current="true"`) takes the hue of the
heading it points to, so the column mirrors the in-page hierarchy: h1/h2 keep Starlight's green
`--sl-color-text-accent`, h3 turns cyan (`--tp-cyan` / `--tp-cyan-ink`, the same tokens as the `###`
heading), and h4/h5/h6 go muted gray (`--sl-color-gray-2`, the h4 heading color). Flags stay gold (above).
Only the current entry recolors; inactive entries keep the muted default. On the desktop right column
heading level is read from Starlight's TOC nesting depth (h3 nested under h2, etc.). The mobile TOC
dropdown (`<mobile-starlight-toc>`) now gets the SAME gold-flag + cyan-current-h3 treatment
(DECISIONS 2026-07-10), and the current top-level h2 entry now turns green (`--sl-color-text-accent`,
matching desktop) as of 2026-07-11; it is nested too but under a different wrapper
(`nav > details > .dropdown`), so the depth rules match Starlight's per-entry inline `--depth`
(`[style*="--depth: 1"]` = h3 cyan, `[style*="--depth: 0"]` = h2 green; flags render at `--depth: 1` and
are excluded so they stay gold, verified in the real DOM). Mobile now mirrors the full desktop
active-color set (current h2 green, current h3 cyan, flags gold); non-current entries keep Starlight's
white + checkmark default. Unlayered CSS so it beats Starlight's layered green/white; parity with the
heading rules is by shared tokens. See DECISIONS 2026-06-29, 2026-07-10, 2026-07-11.

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
cyan hover), set apart by a gap + a `--sl-color-hairline` divider, desktop-only, self-hides unless a page
has two or more toggles (a bulk expand/collapse is pointless with 0 or 1; the `>= 2` threshold clears every
single-toggle page automatically). Acts on `.sl-markdown-content details.toggle:not(.toggle-flag)` (skips flags, code, nav).
Preserves reading position: anchors on the current heading and corrects scroll synchronously, with native
`overflow-anchor` suppressed for the operation (see DECISIONS; ROADMAP has the unverified few-pixel shift).

## 7. Content Pipeline (Notion → site)

1. Author the writeup in **Notion**, export as Markdown.
2. **Polish it by hand into convention-compliant MDX.** The content pipeline is deliberate manual
   editorial polish of each writeup against a Notion template, not a text-transformation script. The
   gap between a raw Notion export and the intended finished writeup is an editorial-judgment problem
   that no text-transformation script resolves: a script can normalize syntax, but it cannot make the
   editorial calls that define the site's writeup quality. Apply the MDX conventions below by hand.
   - Place the file at `src/content/docs/{platform}/{difficulty}/{slug}.mdx`. The `{difficulty}` dir is
     lowercase (`easy`/`medium`/`hard`/`misc`): the sidebar `autogenerate.directory` is case-sensitive
     (e.g. `hackthebox/easy`) and must match the on-disk lowercase dir; a case-only rename needs
     `git mv` on Windows (`core.ignorecase=true`).
   - Copy + rename screenshots into `src/assets/{platform}/{difficulty}/{slug}/`, then reference them
     from the writeup by a relative Markdown path (`../../../../assets/...`) so astro:assets optimizes
     + hashes them.
3. Commit + push → Cloudflare deploys.

### MDX conventions (applied by hand)
- Writeups are stored as flat .mdx files under src/content/docs
  (<platform>/<difficulty>/<machine>.mdx), one file per writeup with no per-writeup
  folder. Writeup images live in a parallel non-routable tree under src/assets
  (src/assets/<platform>/<difficulty>/<machine>/) and are referenced from the mdx
  with a relative Markdown path (../../../../assets/...) so they are optimized and
  hashed by astro:assets. Plain Markdown image syntax is used, not <Image />. Flat
  files allow Starlight sidebar autogenerate to render clean single entries with no
  phantom groups and no per-writeup config; new writeups require no astro.config.mjs
  change. Icons remain in public/icons; marketing images remain in public/images.
  Absolute /public image paths are not used for writeup content images.
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
- **Wargame passwords:** emit `<PasswordReveal password="..." />` inline, at the point in the walkthrough
  where the password is obtained (not frontmatter, not appended at the end). No import line needed: a
  remark plugin (`plugins/remark-inject-passwordreveal.mjs`, wired via astro.config `markdown.remarkPlugins`)
  detects the tag in the MDX AST at build time and conditionally injects
  `import PasswordReveal from '@components/PasswordReveal.astro'`, only in files that actually use the
  component and only if they have not already imported it. Supersedes the manual per-file import used when
  PasswordReveal first shipped on `overthewire/bandit/0-1.mdx`. See DECISIONS 2026-07-05.
- `**Port 80**` → a cyan mono `.port-label` tag (was red; harmonizes with the recon callout, out-ranks
  inline code by weight; inside `.cl-recon` a port list becomes an aligned findings table with an
  `Assessment` eyebrow, see DECISIONS 2026-07-04). Inline code (`:not(pre) > code`) → a rounded NEUTRAL chip with red
  text (identity in the glyphs, no red in the fill or border), its own object (readability-first,
  theme-tuned, deliberately distinct from the sharp code blocks);
  inside a colored callout it instead harmonizes with that callout's accent (reads `--acc` / `--cl-ink`,
  generic per type); see DECISIONS 2026-06-29.
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

### Badge icon sourcing

Badge icon sourcing follows consumption mechanism. Platform logos: native-color <img> via
hashed ?url import, with a forced public/icons copy for the CSS sidebar backgrounds. Linux:
native-color <img> (multicolor, not a tintable glyph). Category marks (Windows, Active
Directory, Progressive, Standalone): inline SVG with currentColor so they tint to the chip
accent in both themes, sourced from src/assets/icons/ (import-graph requirement). The registry
src/components/badges/icons.ts is the single source of truth mapping each enum value to its one
icon. assetsInlineLimit stays at the Vite default (size-based inline vs hashed-file split).

## 8. Conventions & Non-Negotiables

- **NO em dashes** anywhere in site copy (use commas, colons, parentheses). Owner finds
  them "scream AI." Applies to all generated website text.
- **Tone:** confident, curious, learning-focused. No self-deprecation.
- **Type-safe scripts:** all TS inside `.astro` `<script>` uses explicit assertions
  (`as NodeListOf<HTMLElement>`, `as HTMLElement | null`, `!`, `?? ''`) → zero VS Code problems.
- **Code blocks:** every block has a language label; bash and python render identically; EC frames are
  square-cornered (sharp) in both themes (DECISIONS 2026-06-29).
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
