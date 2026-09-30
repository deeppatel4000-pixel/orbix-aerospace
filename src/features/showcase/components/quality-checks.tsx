import { Fragment } from "react";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { formatCode } from "@/components/ui/readout";
import { cn } from "@/lib/cn";
import { ShowcaseSection } from "@/features/showcase/components/showcase-section";

interface QualityCheck {
  readonly check: string;
  readonly command: string;
  readonly tool: string;
}

/**
 * What the two GitHub Actions workflows in `.github/workflows` run, grouped
 * by workflow. Stated as commands, with no test counts: counts would go
 * stale the day they shipped.
 */
const validateChecks: readonly QualityCheck[] = [
  {
    check: "Formatting",
    command: "npm run format:check",
    tool: "Prettier",
  },
  {
    check: "Lint, zero warnings allowed",
    command: "npm run lint",
    tool: "ESLint",
  },
  {
    check:
      "Design rules: no file may add raw color values beyond its recorded baseline",
    command: "npm run check:design",
    tool: "Node script",
  },
  {
    check: "Type check",
    command: "npm run typecheck",
    tool: "TypeScript",
  },
  {
    check: "Unit tests for calculators, analyses and components",
    command: "npm run test",
    tool: "Vitest",
  },
  {
    check: "Production build",
    command: "npm run build",
    tool: "Next.js",
  },
];

const browserChecks: readonly QualityCheck[] = [
  {
    check:
      "Smoke and accessibility tests at desktop, tablet and mobile sizes, on every push to main and every pull request",
    command:
      "npx playwright test tests/e2e/smoke tests/e2e/a11y --project=desktop --project=tablet --project=mobile",
    tool: "Playwright, Chromium",
  },
  {
    check:
      "Visual regression screenshots, only when the workflow is run by hand",
    command: "npm run test:visual",
    tool: "Playwright, Chromium",
  },
];

/**
 * One command argument, kept on one line except at safe points: after a `/`
 * in a path such as `tests/e2e/smoke`, and before the `=` of a flag such as
 * `--project=desktop`.
 */
function CommandArgument({ part }: { part: string }) {
  const flag = /^(--[\w-]+)(=.+)$/.exec(part);

  return (
    <span className="whitespace-nowrap">
      {flag ? (
        <>
          {flag[1]}
          <wbr />
          {flag[2]}
        </>
      ) : (
        formatCode(part, { breakAfterSlash: part.includes("/") })
      )}
    </span>
  );
}

/** A command in the data face, breaking only at safe points. */
function Command({
  className,
  command,
}: {
  className?: string;
  command: string;
}) {
  return (
    <code
      className={cn(
        "orbix-data orbix-data--sm block bg-transparent! p-0! text-[length:var(--text-caps)]! leading-[1.4rem] font-normal text-text-secondary",
        className,
      )}
    >
      {command.split(" ").map((part, index) => (
        <Fragment key={index}>
          {index > 0 ? " " : null}
          <CommandArgument part={part} />
        </Fragment>
      ))}
    </code>
  );
}

/**
 * Check, then command, then tool. Below 48rem the Tool column is hidden
 * and each tool is set under its check, with the Check column 8rem wide.
 * Below 40rem the Command column is hidden too and each command follows
 * its tool in the one remaining column, so a check reads as one short
 * block instead of a narrow column several lines deep. Long arguments
 * break after a path `/` or before a flag's `=`, so both tables fit a
 * 320px screen without scrolling.
 */
const columns: readonly DataTableColumn<QualityCheck>[] = [
  {
    cell: (row) => (
      <span className="block sm:w-[8rem] md:w-auto">
        {row.check}
        {/* Below 48rem the Tool column is hidden and the tool rides here. */}
        <span className="mt-1 block font-normal text-text-muted md:hidden">
          {row.tool}
        </span>
        {/* Below 40rem the Command column is hidden and the command
            rides here too. */}
        <Command className="mt-2 sm:hidden" command={row.command} />
      </span>
    ),
    header: "Check",
    key: "check",
  },
  {
    cell: (row) => (
      <Command className="md:min-w-[14rem]" command={row.command} />
    ),
    header: "Command",
    key: "command",
  },
  {
    cell: (row) => <span className="whitespace-nowrap">{row.tool}</span>,
    header: "Tool",
    key: "tool",
  },
];

/**
 * From 48rem both tables share fixed column widths, so the two workflows
 * line up as one list; the Command column takes the largest share, so
 * long commands break as rarely as possible. Below that the third (Tool)
 * column is hidden, and below 40rem the second (Command) column too, and
 * the cells take 12px side padding instead of 16px.
 */
const alignedColumns = cn(
  "max-md:[&_tr>:nth-child(3)]:hidden max-sm:[&_tr>:nth-child(2)]:hidden max-sm:[&_:is(th,td)]:px-3",
  "md:[&_table]:table-fixed md:[&_thead_th:nth-child(1)]:w-[36%] md:[&_thead_th:nth-child(2)]:w-[46%]",
  // Check, command and tool share one baseline in each row.
  "[&_tbody_:is(th,td)]:align-baseline",
);

export function QualityChecks() {
  return (
    <ShowcaseSection
      id="quality-checks"
      lead={
        <>
          Two GitHub Actions workflows run these checks. The first six run
          together as{" "}
          <code className="orbix-data orbix-data--sm whitespace-nowrap">
            {formatCode("npm run validate", { breakAfterSlash: false })}
          </code>
          .
        </>
      }
      title="Quality checks"
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-10">
        <DataTable<QualityCheck>
          caption="Validate workflow: every push to main and every pull request"
          className={alignedColumns}
          columns={columns}
          getRowKey={(row) => row.command}
          rows={validateChecks}
        />
        <DataTable<QualityCheck>
          caption="Browser tests workflow"
          className={alignedColumns}
          columns={columns}
          getRowKey={(row) => row.command}
          note="Both workflows can also be started by hand from GitHub Actions."
          rows={browserChecks}
        />
      </div>
    </ShowcaseSection>
  );
}
