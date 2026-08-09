# Browser testing (Playwright)

## 1. Why this suite exists

ORBIX's 863 Vitest tests are fast and thorough for logic, but they run in Node and render
React with `renderToStaticMarkup` — HTML strings, never a browser. That means they cannot:

- load a real image and confirm it finishes loading,
- run client-side JavaScript (state, effects, event handlers),
- press a key and observe focus move,
- measure layout and detect horizontal overflow at a given viewport width,
- observe a browser `console.error`,
- take or compare a rendered screenshot.

The Playwright suite under `tests/e2e/` exists to cover exactly that gap: real Chromium,
a real production build, real interaction.

## 2. What it covers

- **Suites**: `tests/e2e/smoke/` (critical navigation and rendering flows) and
  `tests/e2e/a11y/` (keyboard/focus and accessibility-tree checks). A `visual/` suite
  (screenshot regression) is also present under `tests/e2e/visual/` — see §5.
- **Viewports/projects**: `desktop` (1440x900), `tablet` (768x1024), `mobile` (390x844),
  each running the full non-visual suite in Chromium.
- **Guarantees**: pages render without console errors, critical routes load and show their
  expected heading/content, images referenced on vehicle profile pages actually finish
  loading, navigation and CTAs resolve to the correct destination, keyboard navigation
  reaches interactive controls (tab order, focus visibility), focus is restored to the mobile
  menu toggle when the menu is dismissed with Escape, and layout does not overflow horizontally
  at the mobile viewport.

## 3. How to run

```bash
# unit tests, then the full browser suite
npm run test:all

# just the browser suite (smoke + a11y across desktop/tablet/mobile; add visual project too if configured)
npm run test:e2e

# only the visual regression project
npm run test:visual

# headed / interactive debugging
npm run test:e2e:headed   # see the browser window
npm run test:e2e:debug    # step through with the Playwright Inspector
npm run test:e2e:ui       # interactive UI mode (watch, time-travel, pick tests)
```

`npm run test:e2e` depends on `http://127.0.0.1:3210` being up. If nothing is listening
there, Playwright's `webServer` runs `npm run build && npm run start` for you automatically
— so the _first_ run includes a production build and typically takes an extra ~30s. For
faster iteration, start the server yourself once:

```bash
npm run build && npm run start
```

and leave it running in another terminal. Because `reuseExistingServer` is enabled outside
of CI, subsequent `npm run test:e2e` runs reuse that server instead of rebuilding, so each
test run only pays the actual test time.

## 4. How to debug failures

- **Trace viewer**: traces are captured `on-first-retry`. After a retried failure, open the
  trace with `npx playwright show-trace <path-to-trace.zip>` (path is printed in the test
  output and included in the HTML report) to step through actions, DOM snapshots, and
  network calls at the moment of failure.
- **HTML report**: every run writes `playwright-report/`. View the most recent one with
  `npm run test:e2e:report`.
- **`--headed`**: rerun a failing spec with a visible browser window
  (`npm run test:e2e:headed -- <spec file>`).
- **`--debug`**: rerun with the Playwright Inspector to step line-by-line
  (`npm run test:e2e:debug -- <spec file>`).
- **`--ui`**: `npm run test:e2e:ui` opens interactive UI mode, useful for re-running a single
  test repeatedly while iterating.

## 5. How visual baselines work

Baseline screenshots live under `tests/e2e/visual/__screenshots__/{platform}/{projectName}/`.
The `{platform}` segment (e.g. `win32`, `linux`) exists because font rasterization and
anti-aliasing differ between operating systems — a screenshot taken on Windows will not
pixel-match the same page rendered on Linux, even with identical code. Keeping platform in
the path means baselines for different OSes coexist without clobbering each other.

These PNGs are **intentionally committed** to the repository (see the note in `.gitignore`)
— they are the source of truth a visual test run diffs against, not build output to be
regenerated from scratch every time.

### Size tradeoff — measured, and deliberately accepted

The 17 baselines total **33.5 MB** (0.5–3.6 MB each). This was investigated properly rather
than guessed, and the decision is to **keep them as they are**. The measurements:

- **Height, not photography, drives size.** Bytes/pixel is a fairly uniform 0.14–0.48 across
  all files. `mission-control-desktop` is the largest (3.6 MB) purely because it is 12,350 px
  tall; `learn-desktop` has the highest bytes/pixel but is only 599 KB because it is short.
- **Full-page capture is load-bearing.** Cropping every baseline to its top viewport slice and
  re-encoding was measured, not estimated: it would cut the folder to 3.45 MB (a real 90%
  saving) — but **77–95% of each file is below-fold content**. On `/engineering-lab` that is 31
  analyzer/calculator components; on Mission Control it is the dashboard and telemetry panels;
  elsewhere it is spec tables, comparison tables, and related-vehicle grids. A regression in
  analyzer #25 would become structurally invisible. Rejected.
- **Lossless recompression saves only 6.1%.** Re-encoding at maximum effort and verifying
  pixel-identity (0 mismatches across all 17) yields 33.5 MB → 31.5 MB. Not adopted: 2 MB does
  not justify a manual step that silently decays the next time anyone regenerates a baseline.
- **Git LFS rejected.** It relocates bytes rather than reducing them, adds a `git-lfs install`
  prerequisite for anyone cloning a public portfolio repo, and GitHub's free 1 GB/month LFS
  bandwidth would be consumed by ordinary Vercel build clones — converting a cosmetic concern
  into hard clone failures.
- **Context.** `public/` already holds ~35 MB of source imagery, and the whole packed repo is
  ~35 MiB. A repo in this range clones in seconds, which is negligible next to `npm install`.

The one genuinely weak entry is `aircraft-tablet` (~2 MB): the aircraft components contain
**zero** `md:` breakpoint rules, so 768 px renders the same layout branch as mobile. It is kept
anyway, because width-driven reflow (truncation, overflow) can still break without an explicit
breakpoint rule, and coverage should not be cut merely to save 2 MB.

**The real future cost is history, not the working tree:** PNGs do not delta well, so every
intentional baseline regeneration adds a near-full copy. That is a maintenance-discipline
matter, not a reason to weaken coverage today.

CI currently only has Linux runners, and no Linux baselines have been generated yet. Until
they are, the `visual` job in `.github/workflows/browser-tests.yml` is manual
(`workflow_dispatch`) only — see the comment in that file for how to generate and adopt
Linux baselines.

## 6. How to update baselines intentionally

Baselines are **never** updated by a normal test run — `npm run test:visual` only compares
and fails on mismatch. To update them:

```bash
npm run test:visual:update
```

Then **review every changed PNG individually** (e.g. `git diff` won't show you the image —
open each changed file, or use the HTML report's diff view) before committing. Only update
baselines after a deliberate, approved visual/design change — never as a way to silence a
failing test you don't understand.

## 6a. A local-only image quirk the suite works around

Against a local `next start`, Chromium sometimes settles a vehicle image's `currentSrc` on the
largest srcset candidate (`w=3840`) after layout shifts — having already abandoned the request
for the smaller candidate it picked first — and then never issues a request for the new
selection. The element stays at `complete === false` indefinitely, and because the page's
`load` event never fires, a default `page.goto()` would also hang.

This was measured, not assumed:

- the same variant serves in ~3 ms once cached, and the stall persists when it is already warm,
  so it is not slow image optimization;
- the same pages against **production load every image normally** (`started=9 finished=9`),
  because Vercel serves already-cached variants.

So there is nothing wrong with the application. Two test-side accommodations handle it:

1. Navigation uses `waitUntil: "domcontentloaded"` instead of waiting for `load`.
2. `expectAllImagesLoaded` (in `tests/e2e/fixtures/orbix.ts`) allows a short grace period, and
   only for images that are genuinely stuck, pins each one to the exact variant the browser had
   already selected so the fetch actually happens. Rendered pixels are unchanged.

If ORBIX's oversized source PNGs are ever optimized (handoff Known Issue #6), this quirk should
disappear and the workaround can be revisited.

## 7. Critical routes

The smoke suite treats these as must-not-break: `/` (home), `/aircraft`, `/rockets`,
`/compare`, `/engineering-lab`, `/showcase`, `/learn`, an aircraft profile deep link, a
rocket profile deep link, and Mission Control's workspace tablist/switching.

## 8. What these tests intentionally do NOT guarantee

- **Not a full accessibility certification.** The `a11y` suite checks keyboard reachability
  and focus behavior, not a complete WCAG audit — there is no axe-core (or similar) scan
  wired in.
- **Not cross-browser.** Only Chromium is installed and run, in CI and by default locally.
  Firefox/WebKit-specific bugs will not be caught.
- **Not a performance budget.** No timing, bundle-size, or Core Web Vitals assertions.
- **Not a security review.** No dependency, header, or injection testing.
- **Not pixel-perfect across platforms.** Visual baselines are platform-specific by design
  (§5); this suite never claims Windows and Linux renders match.
- **Not engineering/physics correctness.** Calculator and analysis correctness is the
  Vitest suite's job (`src/**/*.test.{ts,tsx}`, run via `npm test`/`npm run validate`); this
  suite only checks that the browser renders and behaves.
