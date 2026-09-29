import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EquationBlock } from "@/components/ui/equation-block";

const rocketEquation = "Δv = Isp g0 ln(m0 / mf)";

describe("EquationBlock", () => {
  it("sets the equation in a figure named by its label", () => {
    const markup = renderToStaticMarkup(
      <EquationBlock equation={rocketEquation} label="Rocket equation" />,
    );
    expect(markup).toMatch(/^<figure class="orbix-equation">/);
    expect(markup).toContain(
      '<figcaption class="orbix-equation__label">Rocket equation</figcaption>',
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
    expect(markup).toContain('<dl class="orbix-equation__vars">');
    expect(markup).toContain(
      '<dt>F</dt><dd>Force<span class="orbix-equation__unit">N</span></dd>',
    );
    expect(markup).toContain("<dt>r</dt><dd>Ratio</dd>");
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
