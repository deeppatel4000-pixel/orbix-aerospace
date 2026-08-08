import { ArrowDownRight } from "lucide-react";

export interface LaboratoryWorkflowNavigationItem {
  code: string;
  description: string;
  href: `#${string}`;
  title: string;
}

interface LaboratoryWorkflowNavigationProps {
  activeWorkflowId: string;
  onSelect: (href: `#${string}`) => void;
  workflows: readonly LaboratoryWorkflowNavigationItem[];
}

export function LaboratoryWorkflowNavigation({
  activeWorkflowId,
  onSelect,
  workflows,
}: LaboratoryWorkflowNavigationProps) {
  const activeHref = `#${activeWorkflowId}`;

  return (
    <nav aria-label="Engineering Laboratory workflows">
      <label
        className="font-mono text-[0.62rem] tracking-[0.16em] text-accent uppercase lg:hidden"
        htmlFor="laboratory-workflow-select"
      >
        Current workflow
      </label>
      <select
        className="mt-2 min-h-11 w-full border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
        id="laboratory-workflow-select"
        onChange={(event) => onSelect(event.target.value as `#${string}`)}
        value={activeHref}
      >
        {workflows.map((workflow) => (
          <option key={workflow.href} value={workflow.href}>
            {workflow.code} - {workflow.title}
          </option>
        ))}
      </select>

      <div className="hidden lg:block">
        <p className="font-mono text-[0.62rem] tracking-[0.16em] text-accent uppercase">
          Workflow index
        </p>
        <ol className="mt-4 grid gap-2">
          {workflows.map((workflow) => {
            const workflowId = workflow.href.slice(1);
            const isActive = workflowId === activeWorkflowId;

            return (
              <li key={workflow.href}>
                <a
                  aria-controls={workflowId}
                  aria-current={isActive ? "location" : undefined}
                  className={
                    isActive
                      ? "group flex min-h-16 items-start justify-between gap-4 border border-accent/50 bg-accent/[0.09] px-4 py-3.5 shadow-[inset_3px_0_0_var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      : "group flex min-h-16 items-start justify-between gap-4 border border-border bg-background/55 px-4 py-3.5 transition-[border-color,background-color] duration-200 hover:border-accent/45 hover:bg-accent/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
                  }
                  href={workflow.href}
                  onClick={(event) => {
                    event.preventDefault();
                    onSelect(workflow.href);
                  }}
                >
                  <span>
                    <span className="font-mono text-[0.56rem] tracking-[0.13em] text-muted uppercase">
                      {workflow.code}
                    </span>
                    <span className="mt-1 block text-sm font-medium text-foreground">
                      {workflow.title}
                    </span>
                  </span>
                  <ArrowDownRight
                    aria-hidden="true"
                    className={
                      isActive
                        ? "mt-1 shrink-0 text-accent"
                        : "mt-1 shrink-0 text-muted transition-colors duration-200 group-hover:text-accent motion-reduce:transition-none"
                    }
                    size={15}
                  />
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
