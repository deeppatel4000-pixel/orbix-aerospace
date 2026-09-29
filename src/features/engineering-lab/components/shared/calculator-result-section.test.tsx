import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CalculatorResultSection } from "./calculator-result-section";

describe("CalculatorResultSection", () => {
  it("shows its figures without a stale line by default", () => {
    const html = renderToStaticMarkup(
      <CalculatorResultSection id="r" title="Ideal burn">
        <p>figure</p>
      </CalculatorResultSection>,
    );
    expect(html).not.toContain("data-stale");
    expect(html).not.toContain("Inputs changed");
  });

  it("keeps the figures and says the inputs changed when stale", () => {
    const html = renderToStaticMarkup(
      <CalculatorResultSection id="r" stale title="Ideal burn">
        <p>figure</p>
      </CalculatorResultSection>,
    );
    expect(html).toContain('data-stale=""');
    expect(html).toContain("Inputs changed. Calculate to update.");
    expect(html).toContain("<p>figure</p>");
    // The line sits inside the live region, so it is announced once.
    expect(html).toMatch(/role="status"[^>]*>\s*<p class="lab-result-stale">/);
  });

  it("names the tool's own submit verb in the stale line", () => {
    const html = renderToStaticMarkup(
      <CalculatorResultSection
        id="r"
        stale
        staleAction="Analyze"
        title="Flight condition"
      >
        <p>figure</p>
      </CalculatorResultSection>,
    );
    expect(html).toContain("Inputs changed. Analyze to update.");
    expect(html).not.toContain("Calculate to update");
  });
});
