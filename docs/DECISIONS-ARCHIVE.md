# Idan.Lab — Decisions Archive

> Superseded decisions, moved out of `DECISIONS.md` so the live log holds only what still describes the
> project. Nothing is trimmed: each entry keeps its full reasoning, because why a thing was decided stays
> useful after the decision stops being true. This file is NOT loaded in default session context; consult
> it by search when you need the provenance of a decision the live log no longer carries.
> Entries appear in the order they held in the live file, not re-sorted. Each carries a `Superseded by:`
> line naming its replacement by date and title; the replacement carries the matching `Supersedes:` line,
> so a chain is walkable in both directions without touching git. Two entries are git-process records
> rather than decisions and say so instead.

---

### 2026-07-26 · `dev` holds the finished CSS refactor and does NOT merge to `main` until the Geist retune lands
- **Superseded by:** 2026-07-27 · The release hold is lifted and `dev` ships to production
- **Decision:** the refactor workstream is complete and pushed to `dev`, and it stays there. `main` is not
  updated, no PR is opened, and Cloudflare production keeps serving the pre-Geist site until the design
  retune below has been done and reviewed. Owner's call, and the reason is not caution about the refactor:
  it is that `dev` currently carries a HALF-FINISHED DESIGN CHANGE, which is a different thing.
- **What is actually on `dev` (17 commits ahead of `main`, whose tip is `51edb9c`, PR #18):** two separable
  bodies of work that happen to share the branch.
  1. **A design change:** the Geist prose face and the prose/chrome type split (`991bfc4`), plus
     PasswordReveal's block mode (`b9742fb`). Geist is now the writeup body face, but the rest of the
     design has NOT been refitted around it. The prose dials are still parked as tokens pending a real
     screen (see the 2026-07-25 entry), and the spacing, measure and component scales were tuned for the
     old mono body.
  2. **Engineering and infrastructure only:** the cascade-layer refactor, the module split, the dead-rule
     purge, and the governance pass, running from the prose-guard fix of 2026-07-25 through the
     docs-alignment commit of 2026-07-26 and documented in full by the entry "2026-07-26 · The theme pass
     moves to declared cascade layers and splits into per-layer modules" in DECISIONS.md. This half is
     behavior-preserving by construction and was gated at zero changed cells at every step, with one
     intended exception inside the span: the OverTheWire amber split changed 17 cells by design (see
     "2026-07-26 · OverTheWire amber splits into an identity accent and an AA text ink" in DECISIONS.md).
- **Why this blocks the merge even though the refactor is safe:** merging would deploy the Geist face to
  production in its untuned state. A half-refitted body face is exactly the kind of change that reads as
  "the site looks off" to a visitor while every individual rule is correct, and this site's whole pitch is
  that the design is high-effort. The engineering half is invisible to a visitor by design, so it gains
  nothing from shipping early and loses nothing by waiting.
- **The merge gate, stated so it is not re-litigated:** `dev` merges to `main` when the Geist retune is
  done and the owner has seen it on a real screen in both themes. The retune and the refactor ship as ONE
  release. Splitting them (cherry-picking the refactor to `main` first) was considered and rejected: the
  refactor's own verification baseline was captured against a Geist-carrying tree, so a `main` that has the
  refactor without Geist is a configuration nothing was ever measured against.
- **What the retune inherits, and why the sequencing was right:** a layered, purged, tokenized theme pass.
  Every dial the retune needs is a custom property in one block in `tokens.css`, precedence is decided by
  layer order rather than by selector weight, and the dead rules that would have made a retune ambiguous
  are gone. Doing the plumbing first means the retune is a values exercise, not an archaeology exercise.
- **Status:** Adopted (owner instruction). No PR, no `main` activity. Tracked as the top ROADMAP item.

### 2026-07-17 · busquedav2 testbed dropped before push; badge commits rebased + pushed; merged to main (PR #16)
- **Archived as a git-process record, not a decision.** Its load-bearing content was rewritten into durable prose during the hash-extraction pass, so what remains is a record of a rebase.
- **Decision:** the `busquedav2.mdx` design testbed is NOT pushed and is kept out of the `dev` -> `main` PR.
  It is a local-only testing page (a re-created successor to the June testbed that the 2026-06-27 FlagCapture
  entry recorded as deleted), used to verify the WriteupMeta badge work. Keeping it off `origin` and out of
  the PR keeps it off every path to production.
- **How (owner-approved edit of UNPUSHED commits only):** it sat in exactly one isolated, unpushed commit,
  third in the 7-commit unpushed stack, a 467-line pure add touching `busquedav2.mdx` and nothing else. That
  commit (`feat(busquedav2): modernize the testbed (WriteupMeta badges + principle frontmatter)`, 2026-07-17)
  had brought the testbed onto the then-current writeup conventions: the hand-authored `.machine-meta` badge
  row replaced by a single `WriteupMeta` component (platform HackTheBox, os Linux, environment Standalone,
  difficulty Easy), and the closing Principle migrated to `principle:` frontmatter so the Footer override
  auto-appends the coda and suppresses pagination beneath it. It was dropped by replaying the stack onto the
  commit that preceded it (interactive rebase is unavailable in the harness, and a non-interactive replay is
  more precise anyway). The commit is gone from history by design and is not meant to be recovered.
- **What the replay did to the rest of the stack:** the two commits BEFORE the dropped one were left
  untouched by the rebase, `docs(roadmap): record topic-tags deferral and os frontmatter enum` and
  `content(busqueda): editorial revisions and decisive-line code highlights`, both 2026-07-17. The four AFTER
  it were replayed onto the new base, each becoming a new commit object carrying byte-identical content under
  an unchanged subject line: `fix(badges): normalize the HackTheBox and Linux glyphs onto a 14px icon grid`,
  `fix(badges): solve the light-mode badge label palette to WCAG AA`, `fix(badges): separate the Linux OS
  chip from OverTheWire (re-hue H60 + deepen light)`, and `docs(badges): document the WriteupMeta badge
  system across the three canonical docs`, all 2026-07-17 and the first three each with their own entry
  below. Verified by diffing the pre-rebase tip against the rebased branch: the only difference was the
  467-line busquedav2 deletion, nothing else, which is what proves the replay preserved content exactly.
- **Then pushed, PR'd, and merged to production:** because only an UNPUSHED commit was removed, `origin/dev`
  stayed a clean ancestor, so `git push origin dev` fast-forwarded (no force). Opened PR #16 (`dev` -> `main`,
  22 commits / 15 files, +983 / -152), where `origin/main` was a clean ancestor of `dev`, then on the owner's
  go-ahead merged it to `main` as a history-preserving merge commit (the PR #9 convention, not a squash),
  triggering the Cloudflare Pages production deploy of idanlab.dev.
- **Docs reconciled (this pass):** the removed testbed's CURRENT-STATE references are corrected in CORE_SPEC
  §6 (component inventory) and ROADMAP (the WriteupMeta Now item): the badge system is built and documented
  but is not currently wired to any page. This entry SUPERSEDES the "(not pushed)" status and the old hashes
  in the three 2026-07-17 badge entries, which stay live in DECISIONS.md (see the replay account above). The historical busquedav2
  entries (2026-06-20, 2026-06-27) stand as accurate June history and are untouched.
- **Verified:** `npm run build` green at 45 pages (was 46; the one fewer page IS busquedav2, confirming
  nothing else was lost). Local `main` was also fast-forwarded to `origin/main` (`cb0a696`) to clear a stale
  local ref; no `main` history was changed.
- **Status:** Adopted + shipped to production. `dev` pushed to `origin` and merged to `main` via PR #16. Git
  plus this docs reconciliation only; no source or dependency changes.

### 2026-07-11 · PasswordReveal migration complete
- **Superseded by:** 2026-07-25 · PasswordReveal gets a BLOCK mode; the one-off `.spoiler-toggle` class is retired
- Status update superseding the 2026-07-05 in-progress note. PasswordReveal is now the reveal mechanism
  on 32 of 34 Bandit level pages. The first level's spoiler-toggle has been removed and the migration
  commit landed. Two pages are deliberately excluded: one uses a private-key reveal that remains a
  spoiler-toggle, and one has no password to reveal. The rollout is done; no further per-page migration
  is pending.

### 2026-07-11 · Commit split into 4 atomic commits, then dev merged to production (PR #9)
- **Archived as a git-process record, not a decision.** It also claims the pre-split tip stays recoverable from the reflog, which stops being true once the planned history rewrite runs.
- **Commit split:** the single working commit `1fdac10` (WriteupMeta badges + badge icons + reoptimized
  `picoctf.svg` + docs sync + mobile TOC + three-column layout) was re-partitioned into four atomic,
  individually-building commits with the EXACT same final tree (verified: `git diff 1fdac10 HEAD` empty,
  identical tree hash `04b803fb`): `7fa5d82` feat(badges) WriteupMeta system (component, `icons.ts`, the
  interim `picoctf.svg`, `.writeup-meta` styles), `3045505` feat(toc) mobile TOC parity, `02e8bab` docs
  (badge icon sourcing + spec/roadmap sync), `723c2ab` style(layout) three-column rebalance + full-width
  intro pages. `custom.css` spanned three concerns (badge, mobile TOC, layout) and was split by hunk across
  commits 1, 2, and 4. The pre-split tip stays recoverable from the reflog if ever needed.
- **Merged to production:** `dev` (9 commits ahead of `main`, which was a clean ancestor) merged into `main`
  via PR #9 as a history-preserving merge commit, NOT a squash. What proves it is that the merge has TWO
  parents: the previous `main` tip (the PR #8 merge of 2026-07-06) and the last commit on `dev`
  (`style(layout): three-column rebalance and full-width intro pages`, 2026-07-11). So all 9 commits stay
  individually on `main`. The push to `main` triggers the Cloudflare Pages production deploy of idanlab.dev.
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

### 2026-07-10 · WriteupMeta badge system (`src/components/badges/`) added
- **Superseded by:** 2026-07-10 · WriteupMeta revised: intentional per-axis color, restrained glow, growing pips
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
- **Superseded by:** 2026-07-10 · WriteupMeta revised: intentional per-axis color, restrained glow, growing pips
- **Decision:** New additive component tree `src/components/badges/` (`icons.ts` + `WriteupMeta.astro`), styled
  by a `.writeup-meta` block in `custom.css` placed after the flag/loot rules. Platform, OS and Environment
  render as clickable pill chips (leading), Difficulty trails as a rectangular word-plus-pips chip that is
  hue-free and never a link. Shape carries the job: pills navigate, the rectangle grades. Four string-literal
  unions (`Platform`, `OS`, `Environment`, `Difficulty`) drive `Record<>` registries, so the icon set, the
  route slug and the pip count all stay exhaustive. No new dependencies; Starlight is not forked.
- **Why (icons):** `icons.ts` is the single home for the marks. Each is an inline 24x24 SVG string using
  `fill="currentColor"`, so a
- **[TRUNCATED: this entry is cut off mid-sentence and the rest of it is missing. Not reconstructed.
  Superseded by 2026-07-10 · WriteupMeta revised: intentional per-axis color, restrained glow, growing pips.]**

### 2026-06-20 · busquedav2: drop EC line highlights; remove marked-line CSS
- **Superseded by:** 2026-07-04 · Decisive-line focus highlighting for Expressive Code {n} markers
- **Decision:** Remove all `{n}` line-highlight markers from `busquedav2.mdx` and delete the custom EC
  marked-line restyle from `custom.css`. The marked line had been restyled (amber, then a neutral
  grayscale) to stop EC's default blue reading as a callout; the owner then chose to drop highlights
  entirely, so the restyle is gone (nothing is marked).
- **Why:** the highlights were not earning their weight; removing them is cleaner than styling them.
- **Status:** Adopted (busquedav2). The `notion_cleaner.py` line-highlight convention is now unused; if
  reintroduced, EC's default marked-line color would need restyling again.

### 2026-05-31 · Notion → notion_cleaner.py → MDX pipeline
- **Superseded by:** 2026-07-11 · Content pipeline is manual editorial polish, not a script (retires notion_cleaner.py)
- **Decision:** Author in Notion, normalize with a Python script into clean MDX.
- **Why:** Comfortable authoring in Notion; the script enforces all conventions (badges,
  toggles, code-frame normalization, image paths) so 50+ writeups stay consistent.
- **Status:** Adopted.
