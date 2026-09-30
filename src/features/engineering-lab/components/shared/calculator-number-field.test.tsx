import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CalculatorNumberField } from "./calculator-number-field";

function renderField(optional?: boolean, unit = "m") {
  return renderToStaticMarkup(
    <CalculatorNumberField
      field="altitude"
      hint="Leave blank to use the default."
      idPrefix="test"
      label="Altitude"
      onChange={() => undefined}
      unit={unit}
      value=""
      {...(optional === undefined ? {} : { optional })}
    />,
  );
}

const componentsDir = join(__dirname, "..");
const SYMBOL_UNITS = ["CD", "CL", "gamma", "k"];

describe("CalculatorNumberField", () => {
  it("marks the input required by default", () => {
    expect(renderField()).toMatch(/<input[^>]*required=""/);
  });

  it("does not mark an optional input required", () => {
    expect(renderField(true)).not.toContain("required");
  });

  it("announces a real unit", () => {
    expect(renderField(false, "m")).toContain("Unit: m");
  });

  it("announces no unit for a dimensionless quantity and draws no empty suffix cell", () => {
    const html = renderField(false, "");
    expect(html).not.toContain("Unit:");
    // An empty bordered cell read as a missing unit, so the input fills
    // the row instead.
    expect(html).not.toContain("orbix-field__unit");
  });

  it("does not pass a quantity symbol as a unit in calculators or analyzers", () => {
    const files = readdirSync(componentsDir).filter((name) =>
      /-(calculator|analyzer)\.tsx$/.test(name),
    );
    expect(files.length).toBeGreaterThan(0);
    const offenders = files.flatMap((name) => {
      const source = readFileSync(join(componentsDir, name), "utf8");
      return SYMBOL_UNITS.filter((symbol) =>
        source.includes(`unit="${symbol}"`),
      ).map((symbol) => `${name}: unit="${symbol}"`);
    });
    expect(offenders).toEqual([]);
  });
});
