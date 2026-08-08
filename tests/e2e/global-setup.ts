import type { FullConfig } from "@playwright/test";

/**
 * Pre-warms Next.js's on-demand image optimizer before any test runs.
 *
 * Why this exists
 * ---------------
 * ORBIX ships its canonical vehicle imagery as large source PNGs
 * (`b-2-spirit.png` is ~9.2 MB, `space-launch-system.png` ~4.1 MB). A local
 * `next start` server optimizes each `next/image` variant on first request,
 * and for these files that first request costs hundreds of milliseconds to
 * a couple of seconds.
 *
 * That latency, not the image itself, is what broke the image-heavy visual
 * tests. The failure mode was measured rather than guessed:
 *
 *   1. The browser begins fetching a small srcset candidate (e.g. `w=640`).
 *   2. That request is slow because the variant is cold.
 *   3. While it is in flight, layout settles and the browser re-evaluates
 *      `srcset`, selecting a different candidate.
 *   4. The original request is abandoned and the element is left with
 *      `complete === false` indefinitely.
 *
 * Against production (Vercel, where variants are already cached and served
 * in ~60 ms) this never happens: every image on `/aircraft` loads and
 * settles normally. It is purely an artifact of a cold local optimizer, so
 * there is nothing wrong with the application to fix.
 *
 * Warming each variant over plain HTTP first makes the local server answer
 * in single-digit milliseconds, exactly like production, so the race above
 * never opens. This is far faster and more reliable than driving a browser
 * to warm the cache, and it keeps the fix on the test side: the application
 * is untouched.
 *
 * Warming is best-effort. A variant that fails to warm is not a setup
 * failure — the tests themselves remain the real assertions.
 */

/** Source images that are expensive enough to be worth warming. */
const IMAGE_PATHS = [
  { path: "/images/aircraft/b-2-spirit.png", quality: 90 },
  { path: "/images/aircraft/f-15-eagle.png", quality: 90 },
  { path: "/images/aircraft/f-22-raptor.png", quality: 90 },
  { path: "/images/aircraft/f-35-lightning-ii.jpg", quality: 90 },
  { path: "/images/aircraft/sr-71-blackbird.png", quality: 90 },
  { path: "/images/rockets/falcon-9.png", quality: 75 },
  { path: "/images/rockets/falcon-heavy.png", quality: 75 },
  { path: "/images/rockets/saturn-v.png", quality: 75 },
  { path: "/images/rockets/space-launch-system.png", quality: 75 },
  { path: "/images/rockets/starship.png", quality: 75 },
] as const;

/**
 * The srcset candidate widths Chromium was observed selecting for these
 * layouts. Deliberately not the full `deviceSizes` list — warming widths the
 * app never requests would just make setup slower for no benefit.
 */
const WIDTHS = [640, 750, 828, 1080, 1200, 1920, 2048, 3840] as const;

const REQUEST_TIMEOUT_MS = 60_000;

async function warmVariant(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    // Drain the body so the optimizer finishes writing its cache entry.
    await response.arrayBuffer();
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use.baseURL ?? "http://127.0.0.1:3210";

  const startedAt = Date.now();
  let warmed = 0;
  let failed = 0;

  // Serial on purpose: concurrent cold resizes of multi-megabyte PNGs are
  // exactly the contention this is meant to eliminate.
  for (const image of IMAGE_PATHS) {
    for (const width of WIDTHS) {
      const url =
        `${baseURL}/_next/image` +
        `?url=${encodeURIComponent(image.path)}&w=${width}&q=${image.quality}`;

      if (await warmVariant(url)) {
        warmed += 1;
      } else {
        failed += 1;
      }
    }
  }

  const elapsedSeconds = Math.round((Date.now() - startedAt) / 1000);
  console.log(
    `[global-setup] image optimizer warm-up: ${warmed} variant(s) ready` +
      `${failed > 0 ? `, ${failed} failed` : ""} in ${elapsedSeconds}s`,
  );
}
