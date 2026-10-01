import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  LabEquation,
  LabToolNumberProvider,
  labEquationNumber,
} from "./lab-equation";

describe("labEquationNumber", () => {
  it("numbers an equation after its tool ID", () => {
    expect(labEquationNumber("03")).toBe("3.1");
    expect(labEquationNumber("12", 2)).toBe("12.2");
  });

  it("gives no number without a usable tool ID", () => {
    expect(labEquationNumber(undefined)).toBeUndefined();
    expect(labEquationNumber("")).toBeUndefined();
  });
});

describe("LabEquation", () => {
  it("prints the tool's equation number at the right margin", () => {
    const html = renderToStaticMarkup(
      <LabToolNumberProvider value="05">
        <LabEquation equation="F = m·a" />
      </LabToolNumberProvider>,
    );
    expect(html).toContain("orbix-equation__number");
    expect(html.replace(/<[^>]+>/g, "")).toContain("(5.1)");
  });

  it("prints no number outside a lab module", () => {
    const html = renderToStaticMarkup(<LabEquation equation="F = m·a" />);
    expect(html).not.toContain("orbix-equation__number");
  });
});
