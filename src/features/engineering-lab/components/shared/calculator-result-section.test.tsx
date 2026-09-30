import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CalculatorResultSection } from "./calculator-result-section";

describe("CalculatorResultSection", () => {
  it("gives a live tool a plain head with no stale slot", () => {
    const html = renderToStaticMarkup(
      <CalculatorResultSection id="r" title="Shock conditions">
        <p>figure</p>
      </CalculatorResultSection>,
    );
    expect(html).not.toContain("data-stale");
    expect(html).not.toContain("lab-result-stale");
    expect(html).not.toContain("lab-result-head");
  });

  it("keeps an empty slot for a submit tool whose figures are current", () => {
    const html = renderToStaticMarkup(
      <CalculatorResultSection id="r" stale={false} title="Ideal burn">
        <p>figure</p>
      </CalculatorResultSection>,
    );
    expect(html).not.toContain("data-stale");
    // The words are always in the slot, hidden, so the slot keeps its
    // width and the head does not change when the line appears.
    expect(html).toContain("lab-result-head");
    expect(html).toContain(
      '<span aria-hidden="true" class="lab-result-stale__text">Inputs changed</span>',
    );
    expect(html).toContain(
      '<span aria-live="polite" class="sr-only" role="status"></span>',
    );
  });

  it("keeps the figures and says the inputs changed when stale", () => {
    const html = renderToStaticMarkup(
      <CalculatorResultSection id="r" stale title="Ideal burn">
        <p>figure</p>
      </CalculatorResultSection>,
    );
    expect(html).toContain('data-stale=""');
    expect(html).toContain(
      '<span aria-hidden="true" class="lab-result-stale__text" data-shown="">Inputs changed</span>',
    );
    expect(html).toContain("<p>figure</p>");
    // The line has its own small status slot in the head, outside the
    // figures region, so appearing does not re-announce every figure.
    expect(html).toContain(
      '<span aria-live="polite" class="sr-only" role="status">Inputs changed. Calculate to update.</span>',
    );
    expect(html).toMatch(/class="lab-result-body"[^>]*>\s*<p>figure<\/p>/);
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
