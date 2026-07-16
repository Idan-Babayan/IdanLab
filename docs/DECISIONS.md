# Idan.Lab — Decisions Log

> Append-only. Newest at top. Each entry records a decision and *why*, so future-you (and
> Claude) never re-litigate settled questions. Format: date · decision · rationale · status.
> When a ROADMAP item is resolved, record the decision here.

---

### 2026-07-13 · Focus ring extended to TOC entries + prose links; spoiler-toggle already correct; light flag gold strengthened
- **Decision:** `--focus-ring` now also carries the TOC's heading-ladder identity and the prose-link cyan.
  Set per element only: no new outline rules, no new colors, every ring still drawn by the shared
  zero-specificity `:where(...):focus-visible` rule.
  - **TOC entries** ring in the hue of the heading they point to, on BOTH the desktop
    `.right-sidebar-panel` and the `mobile-starlight-toc` dropdown: flags `--flag-gold`, h3 `--tp-cyan` /
    `--tp-cyan-ink`, h2 (and h4+) the lime default, which already equals the green h2 takes when current
    (`--sl-color-text-accent`). Keyed off the heading the entry POINTS TO (slug for flags, the nesting
    chain on desktop, inline `--depth: 1` on mobile) and deliberately WITHOUT the `aria-current` condition
    the color rules use, so the ring is right whether or not the entry is the active section. Flags are
    excluded from the h3 rule exactly as in the color rules, so they never ring cyan.
  - **In-prose links** ring cyan: `--focus-ring` added to the existing
    `.sl-markdown-content a:not(:where(.not-content *))` rule and its light variant, reusing the same
    `--tp-cyan` / `--tp-cyan-ink` pair the link color already uses. The `.not-content` guard means
    component links keep their own token (verified: WriteupCard still rings `--pf-accent`, not cyan).
- **Premise corrections (checked against source before editing):**
  - **The spoiler-toggle has no green focus ring, and no focus rule at all.** Its block defines only
    `--spoiler-color` (amber), the border, and the summary color; there is no hardcoded ring to remove. It
    ALREADY rings the lime default through the shared rule (measured `#b6ff3c` dark / `#4d7c0f` light, with
    the amber staying text/border only), which is exactly the requested end state. The "green" is most
    likely the light lime `#4d7c0f`, which reads as an olive green. NO change was needed or made.
  - **`ToggleAll.astro` hardcodes a cyan ring** (`outline: 2px solid color-mix(in oklab,
    var(--pf-accent-2) 60%, transparent)`), a component-level rule the token pass below missed (it grepped
    `src/styles/*.css`, not components). It is the one element still bypassing `--focus-ring`, and it
    contradicts that pass's own "ToggleAll stays lime" note. Left as-is (outside this pass); see ROADMAP.
- **Legibility, measured not assumed** (ring vs its own effective background): dark is strong across the
  board (flag gold 12.39:1, h3 cyan 14.27:1, h2 lime 16.49:1, prose cyan 14.27:1). Light: cyan 5.22:1 and
  lime 4.11:1 are fine, but the flag gold `#C6A243` rings at only **2.00:1** on the paper TOC, under the
  3:1 a non-text indicator wants. Per the convention (keep the identity, strengthen the ring, never fall
  back to lime), the light flag ring is widened to `outline-width: 3px`, desktop + mobile; every other ring
  stays 2px and dark is untouched. Caveat recorded in the CSS: width raises perceivability, not the ratio;
  `--flag-gold-val` (an existing deeper gold, already AA on paper) is the option if the gold must actually
  clear 3:1.
- **Verified (real browser, keyboard, both themes, desktop 1280 + mobile 375):** desktop and mobile TOC each
  ring flag gold / h3 cyan / h2 lime, every measured entry with `aria-current` ABSENT (proving the ring does
  not depend on active state); prose links ring cyan; the spoiler-toggle rings lime (not amber, not green);
  WriteupCard still rings `--pf-accent`; on a fresh load, pointer/plain focus gives `:focus-visible` false
  and `outline: none`, so nothing rings on mouse click. `npm run build` green (45 pages).
- **Status:** Adopted; committed to `dev` (not pushed). CSS-only, additive, `custom.css` only.

### 2026-07-13 · Site-wide focus-ring token (--focus-ring) on content pages: one color, identity where it exists, lime default
- **Decision:** A single `--focus-ring` custom property now drives every keyboard focus-ring COLOR on
  Starlight CONTENT pages (`custom.css`). Default is the theme-aware site accent
  `var(--sl-color-text-accent)` (lime `#b6ff3c` dark / `#4d7c0f` light). A zero-specificity shared base
  rule draws the rectangular ring: `:where(a, button, [role="button"], input, select, textarea, summary,
  [tabindex]):focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px }`. Identity
  elements set `--focus-ring` to their own accent so the ring echoes what they already express: platform
  cards (`--pf-accent`), the four platform sidebar groups (positional nth-child, theme-aware), the
  flag/password reveals (gold/amber), and the badge chips (`--wm-c`, an inert hook for the WriteupMeta
  rollout). Everything else inherits lime. `:focus-visible` only (keyboard), never on mouse click.
  Additive, no component fork, no Starlight fork, no new deps.
- **Premise corrections (the task assumed a different codebase; checked against source before building):**
  - FlagCapture/PasswordReveal were said to ring via `box-shadow`; they actually ring via `outline`
    (box-shadow is none) and are `border-radius: 6px`, so the outline already follows their corners in
    current engines. Kept them as OUTLINE (no conversion, owner's choice), routed the color through the
    token; corners stay rounded and the rings are preserved exactly (pw amber `#ffc23d`/`#a86f04`; flagcap
    gold `color-mix(--fc-id 65%/60%)`).
  - The task's "~8 generic non-identity outline rings to collapse" do not exist in `custom.css`: it had
    exactly 3 focus rings, all identity (the two reveals). The only generic rings live inline on the two
    marketing pages, which `custom.css` does not load.
  - Starlight 0.39.2 ships NO `:focus-visible` outline of its own (only a few `:focus` color changes plus a
    1px search-clear outline), so the shared rule is the branded ring for all content-page controls, not an
    override war. `custom.css` is unlayered, so even the zero-specificity `:where` base beats Starlight's
    layered styles.
  - The "homepage platform cards" named in the task are on a standalone marketing page
    (`.card.htb {--accent}`), which `custom.css` cannot reach; the content-page analog is `WriteupCard`
    (`<a class="wc-card pf-*">`, carries `--pf-accent`), which is what this pass rings. Sidebar links do not
    carry `--pf-accent` (platform color is a positional nth-child dot), so the hook is added by the same
    nth-child pattern, not "already there."
- **Scope (owner decision):** content pages only this pass; folding the two marketing pages into the same
  token (de-hardcoding their inline lime/accent rings from the prior focus-states work) is a deliberate
  SECOND step (see ROADMAP), not forced now.
- **Verified (real browser, keyboard + pointer, both themes):** the shared rule renders lime on content
  chrome (skip link, prose links, TOC entries, header link, search button, theme select). Sidebar groups
  render their identity: VulnHub red `#ff5c5c`/`#d12f2f`, PicoCTF purple `#d96bff`/`#8b3dc4`, OTW amber
  `#ffc23d`/`#a86f04`, HTB + About lime; writeup links inside a group inherit it. WriteupCard rings
  `--pf-accent` (lime for HTB), radius 16px. FlagCapture gold (65% mix) and PasswordReveal amber render
  rounded (radius 6px, outline follows). On a fresh load, plain/pointer focus gives `:focus-visible` false
  + `outline: none` (no ring on mouse click). Code blocks have no `tabindex`, so they are untouched. Every
  identity ring is legible against its background in both themes (bright on the near-black rail, darkened
  values on paper); none needed strengthening. `npm run build` green (45 pages).
- **Status:** Adopted; committed to `dev` (not pushed). CSS-only, additive, `custom.css` only.

### 2026-07-13 · Marketing-page keyboard focus rings (:focus-visible), matching the component-ring pattern
- **Decision:** Both standalone marketing pages now define a `:focus-visible` ring on every interactive
  control, CSS-only inside each page's `<style is:global>` (`src/pages/index.astro` and
  `src/pages/about.astro`; Starlight content pages and the existing component focus rings were NOT
  touched). The ring reuses the design-system pattern from the component rings in `custom.css`
  (PasswordReveal, FlagCapture): `outline: 2px solid <accent>; outline-offset: 2px;`, keyed with
  `:focus-visible` (not `:focus`) so it shows for keyboard nav and not on mouse click.
- **Token, not a hardcode:** the accent is `var(--lime)`, the pages' own theme-aware token, which is
  byte-identical to what content pages resolve for the ring. `custom.css` sets `--sl-color-accent:
  #b6ff3c` and `--sl-color-text-accent` is green `#b6ff3c` dark / `#4d7c0f` light; the marketing `--lime`
  is `#b6ff3c` dark / `#4d7c0f` light, so no light override is needed. The task's example token
  `var(--sl-color-text-accent)` does NOT exist on the marketing pages (they live outside Starlight and
  define only `--ink/--lime/--cyan/--magenta/...`), so using it verbatim would have produced an
  invalid/undefined outline color; `var(--lime)` is the correct equivalent.
- **Platform cards key the ring to their own identity accent:** the four homepage `.card` and the four
  About `.practice` links use `outline-color: var(--accent)` (HTB lime, VulnHub red, PicoCTF purple, OTW
  amber), echoing their hover border and mirroring how the component rings use each component's identity
  color (FlagCapture `--fc-id`). Every other control (buttons, HUD links, theme toggle) uses the uniform
  lime ring. (Owner chose this over a single uniform lime everywhere.)
- **Premise checked before building:** confirmed the marketing pages defined no focus styles at all (no
  `:focus`/`:focus-visible`/`outline`, and no `outline:none` suppression, so they fell back to the generic
  browser default ring), and that the only `:focus-visible` rules in `custom.css` are the three component
  rings (all `.sl-markdown-content`-scoped, 2px solid + 2px offset): not one global rule, but a consistent
  geometry to match.
- **Verified (real browser, both themes, real keyboard + pointer input):** every interactive control is
  covered by a focus selector (8 homepage: 4 `.btn` + 4 `.card`; 10 About: hud-home + 2 nav links + toggle
  + 4 `.practice` + 2 `.btn`; 0 uncovered; the 6 About skill cards are non-interactive `<div>`s, correctly
  excluded). Real hardware Tab presses give `matches(':focus-visible')` true with the ring rendered:
  homepage btn lime `#b6ff3c` and VulnHub card red `#ff5c5c`; About dark nav link `#b6ff3c`; About light
  hud-home and toggle `#4d7c0f`. A non-keyboard (programmatic/pointer) focus gives `:focus-visible` false
  and `outline: none`, so no ring appears on mouse click. `npm run build` green (45 pages). No new deps,
  pinned versions unchanged, no motion added.
- **Status:** Adopted (working tree; not committed). CSS-only, additive, marketing pages only.

### 2026-07-13 · Marketing About-page touch targets meet WCAG 2.2 minimum (24px) via layout-neutral hit-area growth
- **Decision:** The four interactive controls in the About page HUD now carry a >= 24x24px pointer
  target. CSS-only, inside the `<style is:global>` block of `src/pages/about.astro` (the theme layer and
  Starlight content pages were NOT touched, no shared component changed). The two nav links (`.hud-nav a`)
  and the home link (`.hud-home`) get `padding-block: 3px; margin-block: -3px;`; the theme toggle
  (`.theme-toggle`) gets `align-items/justify-content: center; min-width: 24px; min-height: 24px;
  margin: -4px;` while the icon stays 16px.
- **Why the paired negative margin:** block padding (or a min-size floor) grows the clickable box, and the
  equal negative margin keeps the flex item's margin box at its natural size, so the compact HUD height and
  every label/icon position stay pixel-identical. Only the invisible hit area grows: no glyph is enlarged
  and nothing below the bar shifts.
- **Scope confirmed by live measurement, not assumed:** at a real 375px viewport the only failing controls
  were the theme toggle (16x16) and the three HUD links (~18.4px tall). Every other control on both
  marketing pages already passes (homepage `.btn` >= 50px, platform `.card` 240px, About `.practice`
  120px, footer buttons ~50px); the homepage carries no nav links or toggle, so it needed no change. The
  About skill cards are non-interactive `<div>`s (cursor-tilt decoration only, no href/handler), so they
  are out of scope.
- **Verified (real browser, both themes):** all four controls report >= 24px (hud-home 83x24.4, Writeups
  66.4x24.4, About 41.5x24.4, toggle 24x24) in dark and light; HUD height unchanged at 51.2px; the visible
  toggle glyph is still 16x16; no horizontal overflow (documentElement scrollWidth == 375); no hit-box
  overlap (18.4px clearance between the toggle and the About link); each control is the topmost element at
  its own center; the toggle flips theme light/dark and persists to `localStorage['starlight-theme']`; the
  Writeups link navigates to /hackthebox/. `npm run build` green (45 pages). No new dependencies, pinned
  versions unchanged, no motion added.
- **Status:** Adopted (working tree; not committed). CSS-only, additive, `about.astro` only.

### 2026-07-12 · Code-block min-content width leak contained at `.main-pane` (min-width: 0), verified in-browser
- **Decision:** Two additive rules in `custom.css` (placed right after the three-column layout block):
  `.sl-markdown-content :is(.expressive-code, pre) { min-width: 0 }` and `.main-pane { min-width: 0 }`.
  A `<pre>` with a long unwrapped line has a large min-content width; a flex child defaults to
  `min-width: auto` (= min-content), which outranks `overflow-x: auto`, so that width can leak up through
  the flex ancestors and push Starlight's content track past `--sl-content-width` (the column widens, the
  TOC shifts, body text reflows, ToggleAll jumps). Most visible when a spoiler `<details>` reveals the
  `<pre>`, but the cause is general to any code block. The `overflow-x: auto` scrollbar stays, the code
  does NOT wrap (`white-space: pre` untouched), and `--sl-content-width` stays 50rem: the block scrolls
  inside a fixed column instead of widening it.
- **Leak vector confirmed by browser layout inspection, not assumed** (Busqueda `docker-inspect` block,
  the wide-line spoilers under "What can user svc run as root?"): momentarily removing the content cap to
  expose the latent leak, the long line's min-content propagated to `.main-pane` (Starlight's flex child
  in the three-column row, default `min-width: auto`), shifting the right TOC ~205px (left 1189.6 to
  1394.9). `min-width: 0` on the block chain (`.expressive-code` / `pre` / `figure` / `.toggle-body` /
  `details`) did NOT contain it: those are block boxes whose `min-width: auto` already resolves to 0.
  `min-width: 0` on `.main-pane` DID (TOC snapped back to 1189.6, column held at 800px = 50rem).
  `.main-frame` (the other flex item on the chain) was tested and did not additionally leak, so it is
  deliberately left out (minimal set). The code block itself is still pinned so its `overflow-x: auto`
  stays authoritative.
- **Why Chromium masks it (and why the fix is still needed):** Chromium clamps a box's min-content
  contribution by its own `max-width`, and `.sl-container` carries `max-width: --sl-content-width` (50rem),
  so with the cap on, the current in-app (Chromium) browser shows NO leak at any width, open or closed.
  Engines that do not clamp min-content by an inner `max-width` still leak; the `min-width: 0` fix is the
  standard, engine-neutral containment. The cap-removal proxy is exactly how the latent leak was exposed
  and measured in a real browser.
- **Verified (real browser, measurable criterion, both themes):** with the fix live, opening the
  `docker-inspect` spoiler leaves the column at 800px and the TOC at 1189.6 (columnDelta 0, tocDelta 0);
  the pre shows a horizontal scrollbar (clientWidth 771 vs scrollWidth 1046) and does not wrap; a thin
  code block is unchanged (delta 0, no scrollbar); the cap-removal proxy now yields tocShift 0 in BOTH
  dark and light (was +205px pre-fix); a long-line EC block appended directly into prose (general case,
  not in a `<details>`) scrolls internally with tocShift 0; no page-level horizontal scroll; safety check
  confirmed the rules change nothing with the cap intact. `npm run build` green (45 pages). No new deps,
  pinned versions unchanged, no Starlight fork, no motion.
- **Status:** Adopted (working tree; not committed). CSS-only, additive.

### 2026-07-12 · Build-time content-taxonomy guard (remark plugin) as the ruled-out astro check alternative
- **Decision:** New additive build-time plugin `plugins/remark-validate-content-taxonomy.mjs`, wired FIRST in
  `astro.config.mjs` `markdown.remarkPlugins` (before the PasswordReveal injector; it only reads, never
  mutates, so order is not otherwise significant). It FAILS the build when a writeup uses an unknown
  hand-authored badge/metadata class token or an unknown component metadata value, so a content typo (for
  example `platform-hacktheboxx`, or `<FlagCapture type="usr">`) becomes a loud error with a source position
  and a "did you mean" suggestion instead of a silently unstyled render that ships green.
- **Why:** `astro check` (plus `@astrojs/check` + `typescript`) was deliberately ruled out (pinned-deps
  posture). This is the alternative, and it targets the string/value surface authored by hand in MDX, which
  is the part that actually grows during the manual writeup pass. Zero new dependencies: it uses only
  `unist-util-visit` (already transitive via `@astrojs/mdx`, same as the PasswordReveal plugin) plus a
  hand-rolled Levenshtein for the suggestions. Nothing was added to `package.json` or the lockfile.
- **What it validates (the allow-lists in the plugin are the single source of truth):** owned class-token
  families by prefix (`meta-` to meta-badge; `platform-` / `difficulty-` / `os-` to the badge modifiers;
  `port-` to port-label; `task-` to task-title; `machine-` to machine-meta); a structural rule that a
  `meta-badge` element carries exactly one platform/difficulty/os modifier; and component metadata enums on
  `Callout` (type recon/loot/intel/defense/vuln), `WriteupMeta` (the four typed unions), and `FlagCapture`
  (type user/root).
- **Boundary (why it cannot false-positive on component output):** it runs at the remark/mdast stage on the
  `.mdx` SOURCE, so it only ever sees HAND-AUTHORED markup. Component-generated classes (Callout's `cl-*`,
  WriteupMeta's `wm-*` / `pf-*`) are produced later during `.astro` rendering and are never visible here;
  marketing `.astro` pages are not markdown, so their `platform-card` / `platform-grid` never reach it; and
  dynamic `class={expr}` plus any token outside the owned families are ignored.
- **Callout set verified complete (neither narrowed nor widened):** re-read `custom.css`, which defines
  exactly five callout TYPE classes (`cl-recon`, `cl-loot`, `cl-intel`, `cl-defense`, `cl-vuln`; the other
  `cl-*` are structural chrome), and `Callout.astro`'s `CalloutType` union matches those five.
- **Verified:** `npm run build` green (45 pages) on current content, so there are no pre-existing taxonomy
  typos (the guard cleared every writeup, including the four existing `<FlagCapture type="user"|"root">`
  usages). Demonstrated a failing build on a scratch `platform-hacktheboxx` and on `<FlagCapture type="usr">`
  (clear error naming the token, file, `line:column`, and the suggestion), then removed the scratch and
  rebuilt green.
- **Retirement note:** the `meta-badge` / `platform-` / `difficulty-` / `os-` / `machine-` class families are
  expected to be RETIRED when WriteupMeta fully rolls out and the `.machine-meta` badge row is dropped; narrow
  the allow-lists then and keep the component-enum checks. Frontmatter os/tags validation was considered and
  deferred (no writeup sets those in frontmatter today, and the remark stage does not see frontmatter cleanly).
- **Status:** Adopted; committed to `dev` (not pushed). No new deps, pinned versions unchanged.

### 2026-07-11 · Constellation hero canvas pauses off-screen (IntersectionObserver, perf-only)
- **Decision:** The constellation canvas `draw()` loop on the two marketing heroes now stops its per-frame
  work while the canvas is scrolled out of the viewport and resumes on re-entry. Implemented in
  `src/pages/index.astro` and `src/pages/about.astro` only (the two files that carry the effect;
  `PlatformIndex.astro` has no constellation canvas, confirmed, so it was not touched). The loop tracks its
  own `rafId`, a `running` guard prevents double-scheduling or an orphaned frame, and an
  `IntersectionObserver` on the canvas calls `start()` / `stop()` (`cancelAnimationFrame`) on
  enter/leave. A `pagehide` handler stops the loop and disconnects the observer for a clean lifecycle.
- **Why:** the loop previously called `requestAnimationFrame(draw)` unconditionally and ran forever, so the
  hero kept consuming CPU/GPU/battery even when off-screen. The observer itself is cheap and always-on; only
  the draw work is gated.
- **No visual change while visible, and the reduced-motion gate is unchanged:** the `draw()` body is
  untouched, `init(); start()` schedules the identical first frame, and the observer's initial callback is a
  no-op via the `running` guard, so an on-screen hero renders exactly as before. The whole observer lives
  inside the existing `if(!reduce)` block, so `prefers-reduced-motion` users still get no animation and no
  observer. Stepping is per-frame (no time deltas), so resume continues from the current node positions with
  no jump and no catch-up burst.
- **Verified:** `npm run build` green (45 pages; this is the type-check gate for the `.astro` `<script>`
  blocks, and it passed clean). Both compiled bundles carry the lifecycle logic (home page inline script and
  the `about` script bundle each show one `cancelAnimationFrame`, the added `IntersectionObserver`, and the
  `pagehide` teardown). The off-screen pause is a scroll behavior that headless checks report false negatives
  on (documented project learning), so it was NOT verified headlessly: the owner should confirm on the
  deployed preview by scrolling the hero out of view (loop stops) and back (resumes smoothly, no visual jump).
- **Status:** Adopted (working tree; not committed). No new dependencies, pinned versions unchanged.

### 2026-07-11 · PasswordReveal migration complete
- Status update superseding the 2026-07-05 in-progress note. PasswordReveal is now the reveal mechanism
  on 32 of 34 Bandit level pages. The first level's spoiler-toggle has been removed and the migration
  commit landed. Two pages are deliberately excluded: one uses a private-key reveal that remains a
  spoiler-toggle, and one has no password to reveal. The rollout is done; no further per-page migration
  is pending.

### 2026-07-11 · Content pipeline is manual editorial polish, not a script (retires notion_cleaner.py)
- **Decision:** The writeup content pipeline is deliberate manual editorial polish against a Notion
  template. The previously referenced Python cleaning script (notion_cleaner.py) is retired and is not
  the mechanism. It never provided the finishing quality intended for published writeups.
- **Why:** The gap between a raw Notion export and the intended finished writeup is an editorial-judgment
  problem, not a mechanical text-transformation problem. A script can normalize syntax but cannot make
  the editorial calls that define the site's writeup quality. Long-term correctness and voice consistency
  outweigh the short-term convenience of automation.
- **Revivability:** This is a deferral, not a permanent abandonment. If manual polish proves not to scale
  as the writeup count grows, a scripted pre-clean pass may be reconsidered as a first step feeding manual
  polish, never as a replacement for it. Docs no longer cite the script as active.

### 2026-07-11 · Metadata system: committing to WriteupMeta, remark-plugin injection chosen (build deferred), chips non-clickable until filter routes ship
- **Decision:** WriteupMeta replaces the hand-authored .machine-meta badge row as the writeup metadata
  system. .machine-meta remains live for now and is retired page by page as the mass writeup import/polish
  pass proceeds, so the two systems never both act as a live source of truth on the same page.
- **Rollout mechanism:** Metadata will be auto-injected via a remark plugin. This is a deliberate
  short-term loss for a long-term gain: building auto-inject plumbing is upfront cost with no immediate
  payoff, but at writeup scale it removes per-page metadata boilerplate. The plugin is the chosen
  mechanism; its implementation is deferred and is NOT built as part of this decision. It is separate
  framework-pipeline work to be scoped on its own.
- **Interactive layer deferred separately:** Injecting the metadata (the plugin) and rendering it as
  clickable filter chips are separate layers. The chips are rendered non-interactive for now because their
  target filter routes (/platform, /os, /environment) do not yet exist; shipping clickable chips to dead
  routes would be worse than static ones. The clickable layer, and the filter routes it depends on, get a
  real review AFTER the mass writeup import. Those routes share machinery with the deferred /principles
  index and are intended to be built together.
- **Net:** Build the injection pipe (later), leave the interactive tap off until after the import.
  Extending metadata behavior before that review should not be treated as settled just because the
  mechanism is chosen.

### 2026-07-11 · picoCTF icon rebuilt as a true vector (815 B, replaces 65 KB raster-in-SVG)
- **Decision:** both copies of the picoCTF badge (`public/icons/picoctf.svg` and
  `src/assets/icons/picoctf.svg`) are replaced by a hand-constructed 815-byte true-vector SVG:
  4 elements (disc `<circle>`, shadow `<path>`, letterform `<path>`, dot `<circle>`), flat colors
  `#c4a0cb` / `#c50a2c` / `#fff`, no embedded bitmap, no clipPath, no filters. This resolves the
  ROADMAP item "replace the improvised PicoCTF badge asset" and supersedes the interim asset noted
  on 2026-07-08 (the 65 KB SVGO-optimized Inkscape trace, which was a base64 PNG plus 829
  one-pixel trace-artifact paths).
- **How it was rebuilt (method, reusable for other icons):** the embedded PNG was extracted as the
  measurement source of truth; every edge was measured to sub-pixel precision from the raster
  (50% coverage crossings), then intended geometry was inferred and refit: the bowl is a wide oval
  (rx 101.5, ry 93.6) drawn as quadrant cubics (flanks flatter than an ellipse, so handle lengths
  were least-squares fitted per quadrant, max error about 1 px); the long shadow's edges are exactly
  45 degrees (upper edge tangent to the bowl, lower edge through the stem tip), closed by an arc of
  the badge circle instead of a clipPath; shadow edges that sit under the white letterform ride
  2 to 3 px inside it so no anti-aliasing seams can appear. Verified by rendering with Inkscape CLI
  and pixel-diffing against the original raster: 15 structural pixels differ image-wide (all
  single-pixel edge placement, out of 262,144), invisible at any size including the 18 px sidebar dot.
- **Deployment checks done:** CSP already allows `img-src data:` (the new file is under Vite's 4 KB
  `assetsInlineLimit`, so the `src/assets` copy may inline as a data URI once WriteupMeta ships);
  `/icons/*` carries no immutable cache rule (only `/_astro/*` and `/fonts/*` do), so the in-place
  replacement cannot serve stale to returning visitors. The 2026-07-08 note that `assetsInlineLimit`
  hashing matters for a 65 KB pico asset is moot now.
- **Status:** Adopted; on `dev`, uncommitted.

### 2026-07-11 · Mobile TOC: current top-level (h2) entry green (completes desktop parity)
- **Decision:** One add-only, mobile-scoped rule in `custom.css` (directly after the existing mobile
  gold-flag and cyan-h3 blocks): the current top-level (h2) entry in the mobile TOC dropdown turns green
  via `--sl-color-text-accent`, matching the desktop right column. This completes mobile/desktop TOC
  active-color parity (green h2, cyan h3, gold flags).
- **Why:** on desktop the current h2 is green only because Starlight's DEFAULT `a[aria-current="true"]`
  color (`--sl-color-text-accent`) shows through, and the custom rules override only deeper levels. The
  mobile TOC uses a different default active style (white + checkmark), so the green had to be added
  explicitly. The theme-aware token (green `#b6ff3c` dark / `#4d7c0f` light) means no light override.
- **Selector / depth model:** `mobile-starlight-toc a[aria-current="true"][style*="--depth: 0"]:not([href="#user-flag"]):not([href="#root-flag"])`.
  Verified in the real mobile DOM (Starlight 0.39.2): h2 entries carry `style="--depth: 0;"`, h3 entries
  `--depth: 1;`. NOTE the flags (`#user-flag` / `#root-flag`) render at `--depth: 1`, NOT h2-level, so the
  `--depth: 0` selector never matches them; the `:not()` flag exclusions are a harmless safeguard kept for
  parity with the sibling cyan-h3 rule. Scoped strictly to `mobile-starlight-toc`, so the desktop
  `<starlight-toc>` is structurally unreachable (confirmed: a desktop anchor does not match the rule).
- **Verified** on a real 375px mobile viewport, both themes, by computed color: current h2 green
  (`#b6ff3c` dark / `#4d7c0f` light), current h3 cyan (`#41efff` / `#08697a`), current flag gold
  (`#ffc23d` / `#C6A243`), inactive entries muted default; desktop TOC unchanged (its current h2 stays
  green via the Starlight default, and the new rule does not match it). No console errors. `npm run build`
  green (45 pages). No new deps, no motion.
- **Status:** Adopted; committed to `dev`, then merged to `main` (production) via PR the same day
  (2026-07-11).

### 2026-07-11 · Commit split into 4 atomic commits, then dev merged to production (PR #9)
- **Commit split:** the single working commit `1fdac10` (WriteupMeta badges + badge icons + reoptimized
  `picoctf.svg` + docs sync + mobile TOC + three-column layout) was re-partitioned into four atomic,
  individually-building commits with the EXACT same final tree (verified: `git diff 1fdac10 HEAD` empty,
  identical tree hash `04b803fb`): `7fa5d82` feat(badges) WriteupMeta system (component, `icons.ts`, the
  interim `picoctf.svg`, `.writeup-meta` styles), `3045505` feat(toc) mobile TOC parity, `02e8bab` docs
  (badge icon sourcing + spec/roadmap sync), `723c2ab` style(layout) three-column rebalance + full-width
  intro pages. `custom.css` spanned three concerns (badge, mobile TOC, layout) and was split by hunk across
  commits 1, 2, and 4. The pre-split tip stays recoverable from the reflog if ever needed.
- **Merged to production:** `dev` (9 commits ahead of `main`, which was a clean ancestor) merged into `main`
  via PR #9 as a history-preserving merge commit `998af50` (two parents `546165c` + `723c2ab`, NOT a
  squash), so all 9 commits stay individually on `main`. The push to `main` triggers the Cloudflare Pages
  production deploy of idanlab.dev.
- **What went live** (previously dev-only or uncommitted): CSP is now ENFORCED IN PRODUCTION (was enforced on
  `dev` only, see 2026-07-06); the font `<link rel=preload>` hints are removed site-wide (2026-07-07); the
  WriteupMeta badge system is in the repo (still not wired to any writeup, icons still placeholder); the
  mobile TOC parity is live; and the three-column rebalance + full-width intro pages shipped, though its rem
  values remain analysis-based and still want a real-browser fine-tune (see ROADMAP).
- **Font first-paint follow-up (nothing shipped):** the post-preload-removal Chromium first-paint swap was
  investigated. Three candidate states (preload + swap / `font-display: optional` / preload + optional) were
  built for the owner to compare, but NONE was adopted, so `font-display: swap` and the no-preload state are
  unchanged. A separate diagnosis established that the self-hosted fonts DO cache correctly in production: the
  `/fonts/*` immutable `Cache-Control` from `_headers` is served on the deployed site (verified by curl), so
  any swap-on-every-navigation is a `npm run dev` artifact (dev applies no `_headers`), not a production bug.
- **Status:** Adopted + shipped to production. PRs #5 and #9 are both merged; the "deploy enforced CSP to
  production" and "writeup-structure migration uncommitted" ROADMAP items are resolved and removed from ROADMAP.

## Badge icon sourcing: split by consumption mechanism

Writeup badge marks are sourced by what each icon needs, not stored uniformly. The four
platform logos render as native-color <img> from hashed ?url imports and, because the sidebar
CSS backgrounds reference them by stable /icons/ path, also keep a public/icons copy: this
duplication is forced by the CSS lock and is intentional. Linux is treated as a logo (native
color <img>) because it is multicolor and cannot be a clean single-color glyph. The three
single-fill category marks (Windows, Active Directory, Progressive) are recolored to
currentColor, inlined, and tint to their chip accent in both themes; Standalone uses a
purpose-drawn currentColor glyph. Category marks live only in src/assets/icons/ because
inlining requires importing them, and public/ is not in the import graph.

assetsInlineLimit is left at the Vite default: PicoCTF (65 KB) is emitted as a hashed cached
asset while the sub-4 KB logos inline as data URIs, which is the desired size-based split.
Forcing all assets to hashed files was rejected as a global change to solve a non-problem.
The PicoCTF asset is an improvised raster-in-SVG (65 KB after SVGO); it is an accepted interim
asset. A clean lightweight PicoCTF source is a Design follow-up.

**SUPERSEDED 2026-07-11:** the PicoCTF badge is no longer a 65 KB raster-in-SVG interim asset. It was
rebuilt as an 815-byte true-vector SVG and is design-final, closing that Design follow-up (see the
"picoCTF icon rebuilt as a true vector" entry above, which also notes the new sub-4 KB file now inlines
as a data URI rather than hashing).

### 2026-07-10 · Mobile TOC parity: gold flag entries + cyan current-h3 (CSS-only, additive)
- **Decision:** Extend the two desktop "On this page" treatments to the mobile TOC dropdown
  (`<mobile-starlight-toc>`): flag entries (`#user-flag` / `#root-flag`) render muted gold at rest and
  full `--flag-gold` on hover/current, and the current h3 entry turns cyan (`--tp-cyan` dark /
  `--tp-cyan-ink` light). CSS-only, add-only, in `custom.css` right after the desktop TOC block. No
  component override, and NO existing `.right-sidebar-panel` rule touched (the diff is purely additive),
  so desktop renders identically. All new rules are scoped to `mobile-starlight-toc`, which cannot reach
  the desktop column (a different `starlight-toc` element).
- **Why the mobile cyan rule differs from desktop:** desktop reads heading level from the TOC nesting
  chain (`nav > ul > li > ul > li > a`). Mobile uses the same recursive `TableOfContentsList` but wraps it
  under `nav > details > .dropdown`, so that exact chain does not line up. Instead the mobile rule matches
  Starlight's per-entry inline `--depth`. The gold rules are href-based (depth-independent) so they are a
  near-verbatim re-scope.
- **Verified in the REAL mobile DOM (Starlight 0.39.2), correcting an assumption:** the mobile TOC is
  NOT flat, it is nested (`ul > li > ul`) like desktop, BUT Starlight also emits an inline
  `style="--depth: N;"` on every `<a>` (via `define:vars` in `TableOfContentsList.astro`). Confirmed
  h2 = `--depth: 0`, h3 = `--depth: 1` (with a space after the colon, so `[style*="--depth: 1"]` matches),
  and that `#user-flag` / `#root-flag` are themselves h3 (depth 1), hence the `:not()` exclusions so flags
  keep gold and never go cyan. If Starlight changes the emitted format or the h3 depth number, update both
  cyan selectors.
- **Behavior preserved:** rules set text `color` only. Starlight's mobile active checkmark (`::after`,
  `background-color: --sl-color-text-accent`) and the white h2 active color are untouched; h2/other
  non-flag entries keep Starlight's default active style. Unlayered so the flag/h3 colors beat Starlight's
  layered mobile active color.
- **Verification:** both themes, real mobile viewport (375px), computed styles + screenshots. Dark: flags
  muted→full gold, current h3 `#41efff`, current h2 stays white, checkmark intact. Light: current h3
  `#08697a`, flags `#C6A243`/muted, checkmark bg = light accent. Desktop right column unchanged (flag
  `oklab(0.785…)` muted gold, h3-current `--tp-cyan`, both identical to before). `npm run build` passes
  (45 pages). Committed as `3045505` and shipped to production via PR #9 (2026-07-11).

### 2026-07-10 · WriteupMeta revised: intentional per-axis color, restrained glow, growing pips (supersedes the two entries below)
- **What changed from the first build (below):** the badge row was redesigned from platform-only *washes*
  + a bordered divider to INTENTIONAL per-axis color with a restrained glow. Structure, guardrails, and
  a11y are unchanged (`.not-content`, `data-astro-prefetch="false"`, runtime union guard, `sr-only`
  "Difficulty N of 4"); only color, glow, difficulty rendering, and spacing changed.
- **Single-token color model:** every chip derives color/tint/border/glow from one custom property
  `--wm-c` (plus optional `--wm-glow`), set per value. New per-value classes on the chips: `pf-*`
  (platform, already existed), `wm-os-*`, `wm-env-*`. This replaces the old `--wm-htb/--wm-vh/...`
  globals, so the v1 "token scoping / bare-`:root` fallback" note no longer applies (dark values live on
  unprefixed selectors, light overrides under `:root[data-theme="light"]`).
- **Palette drift RESOLVED (closes the ROADMAP reconciliation item):** platform chips now use the
  canonical `--pf-accent` hexes verbatim (HTB `#b6ff3c`/`#4d7c0f`, VulnHub `#ff5c5c`/`#d12f2f`, PicoCTF
  `#d96bff`/`#8b3dc4`, OTW `#ffc23d`/`#a86f04`); they match the sidebar/site tokens, no drift. HTB alone
  carries a `--wm-glow` (`#9fef00` dark / `#4d7c0f` light) so its halo is true brand green.
- **OS + Environment are intentional identity colors** (dark / light): Linux `#f0b429`/`#a86f04` (Tux
  amber), Windows `#4ca3ff`/`#0a63c9`; Environment Standalone `#8fa3b8`/`#5a6b7d` (solitary slate),
  Active Directory `#7c9cff`/`#3b4fa8` (enterprise indigo, kept distinct from the Windows-blue chip it
  sits beside).
- **Progressive env color added by owner decision:** the shipped spec only colored 2 of the 3 `Environment`
  union values, and the new base `.wm-chip` *requires* `--wm-c`, so a `Progressive` chip (the natural
  value for the OTW Bandit content) rendered as a broken transparent pill with a hard ink outline and no
  glow. Flagged it; owner chose a teal-green "wargame ladder" hue: `#3fd9a8` dark / `#0f8a63` light
  (pulled toward teal to stay distinct from HTB lime; OTW's platform amber means it never sits beside the
  HTB chip anyway).
- **Restrained glow ("G1"):** dark = a soft halo `box-shadow: 0 0 10px -2px` at ~32% of the hue (45% on
  hover); light = a clean hue-shadow `0 3px 10px -5px` (glow becomes haze on paper). Spread is deliberately
  restrained; do not increase it.
- **Difficulty chip:** now a calm PEER of the nav chips (same 0.75rem / 600 size+weight, was slightly
  larger before), still neutral and hue-free. The visible "Difficulty" key label was REMOVED (the word in
  the chip is the only visible label; `sr-only` "Difficulty N of 4" stays). Magnitude is carried by pips
  that both FILL and GROW with level (the leading filled pip enlarges 6→8px as level rises), so higher
  difficulty outweighs lower beyond count alone, still achromatic.
- **Layout:** the bottom border/divider is GONE; the block is a single flex row, tight under the title
  (`margin-top: 0.55rem`) with open space before the body (`margin-bottom: 2.1rem`).
- **Status:** built clean (45 pages), verified both themes + the previously-broken Progressive chip now
  renders correctly (teal fill/border/glow) in dark and light. Committed as `7fa5d82` + docs `02e8bab` and
  shipped to production via PR #9 (2026-07-11); still not wired to any writeup (auto-injection vs manual
  placement remains an open ROADMAP call).

### 2026-07-10 · WriteupMeta badge system (`src/components/badges/`) added
- **Decision:** New additive component `WriteupMeta.astro` plus an icon registry `icons.ts` and a
  `.writeup-meta` CSS block in `custom.css` (placed right after the flag-loot rules). It renders under a
  writeup title as a two-tier metadata row: a NAVIGATIONAL group (Platform, OS, Environment) as tinted
  pill chips that are `<a>` anchors to future filter routes, then a trailing EVALUATIVE Difficulty chip
  (rectangular, hue-free, word + filled pips, NOT a link). Four axes are string-literal unions
  (`Platform` / `OS` / `Environment` / `Difficulty`). Icons live only in `icons.ts` as inline 24x24
  `currentColor` SVG strings (placeholder stubs today; Idan swaps the real marks in). Shape-codes intent:
  pills navigate, the rectangle grades. Usage: `import WriteupMeta from '@components/badges/WriteupMeta.astro'`
  under the title. NOT yet auto-injected or applied to any writeup (see ROADMAP).
- **Four Starlight-integration conflicts found and fixed** (the naive spec would have shipped each):
  1. **Prose-link bleed →** wrapper carries `.not-content`. Every `.sl-markdown-content a` rule is guarded
     `:not(:where(.not-content *))`, and under `[data-theme='light']` that rule is specificity (0,3,1),
     which outranks the chip's own `.writeup-meta .wm-chip` (0,2,0): without the opt-out, chip labels
     rendered teal with a tinted bottom border in light mode (and lime/white on hover in both themes).
  2. **Token scoping →** `--wm-*` platform tokens are declared on `:root, :root[data-theme='dark']` (not
     `[data-theme="dark"]` only, as first drafted). This file's dark tokens use the bare-`:root` fallback
     convention; scoping the wash tokens to the attribute alone would leave them undefined if `data-theme`
     is ever absent, making every `color-mix()` invalid-at-computed-value and silently dropping the wash.
  3. **Prefetch of dead routes →** chips carry `data-astro-prefetch="false"`. Starlight enables Astro
     prefetch by default, so each writeup fired `<link rel=prefetch>` at `/platform|/os|/environment`
     (all 404 today) just from the block entering the viewport. A click 404 is expected; silent 404
     prefetch traffic on every page load is not. Remove the attrs when the routes exist.
  4. **No build-time type check →** component throws on an unknown axis value. `astro build` does not
     type-check `.astro` props and this repo has no `astro check` (adding `@astrojs/check` + `typescript`
     is a new dep, forbidden). Without the guard, `difficulty="Hardd"` shipped silently: no pips filled,
     href became `/platform/undefined`, and screen readers announced "Difficulty undefined of 4." The
     guard turns a typo into a build failure (verified: exit 1, `npm run build`), honoring the type-safety
     requirement without new deps.
- **A11y:** the pip count has an `.sr-only` "Difficulty N of 4" text equivalent (not shape-only); icon
  SVGs are `aria-hidden`; each chip's accessible name is just its label. Verified in the a11y tree.
- **Difficulty is hue-free by design** (magnitude by pip count, no traffic-light color), deliberately
  UNLIKE the existing `.difficulty-*` machine-meta badges (green/amber/red). The two badge systems now
  coexist; `.machine-meta` is untouched and still used by every current writeup.
- **Palette note (unresolved):** the spec's `--wm-*` hexes match the canonical unified platform palette
  (see 2026-06-01) only for HTB; VulnHub/PicoCTF/OTW drift in both themes (PicoCTF most: canonical
  `#d96bff`/`#8b3dc4` vs `--wm-pico` `#a78bfa`/`#6d28d9`). Implemented as specified (explicit design
  values), flagged in ROADMAP for Idan to reconcile before this ships on real writeups.
- **Status:** built (45 pages, clean), verified both themes + narrow-width wrap in the preview. Files are
  committed as `7fa5d82` (+ docs `02e8bab`) and shipped to production via PR #9 (2026-07-11); not wired to any writeup yet.

### 2026-07-10 · `WriteupMeta` badge system: two tiers, shape-coded, navigational chips + a hue-free Difficulty
- **Decision:** New additive component tree `src/components/badges/` (`icons.ts` + `WriteupMeta.astro`), styled
  by a `.writeup-meta` block in `custom.css` placed after the flag/loot rules. Platform, OS and Environment
  render as clickable pill chips (leading), Difficulty trails as a rectangular word-plus-pips chip that is
  hue-free and never a link. Shape carries the job: pills navigate, the rectangle grades. Four string-literal
  unions (`Platform`, `OS`, `Environment`, `Difficulty`) drive `Record<>` registries, so the icon set, the
  route slug and the pip count all stay exhaustive. No new dependencies; Starlight is not forked.
- **Why (icons):** `icons.ts` is the single home for the marks. Each is an inline 24x24 SVG string using
  `fill="currentColor"`, so a
### 2026-07-07 · Font `<link rel=preload>` hints removed site-wide (Firefox "preloaded but not used")
- **Decision:** The two font preload hints (`jetbrains-mono-400.woff2`, `syne-800.woff2`) are removed from
  all three sources that emitted them: the Starlight `head` config in `astro.config.mjs` (docs pages) and
  the `<head>` of both standalone marketing pages (`src/pages/index.astro`, `src/pages/about.astro`). Each
  site now carries a short rationale comment so the preloads are not re-added.
- **Why:** Firefox logs "preloaded but not used within a few seconds" for these preloads on every page.
  This is NOT an unused-weight problem: both faces genuinely paint above the fold (JetBrains Mono 400 is
  body text, Syne 800 is the `h1#_top` page title). Firefox simply does not credit a same-origin
  `crossorigin` font preload that is served from its own preload cache, and warns anyway. The preload only
  shortened first-load FOUT, with no CLS or LCP effect here because of the metric-matched fallbacks, so it
  was not worth the warning.
- **Fonts load unchanged:** still self-hosted via `@font-face` in `src/styles/fonts.css` (imported by the
  two marketing pages and via Starlight `customCss`) with metric-matched size-adjust fallbacks and
  `font-display: swap`, so first paint stays shift-free with no preload. `@font-face`, the fallback
  declarations, and `public/fonts/` were not touched.
- **Supersedes:** the "Preloads" bullet of the 2026-07-04 self-hosted-fonts entry, and the 2026-07-05
  crossorigin correction (which had switched these preloads from `crossorigin="true"` to bare
  `crossorigin`). With the preloads gone, the crossorigin value is moot.
- **Verified:** `npm run build` green; zero `<link rel="preload" ... fonts/>` anywhere in `dist/`; the
  reading-progress head script is byte-for-byte unchanged; theme-orthogonal (identical hints in dark and
  light), so both themes are unaffected.
- **Status:** Adopted; committed as `6920802` (+ docs `c14fc32`) and shipped to production via PR #9 (2026-07-11).

### 2026-07-06 · CSP flipped from Report-Only to enforced (Permissions-Policy pruned; site loads only self scripts)
- **Decision:** `public/_headers` now serves `Content-Security-Policy` (enforced), replacing
  `Content-Security-Policy-Report-Only`. Only the header NAME changed: the policy value is byte-identical to
  the Report-Only version verified clean across Chromium 148, Firefox 152, WebKit 26.5, and real Safari
  hardware (iPhone, iPad, BrowserStack Safari 18.4, Safari 16.5). Shipped on dev (commit `132a1da`),
  merged to production via PR #9 (2026-07-11).
- **Now active (were inert under Report-Only):** `frame-ancestors 'none'` (clickjacking defense alongside
  the enforced `X-Frame-Options: DENY`) and `upgrade-insecure-requests` (upgrades same-origin subresources
  to HTTPS). The three Report-Only console notices (frame-ancestors ignored, upgrade-insecure-requests
  ignored, and Safari's no-report-to notice) resolve on enforcement.
- **All scripts are self (what made enforcement honest):** Cloudflare Web Analytics was disabled AND removed
  (deleted at the dashboard, not just toggled), so the `static.cloudflareinsights.com` beacon is gone and
  the site loads zero external scripts. `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'` has no
  third-party origin (`'unsafe-inline'` covers the 18 inline scripts; `'wasm-unsafe-eval'` covers Pagefind's
  worker WASM, proven necessary and sufficient on all three engines). See the analytics entry below.
- **Permissions-Policy pruned (same _headers change):** removed six tokens current Chromium/Edge no longer
  recognize and log as "Unrecognized feature": ambient-light-sensor, battery, document-domain,
  execution-while-not-rendered, execution-while-out-of-viewport, speaker-selection. All still-recognized
  deny entries kept. `web-share` deliberately KEPT despite a Chromium "unrecognized" warning, because Safari
  recognizes it as a real deny (removing it would weaken the policy there).
- **Unchanged constraints:** no reporting endpoint (report-to / report-uri) by design; no Trusted Types
  (SecretTerminal `innerHTML`); HSTS stays at the Cloudflare zone (not duplicated in `_headers`).
- **Verified under real enforcement:** on the live Cloudflare preview (`dev.idanlab.pages.dev`) and local
  wrangler, Pagefind search returns results (WASM under the enforced token), `/secret` works, fonts /
  Expressive Code / image-zoom / ToggleAll work, both themes render, and the console is clean of the former
  Report-Only notices, the six Permissions-Policy errors, and any beacon. Chromium + Firefox clean; WebKit
  main-thread clean (its Playwright worker sandbox on Windows is a test-harness limit, not CSP); real Safari
  confirmed on device.
- **Status:** Adopted; enforced on dev, then merged to production via PR #9 (2026-07-11), so the CSP is now enforced in production.

### 2026-07-06 · Cloudflare Web Analytics disabled; CSP stays script-src 'self' (no third-party beacon)

Decision: Cloudflare Web Analytics (RUM) auto-injection is disabled at the Cloudflare
dashboard, so the static.cloudflareinsights.com beacon is no longer injected into any
page. The site's Content-Security-Policy therefore keeps script-src 'self' with no
third-party script origin.

Why: The beacon is served from Cloudflare's CDN in every installation mode (automatic,
EU-excluded, or manual snippet), so keeping analytics would have required allowlisting
static.cloudflareinsights.com in script-src regardless of method. Manual installation was
evaluated and rejected: it still loads the beacon from the same external origin, so it
does not avoid the allowlist, and it adds a maintained third-party tag to the build for no
CSP benefit. The site's audience skews privacy and security focused, where a large share
of visitors block third-party analytics at the browser level, so the collected data would
have been both incomplete and skewed. Disabling keeps the CSP genuinely self-contained
(no third-party script origin), which is the more coherent posture for this site, and
removes the only external script, unblocking CSP enforcement with no allowlist compromise.

Boundary: this is a Cloudflare dashboard setting, not a repo change. If web analytics is
ever wanted later, it would require adding static.cloudflareinsights.com to script-src.

### 2026-07-05 · Application-layer security headers via public/_headers; CSP Report-Only as a staging step toward enforcement
- **Decision:** Application-layer security headers ship via `public/_headers` on Cloudflare Pages, additive
  to the zone-level hardening. Safe headers (X-Content-Type-Options, Referrer-Policy, X-Frame-Options,
  Permissions-Policy) and immutable caching for `/_astro/*` and `/fonts/*` are ENFORCED immediately.
  Content-Security-Policy ships as `Content-Security-Policy-Report-Only`. Report-Only is a STAGING STEP,
  NOT the finish line: it blocks nothing and only surfaces would-be violations, so we validate the intended
  policy in real browsers first. The finish line is renaming the header to `Content-Security-Policy`.
- **Post-self-host CSP state:** the font self-hosting migration is complete, so the CSP has NO Google Fonts
  origins; `font-src 'self'` (fonts served same-origin from `/fonts/*.woff2`). `style-src` retains
  `'unsafe-inline'` because Starlight and Expressive Code inject inline styles; that is effectively
  permanent short of forking Starlight. `img-src 'self' data:` (the `data:` is required: 30-plus
  `url(data:image...)` CSS backgrounds from Starlight/Expressive Code icons). No external origins in any
  directive (verified zero in source and dist).
- **script-src reality (supersedes the brief's "one inline script" premise):** the production build emits
  **18 distinct inline scripts**, not one. Besides our static reading-progress bar, Starlight injects its
  own inline scripts (theme provider, mobile-menu toggle, sidebar/TOC persistence, `updatePickers`,
  Expressive Code), and the marketing pages (`/`, `/about`) plus a few writeups (busqueda/return
  decode-scramble, the platform-index reveal, the `404` reduced-motion guard) carry their own inline FX.
  A hash in `script-src` makes browsers ignore `'unsafe-inline'`, so a single progress-script hash would
  block the other 17. Chosen (owner decision): keep `script-src 'self' 'unsafe-inline'` for now. The
  stable progress-bar hash is `sha256-zbeMm3179IyQub695L7lMzB1ygPiSe0lSSrMfkEOwpc=`; the full 18-hash set
  is reproducible from `dist` (enumerate inline `<script>` bodies, SHA-256 each) but roughly a third are
  volatile authored FX that change with the pages, so hardcoding them into a global header is brittle.
- **script-src also needs `'wasm-unsafe-eval'` (required, verified):** Starlight's search (Pagefind)
  instantiates a WebAssembly module inside a Web Worker (`dist/pagefind/pagefind-worker.js` +
  `wasm.*.pagefind`). Under CSP, WASM compilation needs `'wasm-unsafe-eval'` (or the broader
  `'unsafe-eval'`); without it browsers block it as `blockedURI "wasm-eval"` and search breaks. Confirmed
  empirically on Chromium 148: under only `'self' 'unsafe-inline'`, a direct `WebAssembly.instantiate`
  fires a `script-src` violation (`blockedURI: wasm-eval`, disposition `report` = would block once
  enforced); Firefox 102+ and Safari 16+ gate WASM more strictly still. `'wasm-unsafe-eval'` is the narrow
  WASM-only token (does NOT permit JS `eval` / `new Function`), so it is a minimal, targeted relaxation.
  **Testing lesson (why an earlier pass missed this):** Pagefind's WASM runs in a Worker, and
  worker-context CSP violations do NOT surface on the main-thread `securitypolicyviolation` listener or
  the page console. A search smoke test looked clean while WASM was actually being flagged; the direct
  WASM probe is what exposed it. Always probe WASM directly, not just via a search click.
- **How the worker actually gets the token (precise):** the worker does NOT inherit the document's CSP. The
  same-origin worker script `/pagefind/pagefind-worker.js` is served by the Cloudflare `/*` rule, so it
  receives the SAME CSP header (token included) on its OWN response; the worker's execution context carries
  `'wasm-unsafe-eval'` on that response's merits. Verified by curl: `/pagefind/pagefind-worker.js` (and the
  `wasm.en.pagefind` binary) both return the header, and the worker-WASM run is clean. The worker is a
  same-origin file, not a `blob:` worker, so it is allowed by the policy (a blob worker would have needed
  `blob:` added to `script-src`).
- **Why still Report-Only for a round:** confirms in real browsers (both themes) that the intended policy
  fires zero violations before enforcement makes any mismatch fatal. Once confirmed, enforcement is a
  single directive-name flip (`Content-Security-Policy-Report-Only` to `Content-Security-Policy`).
- **Cross-browser verification (2026-07-05, done):** zero violations under the shipped policy on **Chromium
  148, Firefox 152, and WebKit 26.5** (Safari's engine, driven via Playwright on the Windows host). Each
  engine was checked three ways: a synthetic harness running WASM on the main thread AND in a same-origin
  Web Worker; the REAL Pagefind module imported and searched (returns results, worker WASM runs); and every
  real page plus a real search-UI run, both themes. Necessity was also proven per engine: with
  `'wasm-unsafe-eval'` removed, `WebAssembly.instantiate` / `new WebAssembly.Module` throw `CompileError`
  (Chromium reports a `wasm-eval` violation; FF/WebKit throw under enforcement). Real Safari on Apple
  hardware is the one remaining nice-to-have (WebKit engine is a strong proxy but not identical); run it via
  a cloud lab (BrowserStack/LambdaTest) or any Apple device against a deployed Pages preview, which already
  serves these headers. See ROADMAP.
- **Report-only semantics caught during testing:** `frame-ancestors` and `upgrade-insecure-requests` are
  inert while the policy is `-Report-Only` (WebKit logs a benign console notice saying so; per spec both are
  enforcement-only). They activate on the flip. No protection gap in the interim: the ENFORCED
  `X-Frame-Options: DENY` covers clickjacking and zone HSTS covers transport. They stay in the policy so the
  flip needs no directive edits.
- **Why HSTS is not in _headers:** HSTS is set at the Cloudflare zone level; duplicating it risks a
  conflicting max-age. The zone owns HSTS; `_headers` carries app headers only.
- **Hard constraint recorded:** the CSP MUST NOT use Trusted Types (`require-trusted-types-for` /
  `trusted-types`). The SecretTerminal (`src/components/SecretTerminal.astro`, embedded in `secret.mdx`)
  renders via `innerHTML` (visitor input escaped, only trusted authored markup injected raw); Trusted
  Types blocks `innerHTML` sinks and would break it. Standard CSP is fully compatible.
- **Enforce-phase checklist:** Chromium 148, Firefox 152, and WebKit 26.5 are confirmed clean (incl. real
  search / worker WASM, both themes). Remaining before the flip: optionally a real-Safari-hardware pass
  (cloud lab or Apple device against a deployed preview), then rename Report-Only to enforced. To also drop
  `script-src 'unsafe-inline'`, either enumerate all 18 inline-script hashes (brittle: recompute on any
  FX/Starlight change) or adopt a nonce strategy (needs an edge transform, not present on static Pages).
  Keep `style-src 'unsafe-inline'` and `script-src 'wasm-unsafe-eval'`. Never add Trusted Types.
- **Cache-Control caveat (`/fonts/*`):** the immutable rule means a full year with no revalidation, and the
  font filenames are NOT content-hashed (unlike `/_astro/*`). So if a font is ever re-subset, replaced, or
  a weight added, you MUST change the filename (or add a `?v=` bust); otherwise returning visitors keep the
  stale file for up to a year. Record any such font change here and in CORE_SPEC.
- **Verified:** `public/_headers` emitted byte-identical to `dist/_headers`; no `Strict-Transport-Security`
  line; no Trusted Types directive; no Google/external origins; CSP is Report-Only; `font-src 'self'`;
  `script-src` has `'wasm-unsafe-eval'` (WASM probe fires zero violations with it, both a direct probe and
  a real Pagefind search); both `/_astro/*` and `/fonts/*` immutable rules active; `npm run build` green
  (45 pages); no new deps, versions unchanged. Supersedes the earlier "enforce CSP gated on font
  self-hosting" ROADMAP item.
- **Status:** Adopted + shipped (single static `public/_headers` plus doc edits).

### 2026-07-05 · Spoiler-toggle open border derives from summary color via --spoiler-color (fixes a masked light-mode bug)
- **Decision:** `.sl-markdown-content details.spoiler-toggle` now sets a single `--spoiler-color` custom
  property (`#ffc23d` dark, `#a86f04` light) that BOTH the `[open]` border and the summary color read
  from, replacing two independently hardcoded values. Dark's two values were already identical
  (`#ffc23d`/`#ffc23d`), so dark is unchanged; light's open border moves from `#ffc23d` to the deeper
  `#a86f04` summary color, so the open border always matches the label by construction instead of by
  coincidence. The closed border is unchanged (`rgba(245, 158, 11, 0.45)`, both themes).
- **Bug found during verification (bigger than the ask):** live browser verification (enumerating every
  matching CSS rule via `document.styleSheets`, not just reading source) showed the amber border was
  ALREADY not rendering at all in light mode, in either state, before this fix, for a reason unrelated to
  the open/summary color values: two generic, unconditional rules elsewhere in `custom.css` also set
  `border-color` on any `.sl-markdown-content details` / `details[open]` and have higher specificity than
  a plain `.spoiler-toggle` selector, so they silently won: `html[data-theme="..."] .sl-markdown-content
  details { border-color: ... }` (the base per-theme card border, specificity classes=2/types=2) beat the
  closed-state rule (classes=2/types=1) in BOTH themes, and light-only `:root[data-theme='light']
  .sl-markdown-content details[open] { border-color: var(--tp-divider); }` (written to stop a REGULAR
  toggle's border turning green on open, classes=4/types=1) beat the open-state rule (classes=3/types=1)
  in light. Net effect verified before this fix: light mode showed a neutral gray border
  (`--tp-divider`, `#c6c0b4`) in both states; dark showed gray closed / correct `#ffc23d` open (no
  light-only `[open]` competitor exists in dark). So the "brighter gold over deep gold" mismatch described
  in the request was never actually visible either, a different bug (the gray fallback) was masking both
  the old value and the intended fix.
- **Fix (scoped, user-chosen over two alternatives):** the closed- and open-state border rules are
  prefixed with `html[data-theme]` (attribute-presence match, not tied to a value, so it still resolves
  per-theme via the token) purely to out-specificity the two generic rules above: closed becomes
  classes=3/types=2 (beats the base rule's classes=2/types=2 on the class tier), open becomes
  classes=4/types=2 (ties the light `[open]` rule's classes=4, wins on the type tier, 2 vs 1). This only
  touches `.spoiler-toggle`'s own selectors; the two shared generic rules (and every other toggle that
  depends on them for the "no green edge on paper" behavior) are untouched. Rejected: editing the two
  shared rules to add `:not(.spoiler-toggle)` instead, same visual result but a larger blast radius across
  every content toggle on the site for no added benefit.
- **Verified live** (both themes, both states, via `getComputedStyle` + a full matching-rule enumeration,
  not just the token value): dark closed `rgba(245, 158, 11, 0.45)`, dark open `rgb(255, 194, 61)`
  (`#ffc23d`, matches summary, unchanged from before); light closed `rgba(245, 158, 11, 0.45)` (now
  correctly amber instead of the masked gray, a bonus fix beyond the original ask), light open
  `rgb(168, 111, 4)` (`#a86f04`, matches summary exactly, the requested fix). A regular (non-spoiler)
  toggle on `busqueda.mdx` was spot-checked and is unaffected: closed and open borders are still
  identical (`--tp-divider`), so the "no green edge" behavior for ordinary toggles is untouched.
  `npm run build` green (45 pages).
- **Status:** Adopted + shipped (custom.css only).

### 2026-07-05 · Remark plugin auto-injects the PasswordReveal import (no per-file import needed)
- **Decision:** New additive build-time plugin `plugins/remark-inject-passwordreveal.mjs`, wired into
  `astro.config.mjs` via `markdown.remarkPlugins` (a new array; only `rehypePlugins` existed before). It
  walks each MDX file's mdast tree and, ONLY when the file contains a `<PasswordReveal .../>` JSX element
  AND does not already import `PasswordReveal` itself, prepends an `import PasswordReveal from
  '@components/PasswordReveal.astro'` ESM node to the tree. Writeup authors (and eventually
  `notion_cleaner.py`) now write `<PasswordReveal password="..." />` inline with zero import boilerplate;
  this is what makes rolling PasswordReveal out across 34+ Bandit pages (ROADMAP) tractable instead of a
  34-file manual-import chore.
- **Why a remark plugin, not a components map:** Starlight renders docs-page MDX internally, so the
  `<Content components={...}>` override point Astro exposes for user-land MDX rendering is not reachable
  for Starlight docs. A build-time AST transform on the same legacy `unified()` pipeline the existing rehype
  plugin (`rehype-content-image-loading.mjs`) already runs on is the mechanism that is actually reachable,
  and is purely additive (new `remarkPlugins` key alongside the untouched `rehypePlugins` key).
- **Mechanism (verified, not assumed):** MDX represents a component tag as an `mdxJsxFlowElement` /
  `mdxJsxTextElement` mdast node (`name === 'PasswordReveal'`), and an ESM import as an `mdxjsEsm` node whose
  `data.estree` is a full ESTree `Program` (confirmed by reading `mdast-util-mdxjs-esm`'s source directly:
  `node.data = {estree}` is set from the parsed token, and `@mdx-js/mdx`'s hast/estree stage splices that
  `Program`'s body into the compiled module, not `node.value`). Detection uses `unist-util-visit`; the
  injected import's `data.estree` is produced by parsing the exact import string with `acorn.parse(source,
  {ecmaVersion: 'latest', sourceType: 'module'})`, guaranteeing an ESTree shape byte-identical to what the
  real compiler would produce for a hand-written import, rather than a hand-rolled AST literal that could be
  subtly wrong. Both `unist-util-visit` (5.1.0) and `acorn` (8.16.0) are already present in `node_modules` as
  transitive dependencies of `@astrojs/mdx` (which Starlight injects automatically; it is not itself listed
  in this project's `package.json`), so nothing was added to `package.json`.
- **Import specifier:** `@components/PasswordReveal.astro` (the existing Vite alias), used as-is. Verified
  by an actual `npm run build` (not inferred): the caveat that Vite aliases can fail to resolve in
  build-time-injected imports (the same caveat that applies to MDX image paths, which use a different,
  astro:assets-specific resolution path) does NOT apply here, because MDX compilation never inspects or
  rewrites plain `import` specifier strings itself; it only emits them into the compiled JS module verbatim,
  and Vite/Rollup then resolves that module's imports exactly as it would for any hand-authored file. No
  fallback (relative-path) specifier was needed.
- **Conditional injection, verified empirically, not just by reading the code:** temporarily instrumented
  the plugin to log every file it decided to inject into, then ran `npm run build` (45 pages). Exactly one
  file logged, `overthewire/bandit/0-1.mdx`, with `alreadyImported: false`. Then temporarily restored a
  manual `import PasswordReveal from '@components/PasswordReveal.astro'` line in that same file and rebuilt:
  the plugin logged `alreadyImported: true` and skipped injection, and the build stayed green (a duplicate
  injection would have produced a JS duplicate-binding `SyntaxError` at build time). The instrumentation was
  then removed. This is the live proof that the guard against double-import (an author who writes both the
  tag and a manual import) is not just a hoped-for property, it is exercised and does not break the build.
- **Live testbed:** `overthewire/bandit/0-1.mdx`'s manual `import PasswordReveal from
  '@components/PasswordReveal.astro'` line (added when PasswordReveal first shipped, same date) was removed;
  the file now has only `<PasswordReveal password="..." />` with no import, relying entirely on the plugin.
  `import Toggle from '@components/Toggle.astro'` (for the still-present `spoiler-toggle`) is untouched.
- **Verified:** `npm run build` green, 45 pages, no unresolved-import warnings. In-browser on the built
  page: `.pwreveal` renders inline immediately after the `spoiler-toggle` `<Toggle>` (source order), not
  appended at the end of the page (distinct from the Footer/`<Principle>` auto-append mechanism); reveal
  click swaps the button to Copy in place with the real password value; dark computes
  `background-color: rgba(245, 158, 11, 0.08)` and light (via the shared `starlight-theme` key)
  `rgba(245, 158, 11, 0.14)`, both exact matches for the values recorded in the PasswordReveal entry above,
  confirming the component's rendering and theming are unaffected by how its import arrives. `busqueda.mdx`
  (a page that does not use PasswordReveal) was spot-checked in-browser: no injected import side effects,
  content images, `starlight-image-zoom`'s "Zoom image" buttons, and `ToggleAll`'s "Expand all" control all
  still render, zero console errors. The existing rehype plugin, `expressiveCode` config, and
  `PasswordReveal.astro` itself were not modified.
- **Status:** Adopted + shipped. Unblocks the ROADMAP rollout of PasswordReveal to the remaining 33 Bandit
  pages: those pages now only need the `<PasswordReveal password="..." />` tag, no import line, and
  `notion_cleaner.py` (still uncommitted) only needs to emit the tag, not an import, when it adopts this
  convention.

### 2026-07-05 · PasswordReveal: a dedicated amber component for wargame passwords (not a FlagCapture reuse)
- **Decision:** New additive component `src/components/PasswordReveal.astro` (prop `password: string`)
  renders the OverTheWire Bandit "reveal the password" affordance as its own thing, deliberately distinct
  from `FlagCapture`: a wargame password is a WAYPOINT the reader pastes into SSH, not a trophy to
  capture. No gold/loot styling, no signature decode/scramble animation (reserved for real flags in
  FlagCapture). This reverses the direction implied by the 2026-06-27 FlagCapture entry and its matching
  ROADMAP item ("Apply FlagCapture to the Bandit Reveal Password toggles"); that swap is superseded by
  this dedicated component.
- **Layout/behavior:** a `PASSWORD` label, the value spoiler-blurred (`filter: blur(5px)`, purely visual;
  the real value is always in the DOM for screen readers and copy) as plain text with no border,
  background, or hover affordance of its own, then ONE control on the right, the ONLY interactive
  element in the row. It starts as an eye icon + "Reveal"; on click the value unblurs and the SAME
  control swaps in place to a copy icon + "Copy" (one swapping slot, no layout shift, focus stays put).
  A second click copies to the clipboard (with a `document.execCommand('copy')` fallback for non-secure
  contexts) and shows "Copied" for ~1.4s before reverting. No native `title` tooltip (tried once, dropped:
  looked bad); `aria-label` alone carries the accessible name ("Reveal password" -> "Copy to clipboard").
  A real `<button>` (keyboard + focus); reveal/copy are announced via a visually hidden
  `aria-live="polite"` region (`.pw-live.sr-only`, a new project-first visually-hidden utility in
  custom.css): no visible "Password revealed"/"Password copied" text ever appears.
- **Visual identity:** only the BUTTON reads as interactive; the label and value are also non-selectable
  (`user-select: none` on the container, inherited down), so copying is the only way to take the value,
  matching FlagCapture's captured-value pattern. The row is a passive AMBER CARD (not the neutral
  hairline frame of an earlier pass): literal `rgba(245, 158, 11, ...)` washes/borders on the container
  (dark 0.08 fill / 0.4 border, light 0.14 fill / 0.55 border, stronger and more golden), matching the
  site's canonical OverTheWire system (the same values `.spoiler-toggle` uses). The button text/icon uses
  the OTW accent directly, `#ffc23d` dark / `#a86f04` light (literal hex, not a token), with an
  `rgba(245, 158, 11, ...)` border/hover wash. Values are literal (no `color-mix()`/custom-property
  indirection) specifically so nothing can fail to resolve. Deliberately NOT `--flag-gold` (`#ffc23d`
  dark / `#C6A243` light happens to share the dark hex with OTW's accent, but the container/wash colors
  and the light accent differ, so the two never read as the same gold-flag treatment).
- **Two bugs caught over this component's revisions (engineering notes):** (1) an intermediate pass moved
  the amber off the container onto custom-property tokens (`--pw-amber-bg` etc. via `color-mix()`) and
  ended up rendering as a neutral/near-black box in practice; reverted in favor of the literal `rgba()`
  values above, which cannot fail to resolve. (2) a separate intermediate pass added
  `.pw-value:hover { filter: inherit; }`, meant as "hovering changes nothing." `inherit` instead pulls the
  PARENT's (`.pwreveal`) computed `filter`, which is always `none` (the container never sets `filter`), so
  hovering the STILL-LOCKED value silently removed the blur and exposed the password, defeating the
  spoiler; confirmed live (`.pw-value:hover` gave `filter: none` while `data-revealed` was still unset).
  Fixed by dropping the hover rule entirely: with no `:hover` rule touching `filter` anywhere, the
  existing blur/reveal rules govern it unconditionally in both states, which is what "hover changes
  nothing" actually requires.
- **Motion:** the only animation is the blur-to-clear `filter` transition, gated behind
  `@media (prefers-reduced-motion: no-preference)` in CSS alone: no JS matchMedia branch needed (unlike
  FlagCapture's decode, which is a real script-driven animation). Under reduced motion the value still
  reveals, just instantly.
- **Scope:** component + the `.pwreveal` block in `custom.css` only (placed after the `.spoiler-toggle`
  rules, before "LIGHT SURFACE DEPTH"), including the `.sr-only` utility. Not wired into `FlagCapture.astro`
  (separate file, by design). Now applied to `overthewire/bandit/0-1.mdx` (owner-wired, alongside the
  existing `<Toggle class="spoiler-toggle">` reveal, not replacing it yet); rolling it out to the
  remaining 33 Bandit pages (and removing the redundant spoiler-toggle once confirmed) is tracked in
  ROADMAP, same as the truncated-PEM rule (DECISIONS 2026-06-26) which is unaffected.
- **Verified:** both themes live in dev on `overthewire/bandit/0-1`. Container background/border compute
  to the exact literal values in both themes (dark `rgba(245, 158, 11, 0.08)` fill / `rgba(245, 158, 11,
  0.4)` border; light `rgba(245, 158, 11, 0.14)` fill / `rgba(245, 158, 11, 0.55)` border); button color
  computes to `rgb(255, 194, 61)` dark / `rgb(168, 111, 4)` light, exact matches for `#ffc23d` / `#a86f04`;
  container, label, and value all compute `user-select: none` (button alone is excluded and remains the
  only selectable/interactive element); container and value both compute `cursor: default`, button alone
  `cursor: pointer`; hovering the still-locked value leaves `filter: blur(5px)` and `data-revealed` unset
  (no reveal-on-hover); `.pw-live` computes to a 1x1px clipped box (screen-reader-only); the button never
  carries a `title` attribute (confirmed with the owner this stays removed, superseding the "tooltip"
  wording briefly reintroduced in an intermediate spec); reveal flips `filter` from `blur(5px)` to `none`
  with the bounding box byte-identical before/after at a real desktop width (no layout shift; a narrow
  ~279px viewport in one test pass did show a height delta, traced to the password text wrapping fewer/
  more lines as the button's label goes Reveal -> Copy, not a regression, not reproducible at normal
  reading widths). `npm run build` green (45 pages).
- **Status:** Adopted + shipped (component + custom.css). Application to the Bandit writeups is future
  work (ROADMAP), same as the still-uncommitted `notion_cleaner.py`.

### 2026-07-04 · Self-hosted fonts (subset WOFF2 + metric-matched fallbacks), Google Fonts removed
- **Decision:** Syne and JetBrains Mono are self-hosted as subset WOFF2 under public/fonts/ (served at
  /fonts/), replacing the remote Google Fonts request. Removes an external origin (privacy/optics on a
  security site), the extra DNS/TLS, and the render-blocking external stylesheet; the cross-site cache
  benefit is dead since browsers partition the HTTP cache by top-level site.
- **Faces:** JetBrains Mono 400/500/700 roman + 400/500 italic (broad subset: Latin, punctuation,
  currency, arrows, math, box drawing, block elements, geometric shapes, misc technical and symbols,
  since it renders terminal output); Syne 600/700/800 (narrow: Latin + general punctuation). 8 files,
  ~300 KB. Subset locally with fonttools pyftsubset + brotli in a throwaway venv (NOT a project
  dependency; not in package.json or the build).
- **@font-face home:** src/styles/fonts.css (not custom.css, so Design keeps custom.css authorship),
  loaded via Starlight customCss and imported by the two marketing pages. Font stacks are the real
  family, then the metric-matched fallback, then the generic.
- **Shift-free swap:** two fallback @font-face families with size-adjust + ascent/descent/line-gap
  overrides computed from the real font metrics (JetBrains Mono vs Courier New = 99.98/102.02/30/0;
  Syne vs Arial = 123.39/74.97/22.29/0). Each lists Windows and macOS locals first, then DejaVu and
  Liberation so the shift-free swap also applies on Linux, then the generic.
- **Preloads:** only jetbrains-mono-400 and syne-800 (the dominant above-the-fold body/code and display
  faces), crossorigin. font-display: swap on every real face.
- **Verified:** zero fonts.googleapis/gstatic references (source + dist), both themes render identically,
  the Principle coda now uses a REAL JetBrains Mono italic, no tofu on terminal glyphs, build green
  (45 pages). Supersedes the "loaded from Google Fonts" note in CORE_SPEC and the self-host ROADMAP item.
- **Follow-up:** /fonts/*.woff2 should get Cache-Control: public, max-age=31536000, immutable via the
  pending public/_headers (out of scope, not touched).
- **Status:** Adopted + shipped.

### 2026-07-04 · Principle coda auto-appends from frontmatter; JetBrains Mono italic loaded
- **Completes** the follow-ups from the Principle-component entry below (auto-append, footer silence, true
  italic face).
- **Schema:** `content.config.ts` docs schema gains optional `principle: z.string()`, alongside os/tags.
- **Auto-append:** a second additive Starlight override, `src/components/overrides/Footer.astro` (Footer is
  the only default component rendering the Prev/Next `<Pagination />` after the content). On writeups that
  declare a non-empty `principle` it renders ONLY the shipped `<Principle>` coda, so the coda is the last
  thing on the page and no pagination/footer renders beneath it (the silence). Coupled to the coda: no
  principle means the default footer renders normally. Non-writeup pages are untouched. Writeup detection
  uses `entry.filePath` (under a platform dir, not an index page), robust across HTB tiers, VulnHub/Pico
  flat, and the OTW bandit hub. The coda is wrapped in a `.sl-markdown-content` element so the design's
  scoped `.sl-markdown-content .principle` CSS applies from the footer seam without touching custom.css.
- **Italic:** the Google Fonts head link adds the JetBrains Mono `ital` axis (0/1, weights 400 and 500), so
  the italic maxim uses the true italic face, not a synthetic slant (JetBrains Mono is monospace, so the
  face is confirmed via document.fonts, not glyph width).
- **Verified** both themes, all page types (writeup with/without principle, landing, bandit hub); build
  green (45 pages). Additive overrides, no forks; PageSidebar override untouched.
- **Status:** Adopted + shipped.

### 2026-07-04 · Decisive-line focus highlighting for Expressive Code {n} markers
- **Decision:** a fence line marked `{n}` reads as focus: a lime gutter accent bar plus a restrained
  background tint that sits UNDER the semantic command-token colors and never competes with them. custom.css
  only, after the EC scrollbar rules. Tint kept low (dark `--sl-color-accent` 10%, light `--tp-deco-lime`
  12%); the lime lives only in the gutter (2px border-inline-start).
- **Selector / EC coordination:** targets `.ec-line.mark` (the class EC 0.42 applies; the element also
  carries `highlight`). custom.css is unlayered, so it cleanly overrides EC's default blue marked-line
  background (`rgba(154,182,255,.6)` light / `rgba(23,74,144,.6)` dark) with no `styleOverrides` needed and
  no doubling. Token colors (sudo magenta, recon, network cyan) stay untouched.
- **Verified** both themes on a marked line with sudo/nmap/curl: lime gutter + tint, tokens unchanged. No
  motion. Supersedes the "EC {n} highlights unused" note in CORE_SPEC.
- **Status:** Adopted + shipped.

### 2026-07-04 · Principle: a closing epigraph component for writeups (centered italic mono maxim)
- **Decision:** New additive component `src/components/Principle.astro` (prop `text: string`) renders the
  one-line lesson a writeup decrypts to as a literary epigraph, not a callout: `<aside class="principle">`
  with a dinkus (three-dot scene break), a small uppercase mono `PRINCIPLE` label, and the maxim in
  centered italic JetBrains Mono. Styled in custom.css after the lead-blockquote rules. No border,
  background, box-shadow, icon, accent color, or motion; identity is the mono label plus placement. Meant
  to be the LAST content element, after the Defense callout. Both themes via `--sl-color-text` /
  `--sl-color-gray-3` / `--sl-color-gray-4` (no lime, deliberately).
- **Placed on** busqueda as the working demo (`text="Parameterize, do not sanitize."`, which is busqueda's
  own Reflection lesson #1), imported via the `@components` alias. The task's relative `../../../components`
  path was the wrong depth for a difficulty-tier writeup (would resolve to a non-existent
  `src/content/components/`); the alias is the repo convention and what the other imports use.
- **Known caveat (engineering):** the maxim renders as a SYNTHETIC slant, not JetBrains Mono's true
  italic, because the Google Fonts link in `astro.config.mjs` loads `JetBrains+Mono:wght@400;500;700` with
  no `ital` axis (verified: zero italic faces loaded; normal vs italic glyph widths identical). Fix is a
  one-line font-URL change (add the `ital` axis), deferred as an engineering item, config left untouched.
- **Follow-ups (ROADMAP):** auto-append via the pipeline (so authors do not hand-place it), suppress
  Starlight pagination/footer beneath it on writeups (nothing should render after the coda), load the
  true italic face.
- **Verified** on busqueda both themes: aside with no border / background / shadow, centered italic mono
  maxim in `--sl-color-text`, quiet gray dinkus + label, sitting ~58px below the Defense callout. Type-safe
  (`Props.text: string`); `npm run build` green (45 pages).
- **Status:** Adopted + shipped (component + custom.css; demo on busqueda).

### 2026-07-04 · Port label is a cyan recon tag; recon findings become an aligned table with an Assessment eyebrow
- **Problem:** `.port-label` was only a red color override, which clashed with the cyan recon callout it
  lives in and, like the old inline-code chip, spent an alert color on a neutral identifier (a port is an
  address, not a danger). Separately, a recon callout's port list read as a loose bullet list with no
  structure.
- **Decision (A, port tag):** `.port-label` becomes a calm cyan mono TAG (1px border + soft tint + bold
  700) that harmonizes with the recon accent and out-ranks a passing inline-code reference by WEIGHT, not
  by adding another cyan shade. Theme-aware: bright `#41efff` text on the near-black dark tint, deeper teal
  `#05495b` on the warm light paper; fills/borders are `color-mix` of `#41efff` / `#096577` (the recon
  accent + its light ink). `!important` on `color` is kept to retain the prior override strength.
- **Decision (B, findings layout):** inside `.cl-recon`, a markdown port list becomes a scannable findings
  table: `list-style:none`, each `li` uses a hanging indent (padding-left 5.6em / text-indent -5.6em) so
  wrapped notes align under the description, and the row-leading tag gets `min-width:4.9em` so ports align
  down a left rail (port tags used inline in prose stay snug). The concluding paragraph is the ASSESSMENT:
  a `:has(ul)`-gated hairline (`--acc` @ 24%) plus an uppercase mono `Assessment` eyebrow (bright `--acc`
  on dark, deep `--cl-ink` on light). `:has(ul)` means a prose-only recon callout shows no eyebrow.
- **Gotcha fixed:** `text-indent` is an inherited property, so the li's `-5.6em` hanging indent leaked into
  the `.port-label` inline-block and shoved its own port text off-screen (rendered at x ~= -48, invisible).
  Fixed with `text-indent:0` on the tag rule; the row hanging indent and the tag's position on the line are
  unaffected (both governed by the li, not the tag). This one line is the only deviation from the pasted spec.
- **Scope:** `.cl-recon` only; other callout types and normal lists untouched. The eyebrow label is the
  single word in `content`, changeable in one place. No new tokens, no new deps, no motion.
- **Verified** on busqueda (both themes): ports read as cyan tags (no red anywhere), port weight 700 vs the
  harmonized inline-code 400, tags align in a column, notes wrap under the description, the assessment sits
  under a hairline with the eyebrow (deep teal light / bright cyan dark), and an injected prose-only recon
  callout shows no eyebrow (`::before` content `none`, border 0).
- **Status:** Adopted + shipped (custom.css only).

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
- **SUPERSEDED 2026-06-30 (surface only):** the chip is now NEUTRAL and the red identity lives only in
  the text. Structure (5px radius, 1px border, 0.12em 0.4em padding, 0.875em, red mono text) and the
  no-special-casing behavior are unchanged; only the fill + border moved off red so neutral tokens
  (filenames, ports) never broadcast false urgency. New values: DARK fill `rgba(255,255,255,0.055)` +
  border `rgba(255,255,255,0.11)` (white-alpha, adapts across the page / toggle panel / `<summary>`);
  LIGHT fill `#ece2d6` + border `var(--tp-divider)` (the shared structural hairline). Red text is
  unchanged (`#ff9b9b` / `#b03326`); AA on its own fill is dark 9.0:1, light 4.9:1 (verified live, both
  themes). The callout-harmonize rule (2026-06-29) is untouched. `npm run build` green (45 pages).

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
