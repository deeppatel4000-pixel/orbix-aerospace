import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { aircraftVehicles, rocketVehicles } from "@/features/vehicles/data";
import type { Aircraft, Rocket } from "@/features/vehicles/types";

import {
  AircraftSizeComparison,
  aircraftPlans,
  PLAN_PAD_M,
  planViewBox,
  SCALE_BAR_M as PLAN_SCALE_BAR_M,
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
  it("carries each upright top to the figure column, one figure per height", () => {
    const geometry = rocketLineupGeometry(rocketVehicles, "upright");
    const svg = layoutMarkup(
      renderToStaticMarkup(<RocketHeightLineup rockets={rocketVehicles} />),
      "upright",
    );
    for (const vehicle of geometry.vehicles) {
      const extension = attributes(
        svg,
        new RegExp(
          `data-vehicle="${vehicle.id}"[^]*?<line[^>]*data-extension=""[^>]*>`,
        ),
      );
      expect(Number(extension.y1)).toBe(vehicle.y2);
      expect(Number(extension.y2)).toBe(vehicle.y2);
      expect(Number(extension.x2)).toBe(geometry.leaderX);
    }
    const distinct = new Set(
      geometry.vehicles.map((vehicle) => vehicle.metres),
    );
    expect(svg.match(/data-figure=""/g)).toHaveLength(distinct.size);
    // The scale bar lies flat under the ground line.
    for (const tick of geometry.scale) {
      expect(tick.y).toBeGreaterThan(geometry.ground.y1);
    }
  });

  it("closes up the decimal point in every drawn figure", () => {
    const svg =
      renderToStaticMarkup(<RocketHeightLineup rockets={rocketVehicles} />) +
      renderToStaticMarkup(
        <AircraftSizeComparison aircraft={aircraftVehicles} />,
      );
    expect(svg).toContain('<tspan data-num-sep="" dx="-0.24">.</tspan>');
    expect(svg).toContain('<span class="orbix-num-sep">.</span>');
    // No figure keeps a bare point between digits.
    expect(svg).not.toMatch(/>[^<]*\d\.\d[^<]*<\/(?:text|tspan|span)>/);
  });

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

describe("aircraft size comparison", () => {
  const plans = aircraftPlans(aircraftVehicles);
  const markup = () =>
    renderToStaticMarkup(
      <AircraftSizeComparison aircraft={aircraftVehicles} />,
    );

  it("draws every aircraft on record, smallest wingspan first", () => {
    expect(plans.map((item) => item.id).sort()).toEqual(
      aircraftVehicles.map((item) => item.id).sort(),
    );
    const spans = plans.map((item) => item.wingspanM);
    expect(spans).toEqual([...spans].sort((a, b) => a - b));
  });

  it.each(aircraftVehicles.map((item) => [item.id, item] as const))(
    "%s is drawn at its recorded length and wingspan",
    (id, aircraft) => {
      const drawn = plans.find((item) => item.id === id)!;
      const { length, wingspan } = aircraft.dimensions;
      // The records give feet; the drawing is in metres at 0.3048 m/ft.
      expect(length.unit).toBe("ft");
      expect(wingspan.unit).toBe("ft");
      expect(drawn.lengthM).toBeCloseTo(length.value * 0.3048, 9);
      expect(drawn.wingspanM).toBeCloseTo(wingspan.value * 0.3048, 9);
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

  it("renders each plan in metres at one shared CSS scale", () => {
    const svg = markup();
    for (const item of plans) {
      const group = new RegExp(`data-vehicle="${item.id}"[^]*?`);
      const plan = attributes(
        svg,
        new RegExp(group.source + `<svg[^>]*data-plan=""[^>]*>`),
      );
      const box = planViewBox(item);
      expect(plan.viewBox).toBe(`${box.x} 0 ${box.width} ${box.height}`);
      // The rendered width is the box in metres times the shared scale.
      expect(plan.style).toBe(
        `width:calc(var(--plan-u) * ${Math.round(box.width * 1000) / 1000})`,
      );

      const length = attributes(
        svg,
        new RegExp(group.source + `<line[^>]*data-dimension="length"[^>]*>`),
      );
      const span = attributes(
        svg,
        new RegExp(group.source + `<line[^>]*data-dimension="span"[^>]*>`),
      );
      expect(Number(length.y2) - Number(length.y1)).toBeCloseTo(
        item.lengthM,
        9,
      );
      expect(Number(span.x2) - Number(span.x1)).toBeCloseTo(item.wingspanM, 9);

      // The envelope: nose on the same pad for every plan, so noses are
      // level along a row.
      const envelope = attributes(
        svg,
        new RegExp(group.source + `<path[^>]*data-envelope=""[^>]*>`),
      );
      const [x1, y1, x2, y2] = envelope
        .d!.match(/-?[\d.]+(?:e-?\d+)?/g)!
        .map(Number);
      expect(x1).toBe(0);
      expect(y1).toBe(PLAN_PAD_M);
      expect(x2).toBeCloseTo(item.wingspanM, 9);
      expect(y2! - y1!).toBeCloseTo(item.lengthM, 9);

      // Each plan is named, with both dimensions, under the drawing.
      expect(svg).toMatch(
        new RegExp(`data-vehicle="${item.id}"[^]*?>${item.name}</p>`),
      );
    }
  });

  it("sizes the scale bar from the same scale", () => {
    const bar = attributes(markup(), /<div[^>]*data-scale-bar=""[^>]*>/);
    expect(bar.style).toBe(`width:calc(var(--plan-u) * ${PLAN_SCALE_BAR_M})`);
  });

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
    expect(markup).not.toMatch(/gradient|<image|shadow|<rect|fill="(?!none)/i);
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
