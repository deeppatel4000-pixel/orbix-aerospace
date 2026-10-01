import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// Vitest runs without the Tailwind PostCSS pipeline, so the module's class
// names are stubbed; this test checks markup, not styling.
vi.mock("./calculator-card.module.css", () => ({
  default: { card: "card", header: "header", workspace: "workspace" },
}));

import { CalculatorCard } from "./calculator-card";
import { LabEquation } from "./shared/lab-equation";

function text(html: string) {
  return html.replace(/<[^>]+>/g, "");
}

describe("CalculatorCard", () => {
  it("numbers the tool's equations after its tool ID", () => {
    const html = renderToStaticMarkup(
      <CalculatorCard
        description="Test tool."
        id="test-tool"
        number="20"
        title="Test tool"
      >
        <LabEquation equation="F = m·a" />
        <LabEquation equation="W = m·g" index={2} />
      </CalculatorCard>,
    );
    expect(text(html)).toContain("(20.1)");
    expect(text(html)).toContain("(20.2)");
  });

  it("prints no equation number without a tool ID", () => {
    const html = renderToStaticMarkup(
      <CalculatorCard description="Test tool." id="test-tool" title="Test tool">
        <LabEquation equation="F = m·a" />
      </CalculatorCard>,
    );
    expect(html).not.toContain("orbix-equation__number");
  });
});
