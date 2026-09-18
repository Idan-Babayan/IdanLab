# Idan.Lab — Roadmap

> Volatile by design. Groom this often. Format: **Now** (active), **Next** (committed,
> not started), **Later** (parked). Completed items are DELETED from this file on
> completion, not archived here. Their shipped state lives in CORE_SPEC and their
> rationale, if any, in DECISIONS. This file is forward-looking only.
> Each item: `[area] description - owner-note`. Areas: DESIGN, CONTENT, ENG, PRODUCT.

## Now (in progress)

- [DESIGN] **THE GEIST RETUNE. No longer a merge gate: the release hold was LIFTED 2026-07-27 and `dev`
  shipped to `main`.** The hold existed so production would not serve a half-refitted body face. That is
  satisfied, because the prose foundation is locked and derived rather than eye-called, and everything
  still open below is chrome or component internals rather than the body face. **The clusters below are
  now POST-MERGE work and each ships to `main` on its own**, by a `git merge --no-ff dev` run locally
  rather than a pull request, instead of accumulating on `dev` waiting for one release. Nothing here blocks a deploy any more; what ships knowingly unfixed is
  listed in DECISIONS 2026-07-27. See DECISIONS 2026-07-26 for the original gate and why splitting the
  refactor from the retune was rejected at the time.

  What the retune inherits, and why it should be a values exercise rather than an archaeology one: the
  theme pass is now layered, purged and tokenized. Every dial below is a custom property in ONE block at
  the top of `tokens.css`, precedence is decided by layer order rather than selector weight, and the dead
  rules that would have made a retune ambiguous are gone.

  1. **The prose dials.** The FOUNDATION four are now LOCKED and derived, not eye-calls: `--prose-size`
     (1.125rem = 18px), `--prose-leading` (1.7), `--prose-measure` (aliased to `--sl-content-width`,
     46rem) and `--prose-paragraph-gap` (1em), all recomputed from characters per line against Geist.
     Recompute from that derivation rather than nudging any of them. Still genuine eye-calls on a real
     screen: `--prose-strong-weight` (600 vs 700 against Geist), the two toggle-title dials
     `--toggle-title-face` (`var(--body-face)` reads as a content label, `var(--sl-font-mono)` as terminal
     voice) + `--toggle-title-weight` (600 vs 700), `--blockquote-pad-y`, and the heading pair
     `--heading-space-above` / `--heading-space-below` (1.5em / 0.5em, 3:1, and the space below must stay
     under `--prose-paragraph-gap` at every level). Also confirm italic prose renders Geist's drawn italic
     rather than a slant. Both themes, wide and 375px.
     Note `--prose-heading-gap` no longer exists: it was retired 2026-07-27 as an instance of the context
     law (see DECISIONS), and `--blockquote-pad-x` is deliberately rem, not em.
  2. **The rest of the design against the new body face.** Geist changed the body but the surfaces around
     it were tuned for mono: the measure, the vertical rhythm between prose and components, and how the
     mono chrome (badges, callout labels, code frames, the Principle coda) now reads BESIDE a proportional
     face rather than matching it. This is the part that has not been done at all.
  3. **The unit rule is written and not applied** (`layers.css` header): rem or px for component geometry,
     em only where scaling with the local font size is the declared intent. Applying it belongs to THIS
     retune, because converting a unit changes rendered geometry and each conversion needs its own
     before-and-after measurement. Do not sweep it.
  4. **One recon-rail question to judge at 375px** (added 2026-07-27). The rail's chip track now carries
     `--findings-gutter` (0.8rem) so the column rule has equal clearance on both sides, which narrowed the
     description column by 14.80px and pushed one Forest row from two lines to three on a phone. Nothing is
     broken (no horizontal overflow, continuation error still 0.00), but whether a narrow screen wants the
     same gutter as a wide one is a taste call, and it is a one-token change. See DECISIONS 2026-07-27.
     Under text scaling the question no longer arises: below 12rem of rail width the rail stacks to one
     column (2026-09-18, CORE_SPEC §6 "Narrow-width containment"), so this is about normal size only.

  Record each settled value in DECISIONS as its cluster lands, and delete the dial from this item once it
  is settled. Each cluster merges to `main` on its own now, so there is no longer one release holding
  everything back.

- [CONTENT] Revisit `404.mdx`: owner made manual changes on 2026-06-28 and wants to review/refine it
  again on a later day.
- [ENG/INFRA] Domain rebrand, remaining work only (in-repo is done): Pages custom domain, the 301 from
  idanstudio.click and its eventual sunset, Cloudflare email on @idanlab.dev, Search Console and sitemap
  resubmit, external link updates. All owner-side or other-chat work.
- [CONTENT] Verify the ToggleAll few-pixel shift fix in real browsers (see Open bugs), then it can be
  considered closed.
- [ENG] WriteupMeta filter routes: `/platform`, `/os` and `/environment` do not exist, so the three
  navigational chips render as non-interactive `<span>` rather than `<a>`. When the routes land, restore
  the anchors kept commented in `WriteupMeta.astro` (they restore verbatim) and drop the temporary
  `data-astro-prefetch="false"`, which exists only to stop every writeup prefetching dead routes. Same
  machinery as the deferred `/principles` index, so the two are worth building together. The badge system
  itself is complete and injected from frontmatter; this is the only piece left.

- [CONTENT] Reuse `AttackPath` on other multi-hop writeups. Live on two so far, Forest and Return, both
  under `## Summary`. It is data-driven, so adding one is authoring a `nodes[]` array with no component
  change, and the component is considered signature-quality and stable. Good candidates are any chain with
  3 or more hops. Deliberately NOT retrofitted onto single-hop writeups, where a two-node path says less
  than the prose already does. It is LINEAR ONLY: a writeup whose escalation genuinely branches needs a
  design decision first, not a quiet extension of this component.

- [ENG/INFRA] GitHub Support request for the pull request refs: PENDING, and may be declined. The identity
  rewrite cleaned `main` and `dev`, but 23 server-managed `refs/pull/N/head` refs still hold pre-rewrite
  history carrying the old author address, and they are not writable by push. GitHub's documented policy
  is that Support removes sensitive data only where the risk cannot be mitigated by rotating credentials,
  and an email address is not a credential. Track the outcome; if declined, the residual is permanent and
  should be recorded as accepted rather than re-attempted. See DECISIONS 2026-08-01 · One identity across
  all history: the repository is rewritten and force-pushed.

## Next (committed)
- [ENG/DESIGN] Unify the two marketing pages (home, about) under the `--focus-ring` token established for
  content pages (CORE_SPEC §6 "Focus ring system"; DECISIONS 2026-07-13). This is now the LAST gap in the
  token system: every content-page ring flows through `--focus-ring` (ToggleAll was the final holdout and
  landed 2026-07-17, see DECISIONS), so the marketing pages are the only place a ring color is still
  hardcoded. The token system is content-only by decision; this second step folds their inline
  `:focus-visible` rings (currently `outline: 2px solid var(--lime)` + per-card `outline-color:
  var(--accent)` from the 2026-07-13 focus-states work) into the same model: an inline
  `:root{--focus-ring:var(--lime)}` default + the shared `:where(...)` rule + `--focus-ring: var(--accent)`
  on the platform cards, in EACH page's `<style is:global>` (they do not load the theme-pass modules). Net: no ring
  color hardcoded anywhere. Keep both themes, `:focus-visible` only, no motion. Note the marketing pages
  have no Starlight `markdown.css` under them, so the orphaned-margin geometry bug fixed on content toggles
  (DECISIONS 2026-07-17) does not apply there.
- [CONTENT] Mass-import ~50 existing writeups via the pipeline (HTB / VulnHub / PicoCTF / OTW), each as a
  flat `.mdx` with images under the parallel `src/assets` tree (DECISIONS 2026-06-30). Once HTB
  Medium/Hard folders have content, uncomment those (lowercase) sidebar groups in `astro.config.mjs`.
  For PicoCTF all six per-category sidebar groups are already written in `astro.config.mjs`; uncomment
  each when its directory gets its first writeup (an `autogenerate.directory` that does not exist fails
  the build). Five are live as of 2026-09-04 (General Skills, Cryptography, Web Exploitation, Forensics,
  Binary Exploitation); only Reverse Engineering is still commented, and the archive holds nothing for it.
- [CONTENT] Author `principle:` frontmatter on HackTheBox writeups (optional, HTB only, build-guarded;
  see CORE_SPEC §7). Three carry one today: busqueda, return, forest. The coda renders inside the
  content with the default pager beneath it (2026-09-03).
- [PRODUCT] Global `/writeups` index (path 3): reuse `WriteupCard` with `showPlatform` true for a
  mixed cross-platform grid (the card was built for this).

## Later (parked)
- [CONTENT] Revisit a scripted content-cleaning pass only if manual polish proves to not scale; deliberately deferred, not abandoned.
- [CONTENT] Surface topic tags as a browsable index (filter writeups by technique). DEFERRED by decision,
  not abandoned: a canonical tag taxonomy is drafted and parked as a spelling reference, but tags stay out
  of frontmatter until writeup volume (~30 to 40) makes a filter earn its place. Below that a tag maps to
  one or two writeups and a filter returns a dead end, so it is pure invisible metadata for now. When it
  activates, tag emission + validation ride the import pipeline (see the content-taxonomy guard follow-up
  in this section) so there is no separate backfill.
- [ENG] Starlight plugins: scroll-to-top button, mobile sidebar swipe, fullscreen code blocks.
- [DESIGN] Replace `ethical-hacking.png` about portrait with a transparent custom SVG.
- [ENG] Extract repeated UI into reusable Astro components (cards, badges, buttons, hero FX).
- [ENG] CI on push: type-check, build, link-check, (later) visual-regression screenshots.
- [ENG] Content-taxonomy build guard (`plugins/remark-validate-content-taxonomy.mjs`) shipped as the
  astro-check alternative (DECISIONS 2026-07-12). Both original follow-ups are now CLOSED. The
  "narrow or remove the class families" half: only `machine-` was dead and it was removed 2026-07-19; the
  rest stay because `WriteupCard` still emits them (DECISIONS 2026-07-19). The "extend it to frontmatter"
  half: frontmatter metadata is now validated by strict Zod enums in `content.config.ts` instead, which is
  the better home for it (the remark stage does not see frontmatter cleanly, and Zod gives editor support),
  so the guard keeps its hand-authored-markup boundary and its WriteupMeta prop checks were retired
  (DECISIONS 2026-07-20). Only `tags` remains unvalidated, and it is deliberately unused for now.
- [CONTENT] Writeup `_template.mdx` so every new writeup starts consistent.
- [ENV] Change Windows username from Hebrew to English (new admin account).
- [ENG] Real platform-logo SVGs in sidebar via a Starlight Sidebar component override
  (alternative to the colored dots).
- [ENG] ToggleAll on mobile: currently desktop-only (hidden below the lg breakpoint). To put it inside
  the collapsed "On this page" dropdown would need a second override (`MobileTableOfContents`); deferred
  (owner judged the bulk control a poor fit for narrow screens; individual toggles still work on mobile).
- [DESIGN] Revisit the Active Directory topology glyph (low priority, no urgency). The diamond is not
  broken and ships as-is: it passes the silhouette test (its outline reads at 15px with the interior
  contributing nothing, which is exactly why it works). Parked only because Idan may want to move off it
  later, not because anything is wrong. Context for whoever picks it up, so the dead ends are not re-walked:
  - Concept A ("one node vs three linked nodes") is REJECTED, do not retry it. Two independently fatal
    reasons: three ~4px nodes fuse into a Λ letterform at 15px, and Active Directory and Standalone occupy
    the same scalar `environment` slot so they never co-occur, meaning a node-count contrast has no on-page
    reference to read against.
  - The design bar for any replacement: the silhouette carries the meaning, the interior does nothing (at
    15px, part-count is not a legible channel). Starting directions that fit the bar: folder-tree bracket,
    nested/concentric forms, hierarchy fork.
  - Standalone's ring stays regardless. It beat every candidate by resolving its hole at 15px and dodging
    the prospective PicoCTF two-disc collision. This item is AD only.
  - Any redraw inherits the current 15px hull-area grid (model B, cap 1.128) and, being a we-authored
    geometric glyph, should size by hull area rather than clamp. It also retires the Amido `<metadata>`
    attribution the diamond asset currently carries.

## Open bugs / known issues

- [DESIGN] **The `46ch` Principle cap is the third instance of the context law and is deliberately NOT
  fixed** (CORE_SPEC section 8, DECISIONS 2026-07-27). `.sl-markdown-content .principle` declares
  `max-width: 46ch`, and `ch` resolves on the ASIDE (18px JetBrains Mono, 1ch = 10.80px) giving 496.80px,
  while the text it caps is `p.principle-text` at 22.4px (1ch = 13.44px). The maxim therefore measures
  **36.97 characters, not 46**, and never has measured 46: 38.3 at authoring (16px context, 1.2rem maxim),
  38.0 after the Geist pass, 36.97 after the foundation lock. The rendered cap has moved three times
  without the Principle being touched.
  **Why it is parked rather than corrected:** the other two instances had a fix that changed alignment
  without changing intent. This one does not. Honouring the declared 46 characters widens the block from
  496.80px to about 618px, roughly **+120px**, which visibly changes the coda's proportions on every
  writeup. That is a design decision about how wide the closing maxim should be, not a correction, and it
  belongs to the Geist retune where the measure is being judged on a real screen anyway.
  **When it is picked up,** the remedy is 2 or 3 from the context law: declare the cap on
  `p.principle-text` so `ch` resolves against the maxim's own 22.4px, or convert to rem and comment the
  coupling. Decide the character count first, then derive; do not carry 496.80px across.

- [ENG] **Inline code is the last consumer of `--mono-chrome-size` that does not pin its leading**
  (CORE_SPEC section 8, "a pinned size implies a pinned leading"). `:not(pre) > code` reads the pinned
  14px but still inherits `--prose-leading`, so half its metrics track prose. Deliberately out of scope so
  far, and the reason is real rather than lazy: inline code sits INSIDE running paragraphs, so pinning its
  leading changes prose line boxes. That makes it a reading-surface decision, which belongs to the Geist
  retune, not a component fix. `.port-label` was the other consumer and is now pinned via
  `--mono-chrome-leading` (2026-07-27).

- [ENG] ToggleAll few-pixel shift: expand/collapse can leave a small reversible content offset in real
  Chromium (Chrome/Edge/Opera GX), from native scroll anchoring fighting the manual correction. Fix
  applied: suppress `overflow-anchor` for the operation, restored next frame (DECISIONS 2026-06-20). NOT
  reproducible in headless Chromium (false negative), so the fix is UNVERIFIED visually; owner to confirm
  in a real browser. Diagnostic recipe if it still shifts: confirm `overflow-anchor: none` is landing
  on `document.scrollingElement`, and instrument the correction delta against where `scrollY`
  actually settles. If a sub-pixel residual remains, it is rounding territory, leave it.
- [DESIGN] Flag-gold targets the slug ids `#user-flag` / `#root-flag` as an interim (no `.flag-title`
  class exists; flag headings reuse `.task-title`). The TOC active-color ladder (DECISIONS 2026-06-29)
  also excludes flags by those same two slug ids so they stay gold instead of going cyan, so it shares the
  fragility. Breaks if those headings are renamed or another page reuses the slugs. Clean fix: add a
  `.flag-title` class to flag headings during authoring, used by both the gold rule and the cyan exclusion.
- [ENG] Command-highlighting residual risk: an OUTPUT line whose first word is exactly a listed command
  (e.g. `ls: cannot access`) can be mis-tagged. Rare; documented in `ec-priv-command.mjs` (EC 0.42
  exposes no token scopes, so strings/comments cannot be skipped by scope).
- [DESIGN/A11Y] OverTheWire `.pi-name` fails contrast at 3.41:1 (needs 4.5:1 for
  normal text, 3:1 for large). Platform landing name color. Real accessibility
  defect, not cosmetic. Decide a compliant color that holds the platform identity.
- [DESIGN] Right rail mobile layout at 375px: unresolved how the TOC rail behaves
  at the narrow breakpoint. Needs a real-device or 375px-viewport decision, paired
  with the narrow-screen gutter call below.
- [DESIGN] Narrow-screen gutter is a taste call, currently undecided. Owner to set
  the gutter at small breakpoints once the 375px rail behavior is settled.
- [DESIGN] `--ap-fade-w` as an owner-facing knob: decide whether the accent-fade
  width is exposed as a tunable CSS variable or fixed. A convention call, not a bug.
- [DESIGN] **About practice cards under text scaling.** At root 200% on a 320 screen the platform
  name in `.practice strong` is clipped by its card: 89px past the viewport for OverTheWire, 85 for
  HackTheBox; 49 and 45 at 360; 34 and 30 at 375; 19 and 15 at 390; whole from 414 (measured
  2026-09-18 after the gutter returned; before it, 41, 37, 1px at 360 and whole from 375). The card is
  260px in a 224px column (`minmax(260px, 1fr)`), the icon and the text sit side by side and the text
  column is about 96px there, so `min-width: 0` cannot fix it; the fix is structural, the icon above
  the text below a container width in rem, the recon rail's mechanism.
- [DESIGN] **Card description under text scaling.** The two-line clamp shows 13 to 26 characters at
  root 200% on a phone against 50 to 92 at normal size. Decide whether the clamp lifts under scaling
  (a container query in rem, the rail's mechanism). A phone-specific clamp at normal size was measured
  and rejected: a 360 phone card already shows as much as a desktop card (CORE_SPEC §6).
- [DESIGN] **The contact button leaves a 320 viewport by 13px at root 200%** on both marketing pages,
  after the `@` break: its 1.7rem side padding doubles while `idanlab.dev` cannot break. A padding
  that does not scale with the text, or a shorter label, is a design call.
- [DESIGN] **Text scaling on the marketing pages, one session, root 200% only.** Three instances the
  gutter (2026-09-18) made worse or created, all measured on isolated builds the same day and none with
  a position taken: (1) the About practice names above; (2) the home hero's primary button leaves a 320
  viewport by 19.28px (x 48 to 339.28; it started at x=0 before the gutter and fit); (3) the About
  headed panel's `2.5rem 3rem` padding doubles to 192px of a 224px column, so its two paragraphs run to
  342.53 against 320 (they ended at 294.53 before). The contact button item above is the same family.
  Same session, the open question: the About skill grid's `minmax(280px, 1fr)` puts a 280px card in a
  224px column at 320 and 200%, 8px past the viewport (8px into the gutter at normal size).
  `minmax(min(280px, 100%), 1fr)` was measured and deliberately not taken: it removes the 8px and
  changes nothing above 320 at normal size, but the narrower card makes the word problem worse,
  "Cryptography" overflowing its card by 183px instead of 127 at 320 and 200%. The skill cards want a
  text answer, not a track answer.
