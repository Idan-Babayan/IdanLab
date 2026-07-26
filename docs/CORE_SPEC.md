# Idan.Lab — Core Spec (Source of Truth)

> **Status:** living document. This is the canonical reference for the Idan.Lab project.
> Update it whenever a durable fact changes. If something here conflicts with a chat,
> THIS FILE WINS. Volatile work lives in `ROADMAP.md`; rationale lives in `DECISIONS.md`.
> Last updated: 2026-07-26.

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
├─ astro.config.mjs                   # Starlight config: site, sidebar, customCss[layers.css, fonts.css, then the eight theme modules tokens/base/prose/chrome/components/pages/utilities/overrides, in that order], EC themes + pluginPrivCommand, reading-progress head script (no font preloads, see DECISIONS 2026-07-07), image-zoom, vite alias, components overrides (PageSidebar + Footer), markdown remarkPlugins (content-taxonomy validation guard + PasswordReveal import injection) + rehypePlugins (content image loading)
├─ src/
│  ├─ content.config.ts               # docs collection (docsLoader + docsSchema), extended with the WriteupMeta metadata as STRICT optional enums (os Linux|Windows, environment Standalone|Active Directory|Progressive, difficulty Easy|Medium|Hard|Insane) plus optional badges boolean, tags, principle. NO platform field: platform is derived from the directory. Enums mirror src/components/badges/icons.ts exactly
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
│  │  ├─ PasswordReveal.astro         # amber wargame secret waypoint, TWO modes derived from the slot: INLINE (prop: password) blur-to-reveal then copy-in-place, BLOCK (slot content + prop: label) collapses a multi-line secret as a <details class="toggle pwreveal-block">, no copy button. Both wear one amber (--otw-amber accent / --otw-amber-ink AA text ink / --pw-amber-rgb wash base). Deliberately distinct from FlagCapture (no gold, no decode animation); replaced the retired .spoiler-toggle class; no per-file import needed, see plugins/remark-inject-passwordreveal.mjs
│  │  ├─ ToggleAll.astro              # Expand/Collapse-all control (vanilla TS, scroll-anchored); injected via PageSidebar override
│  │  ├─ AttackPath.astro             # guided infographic for a LINEAR priv-esc chain (ascending escalating path, SVG connectors, Next-step progression, one-time gold flourish); data-driven from a nodes[] prop, scoped styles, not-content. See DECISIONS 2026-07-19
│  │  ├─ Callout.astro                # icon-based tagged callout (recon/loot/intel/vuln/defense); .cl styles in components.css
│  │  ├─ Principle.astro              # closing epigraph (aside.principle, prop: text): centered italic mono maxim + dinkus + PRINCIPLE label; no card/border/bg; .principle styles in components.css
│  │  ├─ WriteupCard.astro            # presentational writeup card (props only, reusable for a future /writeups index)
│  │  ├─ PlatformIndex.astro          # data + hero + difficulty filter + WriteupCard grid; ported homepage effects
│  │  ├─ NotFound.astro               # 404 breadcrumb body (nudges to /robots.txt)
│  │  ├─ SecretTerminal.astro         # from-scratch, zero-dependency vanilla-TS fake terminal
│  │  └─ overrides/
│  │     ├─ PageSidebar.astro         # additive Starlight override: renders <Default/> then <ToggleAll/> at the bottom of the right TOC
│  │     └─ Footer.astro              # additive Starlight override: auto-appends the <Principle> coda from frontmatter and suppresses pagination on writeups that carry one
│  ├─ lib/
│  │  └─ ec-priv-command.mjs          # EC plugin: tags command words by category (priv/recon/net/inspect)
│  └─ styles/                         # the theme pass, split into cascade-layer modules (see §5 "The layer contract")
│     ├─ layers.css                   # the order statement `@layer starlight, tokens, base, prose, chrome, components, pages, utilities;` plus the cascade contract and the unit rule. First customCss entry
│     ├─ fonts.css                    # self-hosted @font-face (subset WOFF2: Syne, JetBrains Mono, Geist) + metric-matched fallbacks for each; loaded via customCss and imported by the marketing pages. The one module with no layer statement
│     ├─ tokens.css                   # @layer tokens: every custom property (surfaces, accents, flag gold, OverTheWire amber pair, the prose/chrome type scale). Also owns the prose/chrome type token block (see §6)
│     ├─ base.css                     # @layer base: the zero-specificity defaults under everything, today the shared focus ring
│     ├─ prose.css                    # @layer prose: the reading surface inside .sl-markdown-content (type, rhythm, links, quotes, the raw <details> default)
│     ├─ chrome.css                   # @layer chrome: header, sidebar, TOC, code frames, scrollbars, the three-column layout, light-mode depth
│     ├─ components.css               # @layer components: badges, toggles, callouts, FlagCapture, PasswordReveal, Principle, WriteupMeta
│     ├─ pages.css                    # @layer pages: whole-page treatments (splash hero, platform index, the reveal state rules)
│     ├─ utilities.css                # @layer utilities: single-purpose helpers that must sit above the named layers, today .sr-only
│     └─ overrides.css                # THE ONLY UNLAYERED SURFACE. The 14-rule tail, each rule carrying an evidence comment naming what it beats (see §8 "The layer law")
├─ plugins/
│  ├─ rehype-content-image-loading.mjs # rehype: sets loading/decoding on content <img> (first eager, rest lazy); wired via astro.config markdown.rehypePlugins
│  ├─ remark-inject-passwordreveal.mjs # remark: conditionally injects `import PasswordReveal from '@components/PasswordReveal.astro'` into an MDX file's AST at build time, only when that file uses <PasswordReveal/> and has no import of its own; wired via astro.config markdown.remarkPlugins
│  ├─ remark-inject-writeupmeta.mjs   # remark: injects the <WriteupMeta/> badge row + its import into every writeup at build time. platform is DERIVED from the platform directory (hardcoded map, the single source of truth); os/environment/difficulty are read from frontmatter via file.data.astro.frontmatter and forwarded only when a non-empty string. Gated on the writeup path (non-index .mdx under the four platform dirs), so nothing else can be injected. badges: false opts out; a non-boolean badges FAILS the build (YAML parses no/off/"false" as truthy strings). Transformer must be (tree, file) to see frontmatter. Zero deps (unist-util-visit + acorn). See DECISIONS 2026-07-20
│  └─ remark-validate-content-taxonomy.mjs # remark: build-time guardrail that FAILS the build on an unknown hand-authored badge/metadata class token (meta-badge / platform-* / difficulty-* / os-* / port-label / task-title; the machine-meta family was removed 2026-07-19) or an unknown component metadata value (Callout type, FlagCapture type user|root; the WriteupMeta prop enums were retired 2026-07-20 once the component stopped being hand-placed, and now live in the Zod schema instead), with a "did you mean" suggestion; the deliberate alternative to astro check; zero deps (unist-util-visit); its allow-lists are the single source of truth; wired via astro.config markdown.remarkPlugins. See DECISIONS 2026-07-12 and 2026-07-20
└─ public/
   ├─ robots.txt                      # in-repo; breadcrumb comment + Sitemap line (see §2)
   ├─ favicon.svg                     # site favicon
   ├─ fonts/*.woff2                   # self-hosted subset fonts (Syne 600/700/800; JetBrains Mono 400/500/700 + 400/500 italic; Geist 400/600/700 + 400 italic); served at /fonts/
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

- **The "theme pass"** = the CSS-only module set in `src/styles/` that overrides Starlight's design
  tokens so docs match the marketing pages. It does NOT touch Starlight functionality.

### The layer contract

The theme pass is organised into declared cascade layers, one module per layer, wired in
`astro.config.mjs` in this order: `layers.css`, `fonts.css`, then `tokens`, `base`, `prose`, `chrome`,
`components`, `pages`, `utilities`, `overrides`.

- **`layers.css` declares the order:** `@layer starlight, tokens, base, prose, chrome, components,
  pages, utilities;`. `starlight` is named FIRST so Starlight's own `starlight.*` sublayers sit below
  every layer of ours, which is what replaced the old "we are unlayered, so we win" posture.
- **Every module repeats that statement on its first line** (all except `fonts.css`), so any bundler
  chunk order still establishes the same order. Repeats after the first occurrence are no-ops.
- **Layer order decides precedence, not file order and not selector weight.** Selector weight only
  orders ties WITHIN a layer. A rule does not need to out-specify a rule in an earlier layer, which is
  why the specificity armor the theme pass used to carry (stacked `html[data-theme]` prefixes and the
  like) was retired rather than migrated.
- **`overrides.css` is the only unlayered surface.** See §8 "The layer law" for what may live there.
- **Theme behavior:** homepage is **dark-only** (identical on every device). About + all
  writeups support **light/dark**, synced via Starlight's `localStorage['starlight-theme']`
  key + `data-theme` on `<html>`. About **defaults to dark** (light is opt-in).
- **Content-embedded components:** platform landings, the 404, and `/secret` are Starlight docs
  that embed scoped Astro components via MDX (`PlatformIndex`, `NotFound`, `SecretTerminal`). They
  carry Starlight's `not-content` class so prose styling skips them; most of our prose rules in
  `prose.css` are guarded with `:not(:where(.not-content *))`. Astro scopes component styles with
  `:where()` (zero specificity), so component CSS never out-ranks a global rule on selector weight.
  What actually protects a component subtree is that an Astro scoped style is UNLAYERED, and unlayered
  author CSS beats every layered rule regardless of weight. See §8 "The two instruments".
- **Hiding a page from nav:** the sidebar is hand-curated in `astro.config.mjs`, so a new doc is
  hidden by simply not listing it (e.g. `/secret`); add `pagefind:false` + a noindex `head` meta
  to keep it out of search.

## 6. Design System — "Decrypted"

### Tokens (canonical)
- **Surfaces (dark):** `--ink #07090a`, `--ink-2 #0d1113`. **(light):** paper `#ece9e0`, `#f7f5ee`.
- **Text (dark):** `--text #e9f1ee`, `--muted #79857f`. **(light):** `#12181a`, `#586460`.
- **Accents (dark):** lime `#b6ff3c`, cyan `#41efff`, magenta `#ff4d9d`.
- **Accents (light, darkened for contrast):** lime `#4d7c0f`, cyan `#0b7e92`, magenta `#c41d6f`.
- **Fonts:** display = **Syne** (600/700/800); code/chrome/UI = **JetBrains Mono** (400/500/700, plus italic
  400/500 for the Principle coda maxim); **writeup prose = Geist** (400/600/700 plus a true drawn italic 400).
  Self-hosted as subset WOFF2 in public/fonts/ (see src/styles/fonts.css), with metric-matched
  size-adjust fallbacks so the font swap is shift-free; no Google Fonts origin. See DECISIONS 2026-07-04
  (self-hosting) and 2026-07-25 (the Geist prose face and the prose/chrome split below).
- **Starlight var overrides:** `--sl-color-accent` = lime, `--sl-color-bg` = ink,
  `--sl-font` = JetBrains Mono. Headings forced to Syne via CSS.

### Prose vs chrome typography split (writeup bodies)

Writeup PROSE is Geist; everything else on a content page stays JetBrains Mono. The rule that makes this
safe: **`--sl-font` / `--sl-font-mono` are deliberately NOT changed.** Geist is applied by a scoped rule,
so every surface not named in it (sidebar, TOC, breadcrumbs, pager, code frames, badges, headings in Syne)
is unchanged by construction rather than by exclusion. The tokens live in `tokens.css` and the rules in
`prose.css`. See DECISIONS
2026-07-25.

- **What Geist takes:** `.sl-markdown-content :is(p, li, blockquote, td, strong, em)`. `em` renders Geist's
  real drawn italic (italic angle -12, distinct letterforms), not a synthetic slant.
- **Two deliberate exclusions, both chrome wearing prose markup.** `.cl-header` (the `Callout` label row is
  authored as a `<p>`) keeps its uppercase mono; callout BODY prose stays Geist. `figcaption` is left
  untargeted because it is Expressive Code's code-frame title bar, not an image caption (image captions are
  `em` inside a paragraph, so they are covered).
- **Chrome does not track the prose body.** Mono chrome (inline code, `.port-label`) and component titles
  (toggle summaries, the `FlagCapture` button base, the `Principle` maxim) are pinned to FIXED rem sizes, so
  they hold when `--prose-size` moves; only true prose tracks it. Inline code also re-declares
  `font-family`, since it otherwise inherits Geist from its paragraph. `FlagCapture` needs a fixed base
  because its flag value (`1.02em`) and lock icon (`1.25em`) are em-relative to that button.
- **Everything is a token, in one block at the top of the theme pass:** `--body-face`, `--prose-size`
  (18.5px; the 18px variant is a one-line change to `1.125rem`), `--prose-leading`, `--prose-measure`
  (50rem, the full content column), `--prose-strong-weight`, `--mono-chrome-size`,
  `--component-title-size`, `--principle-maxim-size`, `--toggle-title-face` / `--toggle-title-weight`, and
  the spacing trio `--prose-paragraph-gap` / `--prose-heading-gap` / `--blockquote-pad-y` (+ `-pad-x`).
  Spacing stays `em` so it remains proportional to the text. Headings keep Starlight's own scale (no
  override), so the prose size does not drag them.
- **Two specificity rules that must not be "simplified":** the Principle maxim is targeted as
  `p.principle-text` (the plain class at (0,2,0) loses to the prose face rule at (0,2,1)), and the prose
  paragraph gap carries `:not(:where(blockquote *))` because `blockquote p { margin: 0 }` is only (0,1,2)
  and was being outranked, leaking ~2x the gap into every blockquote.
- **Toggle titles are one system:** `--toggle-title-face` / `--toggle-title-weight` (Geist 600) on
  `details.toggle:not(.toggle-flag) > summary`, so no toggle variant carries a bespoke face/weight; the gold
  flag toggle keeps its own identity.

### Focus ring system (keyboard accessibility)

The site's keyboard focus indicator. One token drives every ring COLOR; one shared rule draws every ring.
The token lives in `tokens.css` and the shared rule is the whole of `base.css`. This is an accessibility
feature first: it is how a keyboard
user knows where they are, so it is never removed, only aimed. See DECISIONS 2026-07-13 (the token system)
and 2026-07-17 (the geometry fixes).

**The token.** `--focus-ring` defaults on `:root` to the theme-aware site accent
`var(--sl-color-text-accent)` (lime `#b6ff3c` dark / `#4d7c0f` light). Nothing else needs to know a color.

**The shared rule.** One zero-specificity base rule paints the rectangular ring for every control:

```css
:where(a, button, [role="button"], input, select, textarea, summary, [tabindex]):focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
```

- `:focus-visible`, never `:focus`, so the ring is keyboard-only and does not fire on a mouse click.
- **`:where()` holds it at specificity 0 on purpose:** any element with a real geometric need can out-rank
  it without `!important` and without editing the shared rule. That escape hatch is load-bearing (see the
  code-frame exception below). Never add specificity to this rule.
- The rule sits in the `base` layer, which the order statement places above every `starlight.*` sublayer,
  so it beats Starlight's own styles without needing selector weight. Starlight 0.39.2 ships no
  `:focus-visible` outline of its own, so this IS the ring for every content-page control.
- Uniform 2px width everywhere. Contrast problems are fixed by changing the COLOR to an AA-grade token,
  never by thickening the line (see the light flag gold below).

**Identity, where it exists.** An element that already expresses a color sets `--focus-ring` to it, so the
ring echoes what the element is rather than inventing an identity. Everything else inherits lime.

| Element | `--focus-ring` |
| --- | --- |
| `WriteupCard` (`.wc-card`) | `--pf-accent` (its platform color) |
| The 4 platform sidebar groups | positional `nth-child`, theme-aware (HTB lime, VulnHub red, PicoCTF purple, OTW amber) |
| `FlagCapture` / `PasswordReveal` | gold `color-mix(--fc-id)` / amber `var(--otw-amber)` (`#ffc23d` dark, `#a86f04` light). A ring is non-text, so it reads the accent, not the ink |
| `ToggleAll` | `--pf-accent-2` cyan (its own hover identity; set in the component's scoped style) |
| TOC entries | the hue of the heading they point to: flags `--flag-gold-val`, h3 cyan, h2/h4+ lime |
| In-prose links | `--tp-cyan` / `--tp-cyan-ink` |
| `WriteupMeta` chips | `--wm-c` (live: the chips render on every writeup) |

**Light flag gold is the one contrast carve-out.** The decorative `--flag-gold` (`#C6A243`) rings at only
2.00:1 on paper, under the 3:1 a non-text indicator needs, so the flag ring reads the AA-grade
`--flag-gold-val` instead (dark is byte-identical `#ffc23d` at 12.39:1; light becomes the deeper antique
`#7a5a12` at 5.24:1). Identity kept, ratio fixed, width untouched.

**Geometry: the ring is drawn on the focused element, with two deliberate exceptions.**

1. **Content toggles** (`details > summary`). Starlight's `markdown.css` pairs
   `margin-inline-start: -0.5rem` with `padding-inline-start: 0.5rem` so the outline encloses the
   negatively-margined `::before` marker without moving it. Our unlayered summary padding once cancelled
   only the padding half, orphaning the margin and throwing every ring 8px off-center. The base summary
   rule now re-declares the pair, inset by the card's own padding difference
   (`0.75rem` inline minus `0.4rem` block = 5.6px), so the summary's box sits the same distance inside the
   card horizontally as vertically and all four ring deltas are equal. **If you ever change the toggle
   card's padding, this inset must change with it.**
2. **Expressive Code blocks.** EC core's "Scrollable block tabindex" JS module adds `tabindex="0"` plus
   `role="region"` to any `<pre>` that overflows (debounced ResizeObserver, so it appears after load and
   re-evaluates on resize). That tabindex is what the shared rule matches. But the `<pre>` is only the
   lower half of the frame (`figcaption.header`, the language tab, is a sibling above it), and the header
   is `position: relative; z-index: 1` over a static `pre`, so a ring on the pre both excluded the tab and
   had its top edge painted over. The ring is therefore moved to `figure.frame` via
   `:has(> pre:focus-visible)`, which spans header plus pre exactly. **Use `:has()`, never `:focus-within`**
   (that fires on pointer clicks too).

**Known behavior, not a bug:** clicking a wide code block DOES show the ring. Chromium matches
`:focus-visible` on a keyboard-scrollable region even for pointer focus, because arrow keys scroll it.
That predates the token system and is correct a11y.

**The one deliberate suppression:** `SecretTerminal`'s `.term-input` sets `outline: none`. That is
intentional and should stay: it is a fake terminal's command line, where the conventional focus indicator
is the caret (`caret-color: var(--t-lime)`), not a box around the input. It is the only interactive
element in that terminal and it is auto-focused. Nowhere else on the site is a focus indicator removed.

**Scope:** the `src/styles/` modules theme Starlight CONTENT pages only. The two standalone marketing pages carry
their own equivalent inline rings (`var(--lime)` + per-card `var(--accent)`); folding them into the same
token is an open ROADMAP item, not a bug.

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
  `NotFound` (404 body), `SecretTerminal` (vanilla-TS terminal), `AttackPath` (guided infographic for a
  LINEAR privilege-escalation chain: an ascending horizontal path whose nodes escalate toward the goal,
  structural SVG connectors that arrow into the next node with the privilege verb on the segment, a
  "Next step" progression with past/present/future states, and a one-time gold flourish at root. Built
  entirely from the site's own fabric so it reads as a native region, not a widget: the container is the
  Toggle / FlagCapture panel surface (`#f2ede0` light, a subtle lift dark) and the gold goal is derived
  exactly like FlagCapture's frame (decorative `--flag-gold`, AA text `--flag-gold-val`); accent is
  `var(--pf-accent, --sl-color-text-accent)` since the site does not platform-scope the accent in a writeup
  body. Ascent and escalation are COMPUTED from the node count (verified at 4/6/8 hops), so it is data-driven
  from `nodes: { kind, name, edge?, detail? }[]` with no chain hardcoded; runtime-guarded, scoped styles +
  `not-content`, AA in both themes, no branching. **Escalation rides the continuous font-SIZE ramp plus a
  single derived weight step** (Medium before the chain midpoint, Bold from it on): JetBrains Mono is subset
  to 400/500/700 only, so the earlier continuous weight calc silently snapped every intermediate value to
  700; the honest ramp uses only loaded faces. **Each connector's verb label rides PARALLEL to its segment**
  at a constant ~6.5px gap (tilted to the chord angle, computed from `rise`), which is the one rule that keeps
  every label the same distance from its line regardless of slope, label width, or line count. **Step dots
  carry a layout-neutral 24px-tall tap target** (`::after` overflow, the About-HUD convention) while the
  visible dot and focus ring stay 7px. **The edge fade-mask overlays a GUTTER, never the endpoint nodes:**
  one token `--ap-fade-w` (36px, 24px under the 50rem breakpoint) drives both the mask band AND the spine's
  inline padding, so the start and goal nodes come to rest exactly where the band ends (measured alpha 0),
  and the falloff is a smoothstep rather than an opaque plateau. This also makes the affordance self-truthing:
  a mask over empty gutter is surface-on-surface, so a fade only appears once real path runs under it. That
  token is the single knob for fade strength. **The past/present/future hierarchy is carried by COLOUR and
  scale, never by group `opacity`:** a future node is a clickable control, so fading its text with opacity put
  it under AA (measured 2.43:1 light), and opacity cannot be tuned out of that (the kind label needs ~0.88 to
  pass, which erases the state). Future names read the muted grey while done/active stay full-contrast.
  **The advance control uses `aria-disabled`, never the `disabled` property**, because `disabled` removed it
  from the tab order at the moment of the final keypress and dumped focus to `<body>`; the click path is
  guarded instead, and the hover rule is keyed off `:not([aria-disabled='true'])`. Node and dot accessible
  names carry the progress state word, since the check glyph is `aria-hidden` and `aria-current` marks only
  one node. Every node state and all chrome text measures AA in BOTH themes. Live on TWO writeups under
  `## Summary`: Forest (6 hops) and Return (5 hops); both keep their BloodHound graph above as evidence. See
  DECISIONS 2026-07-19 (original build + native-fabric rework) and 2026-07-20 (production-polish pass +
  Return instance; edge-mask gutter; production-readiness audit)), `badges/WriteupMeta` (navigational
  Platform/OS/Environment chip row + trailing hue-free Difficulty pip chip, under a writeup title;
  each nav chip is coloured via a single `--wm-c` per value, with a restrained glow (halo on dark,
  hue-shadow on light); Difficulty magnitude is filled+growing pips; chips render as non-interactive
  `<span>` today (the commented `<a>` + `data-astro-prefetch="false"` restore verbatim once the filter
  routes ship), `.not-content`; icons live in `badges/icons.ts` on a 14px grid; runtime-validates its
  union props. Colour model, icon sourcing, geometry and the light-mode AA palette are documented
  in the "Badge system (WriteupMeta)" blocks in §6 and §7. **`difficulty` is the one OPTIONAL prop**
  (`difficulty?: Difficulty`): omit it and the Difficulty chip does not render at all, which is how a
  progressive wargame with no difficulty rating (OverTheWire Bandit) is expressed. A difficulty that IS
  supplied is still validated, so a typo still fails the build; it is never given a fallback. The other
  three props are required. WriteupMeta is now the metadata row on EVERY writeup and has fully replaced
  the hand-authored `.machine-meta` badge row, which no longer appears anywhere in `src/content/docs`.
  **It is INJECTED, never hand-placed (2026-07-20):** `plugins/remark-inject-writeupmeta.mjs` builds the
  element from frontmatter, so no writeup imports or writes the component. `platform` is supplied by the
  injector from the directory and is not a frontmatter field; `os` / `environment` / `difficulty` come
  from frontmatter and are validated as strict enums by `content.config.ts`. The component's own runtime
  guard still throws on an unknown axis, so a bad value fails at the schema, and again at render.
  See DECISIONS 2026-07-20 (injection + validation consolidation), 2026-07-19 (optional difficulty + the
  34-page Bandit migration), 2026-07-17 (the three badge entries plus the testbed-drop entry) and 2026-07-10.
- Chrome (Starlight override): `ToggleAll` (Expand/Collapse-all control) auto-injected into the right
  "On this page" sidebar by `overrides/PageSidebar.astro` (renders `<Default/>` then the control).

### Starlight Component Overrides
- Starlight Component Overrides: Additive Starlight component overrides are an approved architectural pattern alongside the `src/styles/` theme modules and custom components.
- Override Strategy: Overrides should wrap and render `<Default />` (or the upstream component) and layer behavior, styling, or markup on top rather than copying or replacing upstream implementations.
- No Forking by Default Forking, duplicating, or fully replacing Starlight components is discouraged and should only be considered when the desired result cannot be achieved through an additive override.
- User Approval Required: Introducing a new Starlight component override is a structural architectural change and should be proposed and approved by the user before implementation.

### Platform palette (canonical, unified 2026-06-01)
One palette everywhere: HTB **lime**, VulnHub **red**, PicoCTF **purple**, OTW **amber** (used by
homepage cards, sidebar dots, about-page accents, and writeup badges). The old badge set (blue /
cyan / violet / orange) is retired. Because HTB lime overlaps Easy green, every `.platform-*` badge
carries a leading glowing dot so it never reads as a difficulty pill. (See DECISIONS 2026-06-01.)

### Badge system (WriteupMeta): colour model + light-mode AA palette
The `WriteupMeta` chip row (Platform / OS / Environment nav chips + a hue-free Difficulty chip) is
driven by ONE custom property per chip value, `--wm-c`. That single token drives the chip's label,
its monochrome icon (via `currentColor`), border (38%), fill (`color-mix(--wm-c 15%, transparent)`,
i.e. 15% identity over 85% surface), glow, and focus ring. There is deliberately NO separate text/ink
token (unlike `--flag-gold` / `--flag-gold-val`): everything `--wm-c` paints wants to move together.
- **Per-value hues:** platform = the canonical `--pf-accent` (HTB lime, VulnHub red, PicoCTF purple, OTW
  amber); OS/Env = identity colours (Windows blue, AD indigo, Standalone slate, Progressive teal, Linux
  a Tux amber). Dark values live on unprefixed selectors, light under `:root[data-theme='light']`.
- **Light labels are solved to WCAG AA, not eyeballed.** Each 12px/600 label must clear 4.5:1 on its own
  composited fill (over paper `#ece9e0`, no card); the light values are solved in OKLCH by holding hue,
  dropping lightness to ~4.8:1 (antialiasing margin), and holding chroma where sRGB allows / clamping to
  the gamut boundary where it does not. Hue is NEVER shifted to reach AA and chroma is never dropped as a
  shortcut (the §6 "chroma not contrast" lesson in reverse). Dark already passed everywhere and is
  untouched. **Amber is the structural worst case:** its sRGB gamut collapses as it darkens, so amber
  keeps only ~79% of its chroma at AA vs 88 to 100% for other hues; that loss is the price of AA itself,
  not a solver limit. See DECISIONS 2026-07-17.
- **`--wm-glow`** is set only where it earns its keep: the DARK `pf-htb --wm-glow` (`#9fef00`) holds HTB's
  true brand green while the label carries palette lime. No light `--wm-glow` exists (the light glows read
  `--wm-c` directly, so one would never render).
- **Linux vs OverTheWire (two ambers, adjacent on a Bandit row):** the Linux OS chip is re-hued to OKLCH
  H60 in BOTH themes (Tux's own beak/feet family, `#FFA63F` H65.6 / `#E68C3F` H57.9) so it never shares
  OTW's gold. Because light separates on fewer axes than dark, the Linux light value is also DEEPENED to
  L0.40: dark already separated on hue AND lightness, but light had matched lightness, so hue alone at low
  chroma did not read. Deepening restores the second axis (separation dEOK 0.065 light / 0.073 dark). The
  finding: an amber slot CAN hold two identities on paper, but only separating on lightness as well as hue.
- **The `#a86f04` fork, now six-way (was seven):** OTW, Linux, `.platform-overthewire`, `.pf-overthewire`,
  the sidebar focus ring, the spoiler toggle and PasswordReveal independently used the same light amber. They
  are semantically unrelated ambers that coincided on a hex, NOT a shared token, so they stay forked (the
  2026-07-17 pass moved the two badge ambers off it). Two of those users have since MERGED, legitimately:
  the spoiler toggle became PasswordReveal's block mode and both now read one shared token (2026-07-25),
  which is a real shared identity rather than a coincidence, so it is one entry.
  **Resolved for the OverTheWire family 2026-07-26:** that shared token became the
  `--otw-amber` / `--otw-amber-ink` pair, and the sidebar focus ring was routed onto the accent, so the
  PasswordReveal row, its block mode, the platform-index eyebrow and the rail ring are now ONE identity
  with a text variant, all measured to AA or the 3:1 non-text bar. `.pf-overthewire`'s display-size type
  (`.pi-name`, `.pi-num`) keeps the accent deliberately: it sits at the 3:1 large-text bar and passes at
  3.50:1. `.platform-overthewire` remains moot (it styles nothing since `.machine-meta` retired), and the
  Linux badge amber stays forked, correctly: it is a different identity that merely shares a hex.
  **Still open, and a different hue family:** the HackTheBox and VulnHub platform-index eyebrows measure
  4.11:1 and 4.16:1 on paper as 12.8px body text, both under 4.5:1. Same defect, different token, not
  covered by the amber pass (see ROADMAP).

### Light-mode identity (paper-native "risograph")
Light is art-directed on its own terms (dark is unchanged). All rules scoped to
`[data-theme='light']`, spread across the modules by concern (surfaces in `tokens.css`, chrome in
`chrome.css`, badges and callouts in `components.css`):
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
`ec-priv-command.mjs` tags command words by semantic category, colored in `overrides.css` (theme-aware,
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
- EC `{n}` line highlights get a decisive-line focus treatment (`chrome.css`, after the scrollbar rules):
  `.ec-line.mark` gets a lime gutter bar + a low tint (dark accent 10%, light `--tp-deco-lime` 12%) that
  sits under the command-token colors. The `chrome` layer outranks every `starlight.*` sublayer, so it
  overrides EC's default blue marked
  line cleanly (no `styleOverrides`). See DECISIONS 2026-07-04.

### Tagged callouts (icon-based, `Callout.astro` + `.cl*` in `components.css`)
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

**Two modes, one component, one amber (2026-07-25).** A wargame secret comes in two shapes and the
interaction follows the shape:

| Mode | Trigger | Behavior |
| --- | --- | --- |
| **INLINE** | `password` prop, no slot | one-line password: blurs in place, copy control (the original) |
| **BLOCK** | slot content, no `password` prop | multi-line secret (an RSA private key): collapses as a `<details>` |

Inline secrets blur, block secrets collapse: a secret running to many lines cannot be blurred as one inline
run. **Mode is derived from the slot, never guessed** (`Astro.slots.has('default')`); passing both or
neither throws at build time rather than silently picking a branch. Block mode takes a `label` prop for its
summary and carries `.toggle`, so it inherits the standard toggle card, the disclosure marker, ToggleAll's
bulk expand, and the shared toggle-title face/weight. **Block mode has NO copy button on purpose:** the keys
it holds are truncated for publication (see the private-key truncation rule), so a copy control would hand
over a broken key. This replaced the one-off `.spoiler-toggle` class, which existed only because the inline
component could not hold a block secret; that class is retired and appears nowhere in `src/`.

**The amber has one source, split into an accent and an ink (2026-07-26):** `--otw-amber` (the identity;
non-text only: borders, focus rings, bars, and display-size type. `#ffc23d` dark / `#a86f04` light),
`--otw-amber-ink` (the AA text ink for body-size text: `#ffc23d` dark, unchanged, / `#7c5000` light) and
`--pw-amber-rgb` (the `#f59e0b` wash base, consumed as `rgba(var(--pw-amber-rgb), alpha)` for tints and
hairlines). The pair supersedes the single `--pw-amber`, which could not serve both jobs on paper: it
failed AA as body text on every surface it landed on (3.21:1 on the PasswordReveal row, 3.64:1 on the
toggle card, 3.50:1 on paper) while being exactly right as a border and ring. Both modes read them, so they cannot drift
apart. Declared on the bare `:root` fallback as well, per this file's convention, so an absent `data-theme`
can never leave the var undefined and invalidate every `rgba()` reading it. Custom properties are safe here:
the failure that once made this block literal-only was `color-mix()` indirection, not the properties
themselves. `.pwreveal-block`'s two border rules keep the `html[data-theme]` prefix inherited from the
retired class, and still need it (see the specificity note in the CSS).

The inline mode, unchanged, in detail:

`PasswordReveal.astro` is the wargame-password counterpart to FlagCapture,
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
`--pw-amber-rgb` washes/borders (dark 0.08 fill / 0.4 border, light 0.14 fill / 0.55
border, stronger and more golden), matching the site's canonical OverTheWire system, the same values the
retired spoiler class used. The button text/icon is the OTW ink `--otw-amber-ink` (`#ffc23d` dark /
`#7c5000` light), with a `--pw-amber-rgb` border/hover wash; its focus ring reads the accent `--otw-amber`.
The ink was solved against the button's HOVER surface, not its resting one, because hover paints its own
amber wash under the label and is therefore the worst case (4.78:1 hovered, 5.28:1 at rest). Every value behind those two tokens is a literal hex/rgba
(no `color-mix()` custom-property indirection, after an intermediate token-based pass rendered as a
neutral/near-black box in practice), deliberately NOT `--flag-gold`. The only motion is the blur-to-clear
filter transition, gated behind `prefers-reduced-motion: no-preference`; the value's `:hover` rule
deliberately does NOT declare `filter` at all (an earlier `filter: inherit` attempt resolved to the
parent's "none" and silently un-blurred the still-locked password on hover, see DECISIONS). Styled in
`components.css` immediately after the `.pwreveal-block` rules; the shared `.sr-only` utility it relies on
lives in `utilities.css`.
Inline mode is live on 32 of the 34 Bandit level pages (rollout completed 2026-07-11); of the two
exceptions, `16-17.mdx` is now BLOCK mode (its RSA private key) and one level has no password to reveal.
See DECISIONS 2026-07-05 (inline) and 2026-07-25 (block mode + the shared amber).

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
- **Metadata is FRONTMATTER ONLY.** Declare `os`, `environment` and (where the content has a rating)
  `difficulty` in frontmatter, and write nothing in the body: the badge row and its import are injected by
  `plugins/remark-inject-writeupmeta.mjs`. Never author a `<WriteupMeta />` tag or import it. `platform` is
  NOT a frontmatter field, it is derived from the writeup's directory. Omit `difficulty` for a progressive
  wargame (Bandit) and no chip renders. Set `badges: false` (unquoted boolean, never `no` or `off`) to opt a
  writeup-path page out entirely. The description is still repeated as a `>` blockquote lead.
- Long/indented code → wrapped in `<Toggle>`; all code blocks get `frame="code"` + a
  language `title` so bash and python look identical.
- Notion `<aside>` → `:::tip[Answer]`. Task headings → brown `.task-title`.
- **Flags:** emit the gold heading `### <span class="task-title">User Flag</span>` (or `Root Flag`)
  immediately followed by `<FlagCapture type="user" flag="..." />` (or `type="root"`), and add
  `import FlagCapture from '@components/FlagCapture.astro'`. This replaces the old heading + duplicate
  `<Toggle flag>` + `:::tip[Answer]`. Handle user-only and root-only writeups (emit only the flag that
  exists). See DECISIONS 2026-06-27.
- **Wargame secrets:** emit `PasswordReveal` at the point in the walkthrough where the secret is obtained
  (not frontmatter, not appended at the end). Pick the mode by the secret's SHAPE, never by preference:
  - one-line password → `<PasswordReveal password="..." />` (inline: blurs in place, copyable).
  - multi-line secret, e.g. an RSA private key → `<PasswordReveal label="Reveal private key">` wrapping a
    fenced block, then `</PasswordReveal>` (block: collapses). Truncate the key first (see the
    private-key rule); block mode has no copy button precisely because the value is truncated.
  Passing both a `password` prop and slot content, or neither, fails the build on purpose. Never reach for a
  bare `<Toggle>` with a bespoke class for this, which is what the retired `.spoiler-toggle` was.
  No import line needed in either mode: a remark plugin (`plugins/remark-inject-passwordreveal.mjs`, wired
  via astro.config `markdown.remarkPlugins`) detects the tag in the MDX AST at build time and conditionally
  injects `import PasswordReveal from '@components/PasswordReveal.astro'`, only in files that actually use
  the component and only if they have not already imported it. It matches `mdxJsxFlowElement` by name, so a
  block-mode tag WITH children is detected exactly like a self-closing inline one. Supersedes the manual
  per-file import used when PasswordReveal first shipped on `overthewire/bandit/0-1.mdx`.
  See DECISIONS 2026-07-05 and 2026-07-25.
- `**Port 80**` → a cyan mono `.port-label` tag (was red; harmonizes with the recon callout, out-ranks
  inline code by weight; inside `.cl-recon` a port list becomes an aligned findings table with an
  `Assessment` eyebrow, see DECISIONS 2026-07-04). Inline code (`:not(pre) > code`) → a rounded NEUTRAL chip with red
  text (identity in the glyphs, no red in the fill or border), its own object (readability-first,
  theme-tuned, deliberately distinct from the sharp code blocks);
  inside a colored callout it instead harmonizes with that callout's accent (reads `--acc` / `--cl-ink`,
  generic per type); see DECISIONS 2026-06-29.
- Bold inside code fences is impossible (markdown); to emphasize a code line, manually
  use expressive-code line highlighting, e.g. ` ```bash {3} `.

### Badge / tag system (canonical colors in `components.css`)
- Platform (badges): htb lime, vulnhub red, picoctf purple, overthewire amber (each with a
  leading glow dot; canonical palette, see §6).
- Difficulty: easy green, medium amber, hard red, misc slate.
- OS: linux slate, windows blue.
- Topic `.tag-*`: web orange, crypto teal, forensics amber, reversing pink, pentest green, etc.
- **`.machine-meta` RETIRED 2026-07-19; the REST of the family is LIVE.** No writeup hand-authors a badge
  row any more (WriteupMeta replaced the last of them, the 34 Bandit pages), so the `.machine-meta`
  container rule is deleted from the theme pass and its `machine-` family from the taxonomy guard. Nothing
  else went with it: `WriteupCard.astro` emits `meta-badge`, `difficulty-*`, `os-*` and (behind
  `showPlatform`) `platform-*`, and `PlatformIndex` renders those cards on every `{platform}/index.mdx`,
  so those rules are live on all four landing pages. `platform-*` renders 0 times today but is the
  `showPlatform` path reserved for the planned `/writeups` index, so it is wired, not dead. Measured in
  `dist`: `meta-badge` 6, `difficulty-*` 3, `os-*` 3, `machine-meta` 0. See DECISIONS 2026-07-19.
- **Frontmatter metadata (updated 2026-07-20):** `content.config.ts` extends `docsSchema` with strict
  optional enums for `os` (`Linux | Windows`), `environment` and `difficulty`, plus an optional `badges`
  boolean, `tags`, and `principle`. Since the injection migration EVERY writeup sets `os` and
  `environment` in frontmatter, so `WriteupCard`'s OS chip now has a value on every writeup it renders
  (it still only maps linux/windows, which is exactly what the enum permits). `tags` stays deliberately
  unused until writeup volume makes a tag filter earn its place (see ROADMAP).

### Badge system (WriteupMeta): icon sourcing, geometry, a11y

Icon sourcing splits by **POLYCHROME vs MONOCHROME**, not logo vs glyph (corrected 2026-07-17; see
DECISIONS). `src/components/badges/icons.ts` is the single source of truth mapping each enum value to one
icon.
- **Polychrome marks** (VulnHub, PicoCTF, OverTheWire, Linux): native-color `<img>` via hashed `?url`
  import. They carry 3 to 16 fills (Linux is Tux plus gradients), so `currentColor` would flatten them.
- **Monochrome marks** (HackTheBox, Windows, Active Directory, Progressive, Standalone): inlined via `?raw`
  + `set:html` and tinted from `--wm-c` (`currentColor`) in both themes. Sourced only from
  `src/assets/icons/` (inlining requires importing, and `public/` is not in the import graph); Standalone is
  authored inline in `icons.ts` (no file). HackTheBox is a platform LOGO but is monochrome (one path, one
  fill), so it lives here, not with the `<img>` logos.
- **Geometry: a 14px grid.** Every glyph's larger ink dimension renders at ~14px in the 15px `.wm-ico` box,
  measured by rasterizing each glyph alone and taking its ALPHA bounding box (not path data). Only HackTheBox
  (letterboxed by a non-square viewBox) and Linux (a backdrop disc that defined its box) were off; the other
  seven already clustered. Standalone and Active Directory are slated for an artwork redraw ONTO this grid.
- **`public/icons` copies:** the three polychrome PLATFORM logos (VulnHub, PicoCTF, OverTheWire) are ALSO
  copied under `public/icons`, consumed by `PlatformIndex.astro` and `about.astro` by literal `/icons/` path.
  The sidebar is NOT a consumer: it uses colored dots, and the commented-out logo block this note used to
  cite as the alternative was deleted from the theme pass in the Phase 4a dead-rule purge. `public/icons/htb.svg`
  is RETAINED as the brand mark for those marketing surfaces and now deliberately DIVERGES from the inlined
  monochrome `src/assets/icons/htb.svg`; the former byte-identity was coincidental.
- **Accessibility:** every inline glyph carries `aria-hidden="true"`, so each chip's accessible name is
  exactly its text label. A build-time `inline()` normalizer in `icons.ts` strips comments, inter-element
  whitespace and the XML prolog from inlined glyphs (an `<?xml?>` prolog becomes a bogus comment node in an
  HTML document), keeping chip `textContent` clean. `active-directory.svg`'s `<metadata>` creator credit
  (Amido Limited / Richard Slater, upstream CC0-1.0) is KEPT: it does not enter the accessibility tree, and a
  comment is not a safe home for it (the normalizer strips comments).
- `assetsInlineLimit` stays at the Vite default (size-based inline-vs-hashed split for the `<img>` assets).

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
- **Never rebuild Starlight**; content pages are themed via the `src/styles/` modules only.
- Real name is fine on the public site.

### The layer law

- **No `!important` inside a layer.** `!important` reverses layer order, so an important declaration in a
  late layer is WEAKER than one in an early layer. That inversion is a trap, so the theme pass keeps
  important declarations out of the layered modules entirely.
- **The tail contract.** `overrides.css` is the only unlayered surface, and a rule earns a place there on
  exactly one of two grounds: it must beat unlayered CSS (a vendor stylesheet, an inline style, or one of
  our own Astro-scoped component styles, all of which sit above every layer), or it carries `!important`.
  Every tail rule carries a comment naming what it beats. The tail is 14 rules today: nine `.ec-cmd-*`
  colour rules (they beat Expressive Code's inline per-token styles), the two `.pi-index .reveal`
  transition rules and the V3 light card shadow (they beat WriteupCard's and PlatformIndex's own scoped
  styles), the `.flagcap` reduced-motion kill, and the OverTheWire platform-index eyebrow ink.
- **Growing the tail is a decision, not a convenience.** Reach for a layer first; the tail is for cases
  where layering provably cannot work, and "provably" means measured in a browser, not argued.

### The two instruments

Reach and precedence are separate mechanisms and are routinely confused:

- **`.not-content` governs REACH.** It is a scoping guard on our prose selectors, written
  `:not(:where(.not-content *))`. Matching Starlight's own convention, it excludes DESCENDANTS of a
  `.not-content` element, not the element itself. So a component root that carries the class is still
  matched by a rule that names it, and such self-carriers are resolved by precedence, never by the guard.
  A rule that carries no guard (the bare `:not(pre) > code` inline-code chip, for one) reaches into every
  component subtree regardless of `.not-content`.
- **Layer order governs PRECEDENCE, and components win where they speak.** An Astro scoped style is
  unlayered, so it beats every layered rule of ours at any selector weight. That is the real reason a
  component's own styling holds inside its subtree, and it is the mechanism to cite, not the guard.
- Consequence: to override a component from the theme pass, a layered rule is not enough. It takes a tail
  rule, under the contract above.

### The `--sl-color-white` inversion rule

Starlight's `--sl-color-white` and `--sl-color-black` INVERT per theme: white resolves to the page's
foreground, which is near-black on the light paper. A theme-agnostic declaration that reads one of them
therefore flips meaning between themes. Any such use must be deliberate and must carry a warning comment
saying so; if the intent is a literal colour, write the literal. This already bit the light `h1#_top`
gradient, whose start stop would have vanished on paper had it used the token.

### Dead in effect, not just unreferenced

A rule that matches live elements but always LOSES is dead in effect. It is deleted, never migrated: a
cascade reordering can silently revive it, so carrying it into a new layer structure converts a harmless
no-op into a live regression. Deadness is established by measurement (does it win anywhere, on any real
page, in either theme), not by reading the selector. The Phase 4a purge removed rules on exactly this
ground, including a `.hero h1` duplicate that `h1#_top` outranked in both themes.

### Selector weight, and the flatten that is not happening

Inside a layer, selector weight still orders ties, so it remains a legitimate tool for expressing "this
specific case beats that general one" within a single concern. What it is no longer used for is
out-ranking another layer. **Selector flattening is formally dropped from this workstream**, in this and
any future phase: the remaining multi-part selectors either express real precedence within their layer or
are load-bearing against unlayered CSS, and flattening them buys tidiness at the cost of the behavior the
layer contract just made legible. Unit conversions are likewise deferred to the retune (see the unit rule
in `layers.css`).

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
