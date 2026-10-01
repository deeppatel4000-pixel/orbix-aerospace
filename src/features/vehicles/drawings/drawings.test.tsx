import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { aircraftVehicles, rocketVehicles } from "@/features/vehicles/data";
import type { Aircraft, Rocket } from "@/features/vehicles/types";

import {
  AircraftSizeComparison,
  aircraftComparisonGeometry,
  COMPARISON_LAYOUTS,
  type ComparisonLayoutName,
} from "./aircraft-size-comparison";
import {
  LINEUP_LAYOUTS,
  type LineupLayoutName,
  RocketHeightLineup,
  rocketLineupGeometry,
  SCALE_BAR_M,
  splitName,
} from "./rocket-height-lineup";
import { METRES_PER_UNIT, toMetres } from "./units";

/** Every attribute of the first element matching `pattern`. */
function attributes(markup: string, pattern: RegExp) {
  const match = markup.match(pattern);
  if (!match) throw new Error(`No element matches ${pattern}`);
  const tag = match[0].slice(match[0].lastIndexOf("<"));
  return Object.fromEntries(
    [...tag.matchAll(/([a-zA-Z0-9-]+)="([^"]*)"/g)].map(([, name, value]) => [
      name,
      value,
    ]),
  ) as Record<string, string>;
}

/** The markup of one layout's SVG. */
function layoutMarkup(markup: string, layout: string) {
  const start = markup.indexOf(`data-layout="${layout}"`);
  if (start < 0) throw new Error(`No ${layout} layout`);
  return markup.slice(start, markup.indexOf("</svg>", start));
}

const lineupLayouts = Object.keys(LINEUP_LAYOUTS) as LineupLayoutName[];
const comparisonLayouts = Object.keys(
  COMPARISON_LAYOUTS,
) as ComparisonLayoutName[];

describe("unit conversion", () => {
  it("uses the exact definitions of the foot and the miles", () => {
    expect(METRES_PER_UNIT.ft).toBe(0.3048);
    expect(METRES_PER_UNIT.mi).toBe(1609.344);
    expect(METRES_PER_UNIT.nmi).toBe(1852);
    expect(toMetres({ unit: "ft", value: 100 })).toBeCloseTo(30.48, 10);
    expect(toMetres({ unit: "m", value: 111 })).toBe(111);
  });
});

describe.each(lineupLayouts)("rocket height lineup, %s", (layout) => {
  const geometry = rocketLineupGeometry(rocketVehicles, layout);
  const u = LINEUP_LAYOUTS[layout].unitsPerMetre;

  it("draws every launch vehicle on record, shortest first", () => {
    expect(geometry.vehicles.map((vehicle) => vehicle.id).sort()).toEqual(
      rocketVehicles.map((rocket) => rocket.id).sort(),
    );
    const metres = geometry.vehicles.map((vehicle) => vehicle.metres);
    expect(metres).toEqual([...metres].sort((a, b) => a - b));
  });

  it.each(rocketVehicles.map((rocket) => [rocket.id, rocket] as const))(
    "%s is drawn at its recorded height",
    (id, rocket) => {
      const vehicle = geometry.vehicles.find((item) => item.id === id)!;
      const drawnMetres =
        Math.hypot(vehicle.x2 - vehicle.x1, vehicle.y2 - vehicle.y1) / u;
      expect(drawnMetres).toBeCloseTo(toMetres(rocket.dimensions.height), 9);
      // Every record is in metres, so the drawn height is the value itself.
      expect(rocket.dimensions.height.unit).toBe("m");
      expect(drawnMetres).toBeCloseTo(rocket.dimensions.height.value, 9);
      expect(vehicle.recorded).toBe(
        `${rocket.dimensions.height.value} ${rocket.dimensions.height.unit}`,
      );
      // Every height starts on the ground line.
      if (layout === "upright") expect(vehicle.y1).toBe(geometry.ground.y1);
      else expect(vehicle.x1).toBe(geometry.ground.x1);
    },
  );

  it("renders each height line at the geometry's length", () => {
    const markup = layoutMarkup(
      renderToStaticMarkup(<RocketHeightLineup rockets={rocketVehicles} />),
      layout,
    );
    for (const rocket of rocketVehicles) {
      const line = attributes(
        markup,
        new RegExp(
          `data-vehicle="${rocket.id}"[^]*?<line[^>]*data-dimension="height"[^>]*>`,
        ),
      );
      const drawn =
        Math.hypot(
          Number(line.x2) - Number(line.x1),
          Number(line.y2) - Number(line.y1),
        ) / u;
      expect(drawn).toBeCloseTo(rocket.dimensions.height.value, 9);
    }
  });

  it("draws the scale bar from 0 to 50 m at the same scale", () => {
    const [zero, ...rest] = geometry.scale;
    expect(zero!.metres).toBe(0);
    expect(geometry.scale.at(-1)!.metres).toBe(SCALE_BAR_M);
    for (const tick of rest) {
      expect(Math.hypot(tick.x - zero!.x, tick.y - zero!.y) / u).toBeCloseTo(
        tick.metres,
        9,
      );
    }
    const markup = layoutMarkup(
      renderToStaticMarkup(<RocketHeightLineup rockets={rocketVehicles} />),
      layout,
    );
    const bar = attributes(markup, /<line[^>]*data-scale-bar=""[^>]*>/);
    expect(
      Math.hypot(
        Number(bar.x2) - Number(bar.x1),
        Number(bar.y2) - Number(bar.y1),
      ) / u,
    ).toBeCloseTo(SCALE_BAR_M, 9);
  });

  it("keeps every figure at 11px or more at the narrowest width shown", () => {
    const narrowest = layout === "level" ? 288 : 592;
    const rendered = Math.min(narrowest, geometry.width);
    const { figureSize, nameSize } = LINEUP_LAYOUTS[layout];
    expect(
      (Math.min(figureSize, nameSize) * rendered) / geometry.width,
    ).toBeGreaterThanOrEqual(11);
  });
});

describe("rocket height lineup", () => {
  it("leaves out a record with no usable height and names it", () => {
    const [first] = rocketVehicles;
    const broken = {
      ...first,
      dimensions: { height: { unit: "m", value: 0 } },
      id: "no-height",
      name: "Unmeasured",
    } as Rocket;
    const markup = renderToStaticMarkup(
      <RocketHeightLineup rockets={[first!, broken]} />,
    );
    expect(markup).not.toContain('data-vehicle="no-height"');
    expect(markup).toContain("Not drawn, no height recorded: Unmeasured.");
  });

  it("splits a long name over two balanced lines", () => {
    expect(splitName("Space Launch System (SLS)")).toEqual([
      "Space Launch",
      "System (SLS)",
    ]);
    expect(splitName("Falcon 9")).toEqual(["Falcon 9"]);
  });
});

describe.each(comparisonLayouts)("aircraft size comparison, %s", (layout) => {
  const geometry = aircraftComparisonGeometry(aircraftVehicles, layout);
  const u = COMPARISON_LAYOUTS[layout].unitsPerMetre;

  it("draws every aircraft on record, smallest wingspan first", () => {
    expect(geometry.aircraft.map((item) => item.id).sort()).toEqual(
      aircraftVehicles.map((item) => item.id).sort(),
    );
    const spans = geometry.aircraft.map((item) => item.wingspanM);
    expect(spans).toEqual([...spans].sort((a, b) => a - b));
  });

  it.each(aircraftVehicles.map((item) => [item.id, item] as const))(
    "%s is drawn at its recorded length and wingspan",
    (id, aircraft) => {
      const drawn = geometry.aircraft.find((item) => item.id === id)!;
      const { length, wingspan } = aircraft.dimensions;
      // The records give feet; the drawing is in metres at 0.3048 m/ft.
      expect(length.unit).toBe("ft");
      expect(wingspan.unit).toBe("ft");
      expect((drawn.tailY - drawn.noseY) / u).toBeCloseTo(
        length.value * 0.3048,
        9,
      );
      expect((drawn.spanRight - drawn.spanLeft) / u).toBeCloseTo(
        wingspan.value * 0.3048,
        9,
      );
      // The span line is centred on the centreline.
      expect((drawn.spanLeft + drawn.spanRight) / 2).toBeCloseTo(
        drawn.centreX,
        9,
      );
      expect(drawn.lengthLabel[0]).toBe(`${length.value} ft`);
      expect(drawn.wingspanLabel[0]).toBe(`${wingspan.value} ft`);
      expect(drawn.lengthLabel[1]).toBe(
        `${(length.value * 0.3048).toFixed(1)} m`,
      );
      expect(drawn.wingspanLabel[1]).toBe(
        `${(wingspan.value * 0.3048).toFixed(1)} m`,
      );
    },
  );

  it("renders each centreline and span line at the geometry's size", () => {
    const markup = layoutMarkup(
      renderToStaticMarkup(
        <AircraftSizeComparison aircraft={aircraftVehicles} />,
      ),
      layout,
    );
    for (const aircraft of aircraftVehicles) {
      const length = attributes(
        markup,
        new RegExp(
          `data-vehicle="${aircraft.id}"[^]*?<line[^>]*data-dimension="length"[^>]*>`,
        ),
      );
      const span = attributes(
        markup,
        new RegExp(
          `data-vehicle="${aircraft.id}"[^]*?<line[^>]*data-dimension="span"[^>]*>`,
        ),
      );
      expect(length.x1).toBe(length.x2);
      expect(span.y1).toBe(span.y2);
      expect((Number(length.y2) - Number(length.y1)) / u).toBeCloseTo(
        aircraft.dimensions.length.value * 0.3048,
        9,
      );
      expect((Number(span.x2) - Number(span.x1)) / u).toBeCloseTo(
        aircraft.dimensions.wingspan.value * 0.3048,
        9,
      );
    }
  });

  it("fits every row inside the drawing and levels the tails in a row", () => {
    for (const item of geometry.aircraft) {
      expect(item.left).toBeGreaterThanOrEqual(0);
      expect(item.right).toBeLessThanOrEqual(geometry.width);
      const row = geometry.aircraft.filter(
        (other) => Math.abs(other.tailY - item.tailY) < 1e-9,
      );
      expect(row.length).toBeGreaterThan(0);
    }
    expect(geometry.scaleBar.y).toBeLessThan(geometry.height);
  });

  it("draws the scale bar ticks at their metre values", () => {
    const [zero, ...rest] = geometry.scaleBar.ticks;
    for (const tick of rest) {
      expect((tick.x - zero!.x) / u).toBeCloseTo(tick.metres, 9);
    }
  });

  it("keeps every figure at 11px or more at the narrowest width shown", () => {
    const narrowest = layout === "narrow" ? 288 : 592;
    const { figureSize, nameSize } = COMPARISON_LAYOUTS[layout];
    expect(
      (Math.min(figureSize, nameSize) * Math.min(narrowest, geometry.width)) /
        geometry.width,
    ).toBeGreaterThanOrEqual(11);
  });
});

describe("aircraft size comparison", () => {
  it("leaves out an aircraft missing a dimension and names it", () => {
    const [first] = aircraftVehicles;
    const broken = {
      ...first,
      dimensions: { ...first!.dimensions, wingspan: { unit: "ft", value: 0 } },
      id: "no-span",
      name: "Unmeasured",
    } as Aircraft;
    const markup = renderToStaticMarkup(
      <AircraftSizeComparison aircraft={[first!, broken]} />,
    );
    expect(markup).not.toContain('data-vehicle="no-span"');
    expect(markup).toContain("Not drawn, a dimension is missing: Unmeasured.");
  });

  it("uses no fill, box, gradient or em dash", () => {
    const markup =
      renderToStaticMarkup(
        <AircraftSizeComparison aircraft={aircraftVehicles} />,
      ) + renderToStaticMarkup(<RocketHeightLineup rockets={rocketVehicles} />);
    expect(markup).not.toMatch(/gradient|<image|shadow|<rect|dasharray/i);
    expect(markup).not.toContain(String.fromCharCode(0x2014));
  });

  it("gives each layout's title and description their own ids", () => {
    const markup =
      renderToStaticMarkup(
        <AircraftSizeComparison aircraft={aircraftVehicles} />,
      ) + renderToStaticMarkup(<RocketHeightLineup rockets={rocketVehicles} />);
    const ids = [...markup.matchAll(/ id="([^"]+)"/g)].map(([, id]) => id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
