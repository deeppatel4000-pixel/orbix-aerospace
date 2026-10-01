import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EquationBlock } from "@/components/ui/equation-block";

const rocketEquation = "Δv = Isp g0 ln(m0 / mf)";

describe("EquationBlock", () => {
  it("names the relation under the equation, not above it", () => {
    const markup = renderToStaticMarkup(
      <EquationBlock equation={rocketEquation} label="Rocket equation" />,
    );
    expect(markup).toMatch(
      /^<figure class="orbix-equation"><div class="orbix-equation__line">/,
    );
    expect(markup).toContain(
      '<figcaption class="orbix-equation__where">Rocket equation.</figcaption>',
    );
    expect(
      renderToStaticMarkup(
        <EquationBlock
          equation="F = m a"
          label="Newton's second law"
          variables={[{ meaning: "Force", symbol: "F" }]}
        />,
      ),
    ).toContain(
      '<figcaption class="orbix-equation__where">Newton&#x27;s second law, where</figcaption><dl',
    );
    expect(markup).toContain(
      `<p class="orbix-equation__expr">${rocketEquation}</p>`,
    );
    expect(markup).not.toContain("<dl");
  });

  it("offers a spoken form and hides the symbols from assistive technology", () => {
    const markup = renderToStaticMarkup(
      <EquationBlock equation={rocketEquation} spokenAs="delta v equals" />,
    );
    expect(markup).toContain(
      `<span aria-hidden="true">${rocketEquation}</span>`,
    );
    expect(markup).toContain('<span class="sr-only">delta v equals</span>');
  });

  it("lists the variables with their units", () => {
    const markup = renderToStaticMarkup(
      <EquationBlock
        equation="F = m a"
        variables={[
          { meaning: "Force", symbol: "F", unit: "N" },
          { meaning: "Ratio", symbol: "r" },
        ]}
      />,
    );
    expect(markup).toContain(
      '<p class="orbix-equation__where">where</p><dl class="orbix-equation__vars">',
    );
    expect(markup).toContain(
      '<dt>F</dt><dd>Force, <span class="orbix-equation__unit">N</span></dd>',
    );
    expect(markup).toContain("<dt>r</dt><dd>Ratio</dd>");
  });

  it("prints the equation number at the right margin only when given", () => {
    expect(
      renderToStaticMarkup(<EquationBlock equation="F = m a" />),
    ).not.toContain("orbix-equation__number");
    const markup = renderToStaticMarkup(
      <EquationBlock equation="F = m a" number="2.1" />,
    );
    expect(markup).toContain(
      '<span class="orbix-equation__number">(2<span class="orbix-num-sep">.</span>1)</span>',
    );
    expect(markup).toMatch(
      /<div class="orbix-equation__line"><p class="orbix-equation__expr">F = m a<\/p><span/,
    );
  });

  it("centres decimal separators in the equation, symbols and units", () => {
    const markup = renderToStaticMarkup(
      <EquationBlock
        equation={
          <>
            q = 0.5 ρ V<sup>2</sup>
          </>
        }
        variables={[{ meaning: "Ratio", symbol: "k₀.₅", unit: "1.5 m" }]}
      />,
    );
    expect(markup).toContain(
      '<p class="orbix-equation__expr">q = 0<span class="orbix-num-sep">.</span>5 ρ V<sup>2</sup></p>',
    );
    expect(markup).toContain(
      '<span class="orbix-equation__unit">1<span class="orbix-num-sep">.</span>5 m</span>',
    );
  });
});
