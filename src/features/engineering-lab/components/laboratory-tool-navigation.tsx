"use client";

export interface LaboratoryToolNavigationItem {
  /** The tool's DOM id, which is also its deep-link anchor. */
  readonly id: string;
  /** Short category line, reused from the tool's own eyebrow. */
  readonly kind: string;
  readonly title: string;
}

interface LaboratoryToolNavigationProps {
  activeToolId: string;
  onSelect: (toolId: string) => void;
  tools: readonly LaboratoryToolNavigationItem[];
}

/**
 * The tool index inside one workflow.
 *
 * The laboratory already chose one workflow at a time, but every module inside
 * that workflow rendered stacked — six to seven full calculators in a single
 * column, which is what made a workflow 10,745px tall on a desktop and 18,873px
 * for atmospheric entry. This picks one module, so the question "which model am
 * I using?" is answered by the page rather than by scrolling.
 *
 * Buttons rather than anchors: the selection is application state that the shell
 * mirrors into the URL hash, and a list of anchors would give two competing
 * mechanisms for the same thing. Keyboard behaviour is therefore the ordinary
 * tab-and-activate of a button list, not a roving tabindex — with this many
 * items, being able to Tab straight to a known module is more useful than
 * arrow-key traversal, and it is what the workflow index above already does.
 */
export function LaboratoryToolNavigation({
  activeToolId,
  onSelect,
  tools,
}: LaboratoryToolNavigationProps) {
  return (
    <nav aria-label="Modules in this workflow">
      <ul className="orbix-lab-tools">
        {tools.map((tool, index) => {
          const isActive = tool.id === activeToolId;

          return (
            <li key={tool.id}>
              <button
                aria-current={isActive ? "true" : undefined}
                className="orbix-lab-tool"
                data-active={isActive ? "true" : undefined}
                onClick={() => onSelect(tool.id)}
                type="button"
              >
                {/* The number is the module's position in this workflow, which
                 * is the order the workflow is meant to be worked through. It
                 * is real ordering information, not decoration. */}
                <span aria-hidden="true" className="orbix-lab-tool__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="orbix-lab-tool__body">
                  <span className="orbix-lab-tool__title">{tool.title}</span>
                  <span className="orbix-lab-tool__kind">{tool.kind}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
