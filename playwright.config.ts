import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results",
  // Pays the cost of Next's cold on-demand image optimization once, before
  // any test runs, instead of letting it surface as per-test timeouts on the
  // image-heavy routes. See tests/e2e/global-setup.ts for the full rationale.
  // Playwright runs webServer (a setup plugin) before globalSetup, so the
  // server is guaranteed to be up by the time this executes.
  globalSetup: "./tests/e2e/global-setup.ts",
  snapshotPathTemplate:
    "{testDir}/visual/__screenshots__/{platform}/{projectName}/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  expect: {
    timeout: 10_000,
  },
  // Above Playwright's 30s default: a couple of image-heavy vehicle profile
  // pages assert every rendered image finishes loading, and Next.js's image
  // optimizer processing a limited number of images concurrently across all
  // 3 projects' full-page image sweeps (this repo's required
  // `fullyParallel: true`) against one shared dev server can occasionally
  // queue a cold variant for a while — see the matching comment next to
  // `expectAllImagesLoaded`'s own poll timeout in tests/e2e/fixtures/orbix.ts.
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:3210",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    // `reducedMotion` is not promoted to a top-level `use` option in this
    // installed @playwright/test version's types; it must go through
    // `contextOptions`, which is passed straight to `browser.newContext()`.
    contextOptions: {
      reducedMotion: "reduce",
    },
  },
  webServer: {
    command: "npm run build && npm run start",
    url: "http://127.0.0.1:3210",
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: {
      PORT: "3210",
    },
  },
  projects: [
    {
      name: "desktop",
      testIgnore: "**/visual/**",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "tablet",
      testIgnore: "**/visual/**",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "mobile",
      testIgnore: "**/visual/**",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: "visual",
      testMatch: "**/visual/**",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
