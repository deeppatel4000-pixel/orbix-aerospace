import { ShowcaseSection } from "@/features/showcase/components/showcase-section";

const ON_PUSH = "Every push to main and every pull request";

/**
 * What the two GitHub Actions workflows in `.github/workflows` run. Stated as
 * commands, with no test counts: counts would go stale the day they shipped.
 */
const checks = [
  {
    check: "Formatting",
    command: "npm run format:check",
    tool: "Prettier",
    when: ON_PUSH,
  },
  {
    check: "Lint, zero warnings allowed",
    command: "npm run lint",
    tool: "ESLint",
    when: ON_PUSH,
  },
  {
    check: "Design rules: no raw color values outside the tokens",
    command: "npm run check:design",
    tool: "Node script",
    when: ON_PUSH,
  },
  {
    check: "Type check",
    command: "npm run typecheck",
    tool: "TypeScript",
    when: ON_PUSH,
  },
  {
    check: "Unit tests for calculators, analyses and components",
    command: "npm run test",
    tool: "Vitest",
    when: ON_PUSH,
  },
  {
    check: "Production build",
    command: "npm run build",
    tool: "Next.js",
    when: ON_PUSH,
  },
  {
    check:
      "Browser smoke and accessibility tests at desktop, tablet and mobile sizes",
    command: "npx playwright test tests/e2e/smoke tests/e2e/a11y",
    tool: "Playwright, Chromium",
    when: ON_PUSH,
  },
  {
    check: "Visual regression screenshots",
    command: "npm run test:visual",
    tool: "Playwright, Chromium",
    when: "Manual workflow run only",
  },
] as const;

export function QualityChecks() {
  return (
    <ShowcaseSection
      id="quality-checks"
      lead="Two GitHub Actions workflows run these checks. The first six run together as npm run validate."
      title="Quality checks"
    >
      <div
        aria-label="Quality checks run in continuous integration"
        className="orbix-table-wrap"
        role="region"
        tabIndex={0}
      >
        <table className="orbix-table w-full">
          <caption className="sr-only">
            Checks run in continuous integration, with the command and when each
            one runs
          </caption>
          <thead>
            <tr>
              <th scope="col">Check</th>
              <th scope="col">Tool</th>
              <th scope="col">Command</th>
              <th scope="col">Runs on</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((row) => (
              <tr key={row.command}>
                <th className="min-w-[12rem]" scope="row">
                  {row.check}
                </th>
                <td className="whitespace-nowrap text-text-secondary">
                  {row.tool}
                </td>
                <td>
                  <code className="orbix-data orbix-data--sm whitespace-nowrap text-text-primary">
                    {row.command}
                  </code>
                </td>
                <td className="min-w-[10rem] text-text-secondary">
                  {row.when}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ShowcaseSection>
  );
}
