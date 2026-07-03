# Idan.Lab — Decisions Log

> Append-only. Newest at top. Each entry records a decision and *why*, so future-you (and
> Claude) never re-litigate settled questions. Format: date · decision · rationale · status.
> When a ROADMAP item is resolved, record the decision here.

---

### 2026-06-30 · Content images and writeup structure: flat files + parallel src/assets (supersedes colocated index.mdx)

Supersedes: the prior decision to colocate writeup images next to each writeup
and name each writeup index.mdx.

Decision: Writeups are flat .mdx files under src/content/docs (one file per
writeup, no per-writeup folder). Their images live in a parallel tree under
src/assets mirroring the content path (src/assets/<platform>/<difficulty>/<machine>/).
Images are referenced from the writeup with a relative Markdown path
(../../../../assets/... , four ../ from a difficulty-tier writeup) so Astro's
built-in astro:assets pipeline optimizes and hashes them. Plain Markdown image
syntax is used, not <Image />, to avoid per-image import boilerplate across many
hand-authored writeups and to keep starlight-image-zoom coverage of content
images intact.

Why the reversal: Colocating images forced each writeup into its own folder, and
Starlight sidebar autogenerate renders every folder as a collapsible group, so a
single-page writeup folder became a phantom group wrapping one page. Keeping
colocation required either accepting phantom groups or hand-listing every writeup
in astro.config.mjs; both were rejected. Flat files let autogenerate produce clean
single entries with zero manual config and no phantom groups, matching the Bandit
pattern. Images under src/assets keep full astro:assets optimization, so no
performance is lost. The costs given up (physical colocation, clean image paths)
have low practical value for a single-repo site and did not justify the recurring
sidebar cost.

Boundaries: Icons remain in public/icons. Marketing images remain in public/images.
The rehype lazy-loading plugin and notion_cleaner.py are unchanged. No user-facing
URLs change; writeups keep their routes (/hackthebox/<difficulty>/<machine>/) and
images are served as hashed astro:assets under /_astro. Sitemap and Search Console
are unaffected.

Convention going forward: a new writeup is added as a single flat .mdx file in the
appropriate difficulty folder, with images placed under the parallel src/assets
path and referenced via the relative ../ path. Autogenerate surfaces it
automatically; no astro.config.mjs edit is needed per writeup.

### 2026-06-29 · Inline code inside a colored callout harmonizes with the callout accent
- **Problem:** the standalone red inline-code chip (see the entry below) clashed inside a colored
  callout: two reds in a `vuln` callout (worst in dark, where the callout tint is more saturated), and
  red code also fought the cyan / violet / green / amber callouts.
- **Decision:** inline code inside `.cl` (Callout.astro) drops the standalone red chip and adopts the
  callout's OWN accent, generically, by reading the callout's existing `--acc` / `--cl-ink` tokens, so
  every type (recon / loot / intel / defense / vuln) adapts with no per-type rule: text = the accent,
  fill = a soft SAME-accent tint (quiet emphasis, not a hard chip), the hairline is dropped
  (transparent), and the rounded corners + mono carry over from the standalone rule.
- **Per theme:** DARK text = bright `--acc`, fill = `color-mix(in oklab, var(--acc) 16%, transparent)`.
  LIGHT text = `color-mix(in oklab, var(--cl-ink) 80%, #000)` (the callout ink deepened ~20%, because the
  vuln / loot / defense inks sit only ~4:1 on the callout tint and body-size code needs AA 4.5:1), fill =
  `color-mix(in oklab, var(--acc) 13%, transparent)`.
- **Scope:** `.cl :not(pre) > code` only, so standalone inline code and every code block (in `<pre>`) are
  untouched.
- **Verified** on busqueda (all five callout types, both themes): code takes each callout's accent; AA on
  the chip is dark 6.7 to 14.4:1, light 5.6 to 7.8:1; the standalone chip is unchanged. `npm run build`
  green (44 pages).
- **Status:** Adopted + shipped.

### 2026-06-29 · Inline code is its own object: a rounded red hairline chip (theme-tuned)
- **Decision:** Inline code (`:not(pre) > code`) is now one defined object shared by both themes: a soft
  red-tinted fill + a warm-red 1px hairline + SOFT ROUNDED corners (border-radius 5px, padding
  0.12em 0.4em, font-size 0.875em, red mono text). It is readability-first (a passing reference,
  subordinate to the sentence) and deliberately the OPPOSITE of the sharp-cornered code-block
  destinations (DECISIONS, same date). ONE structure, colors tuned per theme; no surface special-casing,
  so it reads on the page, the raised toggle panel, and inside a `<summary>` title on its own (the old
  summary-code color special cases were removed).
- **Colors:** DARK text `#ff9b9b`, fill `rgba(255,120,120,0.07)`, border `rgba(255,120,120,0.26)`. LIGHT
  text `#b03326`, fill `#f3e4d6`, border `rgba(150,74,38,0.32)`. Red text stays AA on its own fill (dark
  9.2:1, light 5.0:1, both verified on the live build in a real writeup).
- **Supersedes** the light-only cream chip (`#f7f0dc`) from the polish entry below: this unifies both
  themes and drops the toggle-title special case.
- **Status:** Adopted + shipped (custom.css only; `npm run build` green, 44 pages).

### 2026-06-29 · Light/code/toggle polish: sharp code frames, light inline-code chip, softer copy toast, tighter toggle gap
- **Sharp code blocks (both themes):** the EC frame radius is zeroed via EC's own `--ec-brdRad: 0` plus
  an explicit `.expressive-code .frame { border-radius: 0 }`. EC also leaves a 1px residual on the title
  tab (top) and code body (bottom) from `calc(--ec-brdRad + border-width)`, so `.frame .header/.title/pre`
  are zeroed too. Code blocks now read as crisp rectangles on paper as they already did on dark. The EC
  copy button keeps its own radius (3.2px); no toggle / button / badge / divider radius is touched.
- **Light inline-code chip:** (SUPERSEDED same day by the unified inline-code object in the top entry;
  kept for history) the light `:not(pre) > code` fill (`#f3ebda`, near-invisible on the `#f2ede0` toggle
  panel and borderless) became a defined cream chip `#f7f0dc` + a warm 1px border `rgba(95,74,38,0.32)`.
  The fill had to stay light to keep the red text (`#c92a2a`) at AA (4.8:1), so it was a touch lighter
  than both surfaces and the border carried the edge on the close-toned panel. Dark was left unchanged
  in this pass (its default chip was already distinct), which the top entry then unified.
- **Softer light copy toast:** EC's success feedback (`.expressive-code .copy .feedback`, fed by
  `--ec-frm-tooltipSuccessBg` / `-Fg`) was a saturated teal `#438076` + white, too bold on paper.
  Light-only override to a pale sage `#d6e4c0` + deep-olive `#2f4d09` text (7.2:1). Dark keeps EC's default.
- **Tighter toggle gap:** the gap under an open toggle title was summary padding-bottom 0.3rem +
  `.toggle-body` padding-top 0.5rem (~12.8px). Now `.toggle-body` padding-top is 0.25rem and the summary
  bottom padding is 0.15rem WHEN OPEN only (the closed pill keeps its balanced 0.3rem/0.3rem), so the gap
  is ~6.4px. Content toggles only (scoped to `.sl-markdown-content`); sidebar group summaries untouched.
- **Scope:** custom.css only, no Starlight rebuild, pinned versions, no em dashes. Verified on
  `npm run dev` in both themes; `npm run build` green (44 pages).
- **Status:** Adopted + shipped.

### 2026-06-29 · TOC active entry recolors to its heading level (cyan h3, gray h4+)
- **Decision:** In the right "On this page" column, the entry the reader is currently on
  (`aria-current="true"`) now takes the hue of the heading it points to, mirroring the in-page
  hierarchy: h1/h2 keep Starlight's green `--sl-color-text-accent` (unchanged), **h3 turns cyan**
  (`--tp-cyan` dark `#41efff` / `--tp-cyan-ink` light `#08697a`, the same tokens as the `###` heading),
  and h4/h5/h6 go muted gray (`--sl-color-gray-2`, the h4 heading color). Flags keep gold (the
  2026-06-20 rule, plus the cyan rule excludes `#user-flag` / `#root-flag` by href). Only the current
  entry recolors; inactive entries keep the muted default.
- **Why:** the heading ladder already uses a lime/cyan/gray duotone in the body (DECISIONS 2026-06-20
  era); carrying that hue into the active TOC entry makes the column echo the content hierarchy and
  strengthens the sense of place while scrolling. Owner request.
- **How:** unlayered CSS in `custom.css` (beats Starlight's layered `a[aria-current]` green). Heading
  level is read from Starlight's TOC NESTING depth (it nests h3 under h2, h4 under h3, by
  `maxHeadingLevel`): h3 = one level (`nav > ul > li > ul > li > a`), h4+ = two or more. Parity with the
  heading rules is by reusing the SAME tokens (`--tp-cyan` / `--sl-color-gray-2`), so a heading color
  change carries over (noted in the CSS + CORE_SPEC to update both). Desktop column only; the mobile TOC
  keeps Starlight's white + checkmark active style. h4/h5/h6 are not in the TOC until
  `tableOfContents.maxHeadingLevel` is raised, so those rules are future-proofing.
- **Verified:** live build at 1440w, both themes. h2 green, h3 cyan (matches `--tp-cyan` exactly), flags
  gold (excluded), synthetic h4/h5 = gray-2; `npm run build` green (44 pages).
- **Status:** Adopted + shipped.

### 2026-06-28 · ToggleAll hides below two toggles (single-toggle pages too)
- **Decision:** The Expand/Collapse-all control now self-hides unless a page has **two or more** content
  toggles. The reveal threshold in `ToggleAll.astro` moved from `>= 1` to `>= 2` (`toggles.length < 2` stays
  hidden), acting on the same `.sl-markdown-content details.toggle:not(.toggle-flag)` set. A bulk
  expand/collapse adds nothing over a single lone toggle, so single-toggle pages (every current
  single-toggle Bandit level) now behave like the zero-toggle pages and drop the control. It is count-driven,
  so it clears automatically with no per-writeup edits. Supersedes the "hides only when zero toggles" clause
  in the 2026-06-20 entry below.
- **Rationale:** the control is a bulk affordance; with one toggle it is redundant with the toggle itself and
  just adds chrome to the TOC column.
- **Verified:** live build at 1440w. Single-toggle `bandit/0-1` (control gone), multi-toggle `bandit/16-17`
  (control present), zero-toggle `bandit/` index (still gone); `npm run build` green (44 pages).
- **Status:** Adopted + shipped.

### 2026-06-27 · FlagCapture "Decrypt to Capture" replaces the flag reveal toggle
- **Decision:** The User/Root flag value renders in a new **`FlagCapture.astro`** control under the
  existing gold flag heading, replacing the old `<Toggle flag>` + `:::tip[Answer]` (which duplicated the
  flag name already owned by the heading + TOC). It is LOCKED by default (static gold cyphertext the exact
  length of the real value), and a click DECRYPTS it into the real flag using the site's signature
  decode/scramble effect, then reads CAPTURED with a copy button.
- **Component API:** `<FlagCapture type="user" | "root" flag="..." />`. `type` drives ONLY the gold tier
  (user vs richer root); there is NO per-type glyph (the heading already owns the flag icon + gold name).
  The control carries one neutral state icon: a LOCK (LOCKED) that swaps to a CHECK (CAPTURED). `flag` is
  the real value (always in the DOM for screen readers + copy; visually scrambled until capture). The whole
  frame is one real `<button>` (keyboard + focus); an `aria-live="polite"` region announces "User/Root flag
  captured". The frame matches the writeup Toggle (full content width, 6px radius) but sits a bit taller
  (more vertical padding) for presence, with a slightly larger value/icon. An icon-only copy button sits
  INSIDE it (vertically centered at the right, like the code-block copy): on copy it swaps to a check and
  shows a golden "Copied!" pill (the CAPTURED label fades out under it), reverting after ~1.5s. (Revised 2026-06-27: dropped the duplicate flag/crown identity glyph, the `path` prop + its
  caption, and the chip sizing; see fixes below.)
- **Decode reuse:** the scramble is the SAME effect as the hero/headline decode in `src/pages/index.astro`
  and `about.astro` (charset `!<>-_\/[]{}=+*^?#01`, 45ms interval), ported into the component script at
  `dur=15` (~720ms) so the flag decrypt matches the brand signature. Not reinvented.
- **Gold values (tokens in custom.css):** identity gold `--flag-gold` `#ffc23d` dark / `#C6A243` light
  (decorative: border, glyph, label). Root tier `--flag-gold-root` `#ffcf63` dark / `#B8862B` light. The
  flag VALUE text uses AA-grade golds `--flag-gold-val` `#ffc23d` dark / `#7a5a12` light and
  `--flag-gold-val-root` `#ffcf63` dark / `#6b4e0e` light, because the bright loot gold is NOT text-AA on
  paper. Verified contrast on the captured row: dark user 11.66:1 / root 12.81:1; light user 4.99:1 / root
  5.93:1 (all >= AA; root deeper so it reads as the bigger prize).
- **Theme + motion:** the capture moment is a warm gold GLOW pulse in BOTH themes (revised 2026-06-27 from
  the original dark-glow / light-underline split, so light feels as rich as dark): a one-shot glow on a
  `::after` overlay + a value text-glow, tuned per theme (light halo stronger, `--fc-glow` 72% vs dark
  55%, to read on paper). The captured row also gets the V3 light surface depth. Locked state is static
  (no idle animation; reading stays calm). `prefers-reduced-motion` (read at click time) skips the
  scramble and the glow entirely and reveals the value instantly in the CAPTURED state; copy still works.
  No flashing.
- **Icon alignment (2026-06-27):** the lock/check and copy/check are each ONE `<svg>` whose `<path>` is
  swapped in JS, not two display-toggled siblings. A flex item that follows a `display:none` sibling
  drifts ~8px off the value/label center (a flexbox quirk); a single icon stays a lone flex child and
  centers cleanly.
- **Pipeline:** `notion_cleaner.py` (still NOT committed) should emit the gold heading + `<FlagCapture>`
  (with the import) for both user and root flags, handling user-only / root-only writeups. Contract
  recorded in CORE_SPEC §7.
- **Status:** Adopted + shipped. Built and verified live (both themes, reduced-motion, copy) on the
  `busquedav2.mdx` testbed; owner then migrated `busqueda.mdx`'s User/Root flags to `<FlagCapture>` and
  deleted `busquedav2.mdx`. Shipped in PR #5 (`dev` -> `main`), `npm run build` green (44 pages).
  Supersedes the `.toggle-flag` reveal from the 2026-06-20 flag-loot entry (the heading + gold TOC from
  that entry are unchanged). The Bandit "Reveal Password" toggles are a candidate for the same swap (see
  ROADMAP).

### 2026-06-26 · Truncate embedded private keys in writeups (GitHub push protection)
- **Decision:** Writeups whose level reward is an SSH/RSA private key (OverTheWire Bandit
  16->17, and any future key-based level) must NOT commit the full PEM. In the single "Reveal
  private key" spoiler toggle, keep the `-----BEGIN/END RSA PRIVATE KEY-----` markers plus only
  the first and last base64 lines, with the middle replaced by an ellipsis note
  (`... (key truncated; the SSL service returns the full PEM on the box) ...`); mask the key
  everywhere else on the page.
- **Why:** GitHub push protection (GH013, "GitHub SSH Private Key") rejects any push that adds a
  committable private key, even though the Bandit keys are public (they ship with the public
  wargame). Truncating keeps `dev`/`main` pushable and the secret scanner quiet while the page
  still shows the key's shape; the real key is always retrievable on the box. Chosen over
  redact-to-placeholder (loses the shape) and over GitHub's allow-secret URL (never bypass push
  protection for a real key).
- **Remediation:** if a push is already blocked and the offending commit is unpushed,
  `git reset --soft HEAD~1`, truncate, re-commit, push. No shared-history rewrite, no `--allow` bypass.
- **Status:** Adopted (hard rule). Applied to `bandit/16-17.mdx` (commit ba3c2d5).

### 2026-06-20 · Flag loot gold: one signal for User/Root Flag (heading, toggle, TOC)
- **Decision:** Unify the User Flag / Root Flag concept into a single theme-aware gold via a `--flag-gold`
  token (`#ffc23d` dark / `#835e00` light, AA in both). It colors the body heading (replacing the brown
  `.task-title`, with a flag-SVG mask icon as `::before`), the reveal toggle (`.toggle-flag`, refactored
  to the token), and the right TOC entry (muted gold at rest for scannability, full gold on hover/current;
  other TOC entries keep the green `--sl-color-text-accent`). custom.css only; no glow or motion.
- **Why:** the concept previously read as three different colors (brown heading, gold toggle, green TOC);
  one gold makes it scan as the writeup's prize.
- **Dependency / interim:** flag headings have no dedicated class (they reuse `.task-title`, shared with
  real Task headings), so they are targeted by the deterministic slug ids `#user-flag` / `#root-flag`. A
  `.flag-title` (and a flag-toggle hook) from the pipeline is the clean fix (see ROADMAP).
- **Status:** Adopted. Optional Root-vs-User hierarchy (part 4) deferred: the toggle icon is content-lane
  (flag SVG hardcoded in the MDX label), so a CSS-only Root crown/richer-gold would desync from its toggle.

### 2026-06-20 · Icon-based tagged callouts (Callout.astro)
- **Decision:** A presentational `Callout.astro` renders `<aside class="cl cl-{type}">` with a header
  (icon + UPPERCASE label) and a slot. Five types: recon (cyan, magnifier), loot (amber, padlock), intel
  (violet, information), vuln (red, warning), defense (green, inline shield SVG since Starlight has none).
  Icons via Starlight's `<Icon>`; colors/border/tint in `custom.css` (`.cl*`), theme-aware (vivid border +
  faint tint, light-mode ink swap for icon/label). Replaced an earlier bracket-tag version.
- **Why:** semantic, scannable writeup callouts (recon/loot/intel/vuln/defense) without forking Starlight
  admonitions. Applied to `busquedav2.mdx` (the design testbed).
- **Status:** Adopted.

### 2026-06-20 · busquedav2: drop EC line highlights; remove marked-line CSS
- **Decision:** Remove all `{n}` line-highlight markers from `busquedav2.mdx` and delete the custom EC
  marked-line restyle from `custom.css`. The marked line had been restyled (amber, then a neutral
  grayscale) to stop EC's default blue reading as a callout; the owner then chose to drop highlights
  entirely, so the restyle is gone (nothing is marked).
- **Why:** the highlights were not earning their weight; removing them is cleaner than styling them.
- **Status:** Adopted (busquedav2). The `notion_cleaner.py` line-highlight convention is now unused; if
  reintroduced, EC's default marked-line color would need restyling again.

### 2026-06-20 · Homepage pipeline: Reflection phase reads muted violet
- **Decision:** The 4th "How I work" pipeline phase title (`.phase:nth-child(4) .pt`, Reflection) is
  `#b294d4` (soft muted violet, PicoCTF-purple family) instead of `var(--text)` white. `index.astro` only.
- **Why:** white blended into the body text; a muted violet completes the cyan/magenta/lime trio while
  reading as the calm final phase. Restrained, dark-only page.
- **Status:** Adopted.

### 2026-06-20 · Marketing pages declare /favicon.svg
- **Decision:** `index.astro` and `about.astro` add `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`.
- **Why:** they had no favicon link, so browsers auto-requested `/favicon.ico` (a dev `[router]` warning);
  there is no `favicon.ico` in the repo (only `favicon.svg`). Declaring the SVG stops the fallback request
  and gives the marketing pages a favicon. (Starlight content pages already reference it.)
- **Status:** Adopted.

### 2026-06-20 · ToggleAll control: sidebar placement, scroll anchoring, native-anchor fix
- **Decision:** A dependency-free "Expand all / Collapse all" control (vanilla TS, `ToggleAll.astro`) is
  injected at the BOTTOM of the right "On this page" column via an additive Starlight `PageSidebar`
  override that renders `<Default />` then `<ToggleAll />` (official API, no fork; wired in
  `astro.config.mjs` `components`). It targets `.sl-markdown-content details.toggle:not(.toggle-flag)`
  (Toggle gained a stable `.toggle` class), so it never touches sidebar/nav/code or spoiler flags.
  Self-hides when a page has no toggles (raised 2026-06-28 to: fewer than two toggles, see top entry);
  desktop-only (`sl-hidden lg:sl-block`; the right sidebar is
  `position:fixed`, so it follows scroll). Per-page model (a cross-page global was rejected).
- **Look:** the original bordered pill (neutral gray text + border, cyan accent on hover/focus). An
  earlier de-emphasized treatment (small/dim/light) was tried and REVERTED. Separated from the TOC by a
  2.5rem gap plus a subtle `--sl-color-hairline` divider (a hard divider had read as a list separator).
- **Scroll anchoring (no teleport):** before mutating, record the current heading's
  `getBoundingClientRect().top`; set `.open`; re-measure; `window.scrollBy(0, delta)` synchronously (same
  task). To kill a few-pixel reversible shift, native scroll anchoring is suppressed (`overflow-anchor:none`
  on `document.documentElement`) for just the operation and restored next frame (rAF), so the manual
  correction is the sole corrector. A `behavior:'instant'` attempt was tried and REVERTED (wrong cause).
- **Status:** Adopted. Anchoring verified (drift 0) in headless; the few-pixel shift is not reproducible
  in headless Chromium (known false negative), so visual confirmation of that shift fix is pending on the
  owner's real browsers (Chrome/Edge/Opera GX). See ROADMAP open issues.

### 2026-06-15 · Command-highlight palette rebuilt on a principled OKLCH basis (+ bold weight)
- **Decision:** Redesign the `.ec-cmd-*` palette in OKLCH, measured against the rendered code bg
  (tokyo-night `#1a1b26` / one-light `#fafafa`), separating the three channels: (1) LIGHTNESS uniform
  per theme (dark `L 0.745`, light `L 0.43`) so all categories share one brightness and each clears
  **WCAG 7:1 (AAA)**, measured; (2) HUE = category, kept off the theme's string/keyword/function hues
  (privilege magenta, recon gold `h95`, network cyan `h200`, inspect warm-sand `h60`); (3) CHROMA =
  loud vs quiet, so recon/network are vivid and inspect is LOW chroma at the SAME L/contrast. Final
  values: recon `oklch(0.745 0.153 95)`/`oklch(0.43 0.088 95)`, network `oklch(0.745 0.126 200)`/
  `oklch(0.43 0.073 200)`, inspect `oklch(0.745 0.045 60)`/`oklch(0.5 0.045 60)`. Also added a second
  channel: every recognized command is `font-weight:700` (incl. sudo, weight only). Inspect set: ls, cd,
  cat, echo, whoami, id, find, grep, pwd, ping; recon also includes whatweb.
- **Why:** The old inspect color was near-invisible because it had been quieted by dropping CONTRAST;
  the fix is to drop CHROMA instead and hold lightness/contrast uniform with the vivid set. Working in
  OKLCH makes loudness (chroma) and legibility (contrast) independent, so "quiet" no longer means
  "dim." Bold gives a weight channel so the command word pops without relying on color alone. Verified
  in-browser in both themes: computed colors match the shipped `oklch()` values, browser-measured
  contrast matches the design math (recon 7.56/7.72, net 7.96/7.45, inspect 7.45 dark / 5.8 light), and
  command-position detection leaves command OUTPUT untagged. Light inspect is the one deliberate
  exception to uniform-L: lightened to `oklch(0.5 0.045 60)` (~5.8:1, still AA) at owner request because
  the darker uniform brown read too heavy on paper; the quiet-via-chroma intent is unchanged.
- **Constraint honored / tradeoff:** sudo's COLOR is the immovable anchor and is NOT recolored, so it
  sits at ~5.5:1 (dark) / ~5.4:1 (light), just under the 7:1 the redesigned categories meet. "All four
  at sudo's lightness AND all ≥7:1" is physically impossible without recoloring sudo, so the 7:1 floor
  applies to the three redesigned categories and sudo keeps its hue/color (gaining only bold). Light
  vivid chroma is gamut-limited at `L 0.43` (warm/teal hues cannot be both dark and saturated on white),
  so light reads more muted than dark; this is the honest cost of the 7:1 floor on a paper bg.
- **Status:** Adopted. Supersedes the color values in the 2026-06-14 command-highlighting entry below
  (its mechanism + category structure still stand). Colors live in `custom.css` only (`oklch()` +
  `!important`); command-list additions (`cd`, `echo`, `ping` to inspect; `whatweb` to recon) are in
  `ec-priv-command.mjs`.

### 2026-06-14 · Code-block command highlighting by semantic category
- **Decision:** Extend the EC command-tagging plugin (`ec-priv-command.mjs`) from sudo-only to four
  categories colored by signal value: privilege (magenta; sudo/su/doas), recon (gold/orange; nmap,
  gobuster, ffuf, feroxbuster, nikto, enum4linux, smbclient), network (cyan; nc/ncat/netcat,
  penelope, socat, curl, wget, ssh, chisel), inspect (quiet lavender; ls, cat, whoami, id, find,
  grep, pwd). Match in command position (first word after a prompt / sudo / `|` `&&` `;`); sudo keeps
  its exact content-match path and color. Command lists are one-line-extendable.
- **Why:** One color per category (not per command) communicates intent and avoids monochrome code.
  Command-position avoids tagging the same short word where it appears in command OUTPUT. Recon is
  gold not lime because lime is too close to the theme command-green; recon hue is theme-tuned
  (gold on ink, burnt-orange on paper) to clear the theme amber. All four are WCAG AA on the code bg
  and mutually distinct in both themes.
- **Status:** Adopted and committed/pushed (superseded by the 2026-06-15 OKLCH entry above). Residual
  risk: an output line whose first word is exactly a listed command can be mis-tagged (rare).

### 2026-06-14 · Platform-index duotone: platform color + universal cyan secondary
- **Decision:** On the platform index, the platform color leads and a universal cyan secondary
  (`--pf-accent-2`: `#41efff` dark, `#08697a` light) is the duotone partner. Cyan on the stat label,
  card eyebrow, and "Read writeup" affordance; difficulty colors on the stat breakdown; cyan ring on
  the active filter pill; platform color stays on the name, count-up number, and card accent bar.
- **Why:** Single-color platforms read monochrome (worst on HackTheBox: green on green). Cyan is not
  any of the four platform hues, so it complements all. Keeps the platform color clearly the lead.
- **Status:** Adopted and committed/pushed to `dev`.

### 2026-06-14 · Sidebar: taller rows + 17rem width
- **Decision:** Increase sidebar link/summary block padding + line-height (fuller rail, bigger touch
  targets) and trim `--sl-sidebar-width` to `17rem` (from 18.75rem). Padding, not `<li>` margins, so
  the active pill, nesting guide line, and platform dots stay aligned.
- **Why:** Sparse sections looked half-empty and the default rail felt too wide. Owner picked 17rem
  after trying 16 / 16.5 (16 felt too narrow).
- **Status:** Adopted (committed).

### 2026-06-14 · Light-mode art-direction: paper-native "risograph"
- **Decision:** Give light its own identity (dark untouched, all rules `[data-theme='light']`):
  near-black editorial ink, a faint warm technical dot-grid behind content (replacing the bottom
  glow), a vivid decorative accent palette for non-text use, and crisp flat badges with deepened
  AA-safe inks. A risograph title-misregistration (offset colored ghost on the page title) was tried
  and REJECTED (looked bad).
- **Why:** Light should be premium on paper terms, not a dimmed copy of dark's neon. The title
  effect did not read well, so it was reverted (its only leftover, an unused `--tp-deco-magenta`
  token, was removed 2026-06-14).
- **Status:** Adopted (committed). Title effect: rejected.

### 2026-06-14 · Hidden easter-egg trail (themed 404 + /secret terminal)
- **Decision:** A four-step trail, all inside Starlight: a themed 404 (`404.mdx`, splash template +
  hero, Starlight slug-404 override) with a breadcrumb to `/robots.txt`; the robots.txt comment
  points to `/secret`; `/secret` (hidden from nav, `pagefind:false`, noindex) hosts a from-scratch,
  zero-dependency vanilla-TS terminal (`SecretTerminal.astro`) with help/whoami/ls/cat/sudo/random
  (+ surprise/roll)/flag/clear; `flag` reveals `flag{curiosity_is_my_exploit}` + a recruiter note.
- **Why:** Personality feature; built in Starlight so it inherits theme/fonts/toggle. Terminal is
  zero-dependency per spec. `random` builds its writeup list at build time from `getCollection`.
- **Status:** Adopted (committed). Konami + styled console greeting included on `/secret`.

### 2026-06-14 · robots.txt managed in-repo (public/robots.txt)
- **Decision:** Owner chose to keep `robots.txt` in the repo at `public/robots.txt` (overriding the
  earlier "Cloudflare-managed, out of repo" stance). It currently contains only the easter-egg
  breadcrumb comment + a `Sitemap:` line.
- **Why:** Owner's call; simpler to version the breadcrumb with the site.
- **Status:** Adopted, with a caveat: on deploy this file is served as `/robots.txt` and may
  override the Cloudflare-managed bot disallows / Content-Signals. Must add the full managed content
  before relying on it (see ROADMAP open issues).

### 2026-06-14 · Platform index pages: PlatformIndex + WriteupCard components
- **Decision:** Replace each platform's static `.platform-intro` header with reusable Starlight-
  embedded components: `PlatformIndex` (data: filters `getCollection('docs')` to the platform,
  derives difficulty from the entry id path, renders an animated hero + difficulty filter rail +
  grid) and `WriteupCard` (presentational, `showPlatform` prop off here, on for a future global
  `/writeups` index). Each `{platform}/index.mdx` is now minimal frontmatter + `<PlatformIndex/>`.
  `content.config.ts` gains optional `os`/`tags` (forward-compatible; omitted gracefully today).
- **Why:** Make the landings showcase writeups with the homepage WOW, reusing one card for path 3
  (global index) without forking Starlight. Starlight lowercases doc URLs, so card hrefs use
  `entry.id.toLowerCase()`.
- **Status:** Adopted (committed).

### 2026-06-14 · Git hygiene: no Claude attribution; trailer scrubbed from history
- **Decision:** Never add "Co-Authored-By: Claude" or "Generated with Claude Code" to commits or PR
  bodies. Removed the trailer from two existing commits via history rewrite (force-pushed `dev` +
  `main`; only messages changed, trees identical). Commits are authored as `Idan-Babayan`.
- **Why:** Owner's hard rule (the attribution is unwanted noise on his own repo); extends the no-em-
  dash-style "AI tell" stance. Done while the repo is solo so a force-push is safe.
- **Status:** Adopted (hard rule).

### 2026-06-06 · Rebrand domain: idanstudio.click -> idanlab.dev
- Decision: Canonical domain is now https://idanlab.dev. Project name, repo, local folder,
  and all site copy move from "idanstudio" to "idanlab". idanstudio.click is kept as a 301
  redirect during transition, then retired.
- Why: "idanstudio" never fit the identity (Idan.Lab). .click reads cheap for a security
  portfolio (no SEO penalty, weak trust); .dev signals technical/security and forces HTTPS.
  idanlab.com, idanlabs.com, idan.com, and idan.dev were all taken; idanlab.dev keeps the
  Lab brand on a developer TLD. Done now while SEO equity is near zero (cheapest time).
- Status: Adopted.

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
- **SUPERSEDED 2026-06-30:** difficulty directories are now LOWERCASE (`hackthebox/easy`), and
  `astro.config.mjs` was restored to `hackthebox/easy`, as part of the flat-files + parallel `src/assets`
  migration (see the top entry). The case-only folder rename was registered in git with `git mv`; with
  `core.ignorecase=true` git otherwise misses it and would ship a split `Easy/` + `easy/` tree that drops
  a writeup from the sidebar on the case-sensitive Linux build. The case-sensitivity lesson still holds,
  now on the lowercase form: on-disk difficulty dirs and every `autogenerate.directory` must match exactly.

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
