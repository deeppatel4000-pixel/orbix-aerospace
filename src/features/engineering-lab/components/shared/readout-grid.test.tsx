import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EqDot, LabFigure, LabSymbol, LabValueText } from "./lab-figure";
import { LabToolLayout, ReadoutGrid } from "./readout-grid";

describe("ReadoutGrid", () => {
  it("renders a definition list inside a container with the column cap", () => {
    const html = renderToStaticMarkup(
      <ReadoutGrid className="mt-3" columns={3}>
        <div>
          <dt>Pressure</dt>
          <dd>101,325 Pa</dd>
        </div>
      </ReadoutGrid>,
    );
    expect(html).toMatch(/^<div [^>]*data-columns="3"/);
    expect(html).toContain("lab-readout-grid");
    expect(html).toContain("mt-3");
    expect(html).toContain("<dl><div><dt>Pressure</dt>");
  });

  it("renders a titled group as a section labelled by its head", () => {
    const html = renderToStaticMarkup(
      <ReadoutGrid title="Stagnation conditions">
        <div>
          <dt>Pressure</dt>
          <dd>101,325 Pa</dd>
        </div>
      </ReadoutGrid>,
    );
    const id = /<h4 class="lab-readout-grid__head" id="([^"]+)">/.exec(
      html,
    )?.[1];
    expect(id).toBeTruthy();
    expect(html).toMatch(/^<section aria-labelledby="[^"]+"/);
    expect(html).toContain(`aria-labelledby="${id}"`);
    expect(html).toContain("Stagnation conditions</h4><dl>");
  });

  it("defaults to two columns", () => {
    expect(renderToStaticMarkup(<ReadoutGrid />)).toContain('data-columns="2"');
  });
});

describe("LabFigure", () => {
  it("keeps the number whole and lets the unit wrap under it", () => {
    const html = renderToStaticMarkup(
      <LabFigure unit="Pa">54,019.55</LabFigure>,
    );
    expect(html).toMatch(/^<span class="lab-figure">/);
    expect(html).toContain('class="lab-figure__value whitespace-nowrap"');
    expect(html).toContain('class="lab-figure__unit"');
    expect(html.replace(/<[^>]+>/g, "")).toBe("54,019.55 Pa");
  });

  it("sets a degree sign on the figure itself, with no space", () => {
    const html = renderToStaticMarkup(<LabFigure unit="°">39.3139</LabFigure>);
    expect(html).not.toContain("lab-figure__unit");
    expect(html.replace(/<[^>]+>/g, "")).toBe("39.3139°");
  });

  it("renders no unit span for a dimensionless figure", () => {
    const html = renderToStaticMarkup(<LabFigure>4.87</LabFigure>);
    expect(html).not.toContain("lab-figure__unit");
  });
});

describe("EqDot", () => {
  it("keeps the dot as text and marks it for centring", () => {
    expect(renderToStaticMarkup(<EqDot />)).toBe(
      '<span class="lab-eq-dot">·</span>',
    );
  });
});

describe("LabSymbol", () => {
  it("marks a symbol so the uppercase label leaves it alone", () => {
    expect(renderToStaticMarkup(<LabSymbol>ρ₂/ρ₁</LabSymbol>)).toBe(
      '<span class="lab-symbol">ρ₂/ρ₁</span>',
    );
  });
});

describe("LabValueText", () => {
  it("marks a worded result so it is not set as a readout", () => {
    expect(renderToStaticMarkup(<LabValueText>Subsonic</LabValueText>)).toBe(
      '<span class="lab-value-text">Subsonic</span>',
    );
  });
});

describe("LabToolLayout", () => {
  it("puts the equation before the form and results", () => {
    const html = renderToStaticMarkup(
      <LabToolLayout equation={<figure>eq</figure>}>
        <form />
      </LabToolLayout>,
    );
    expect(html.indexOf("<figure>")).toBeLessThan(html.indexOf("<form>"));
  });
});
