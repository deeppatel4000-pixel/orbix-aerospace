import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { analyzeHohmannTransfer } from "@/features/engineering-lab/analysis";
import {
  calculateVisViva,
  EARTH_MEAN_RADIUS_METRES,
} from "@/features/engineering-lab/calculators";

import { conicRadius, polarToSvg, sampleConic, toSvgPath } from "./conic-path";
import { createStretchMap, formatStretchFactor } from "./stretch-map";
import {
  altitudeToPosition,
  MOON_MEAN_DISTANCE_METRES,
  positionToAltitude,
  roundTargetAltitude,
  selectionForStop,
  snapTarget,
  SNAP_TOLERANCE_STEPS,
  TARGET_MAX_ALTITUDE_METRES,
  TARGET_MIN_ALTITUDE_METRES,
  TARGET_SCALE_STEPS,
  TARGET_STOPS,
} from "./target-scale";
import { TransferCanvas } from "./transfer-canvas";
import { dragPosition, TransferExplorer } from "./transfer-explorer";
import {
  burnDecimals,
  computeTransferModel,
  craftStateAt,
  formatDuration,
  formatSpeed,
  totalDecimals,
  narrateTransfer,
  TRANSFER_ASSUMPTIONS,
} from "./transfer-model";

const EM_DASH = String.fromCharCode(0x2014);
const NBSP = "\u00A0";

/** GEO is far enough that the drawing falls back to true scale. */
const map = createStretchMap({
  drawnMaxRadius: 150,
  drawnPlanetRadius: 46,
  maxAltitudeMetres: 35_786_000,
  planetRadiusMetres: EARTH_MEAN_RADIUS_METRES,
});

/** ISS altitude: heights are stretched. */
const issMap = createStretchMap({
  drawnMaxRadius: 150,
  drawnPlanetRadius: 46,
  maxAltitudeMetres: 408_000,
  planetRadiusMetres: EARTH_MEAN_RADIUS_METRES,
});

describe("stretch map", () => {
  it("stretches low orbits: surface on the drawn Earth, top altitude on the outer radius", () => {
    expect(issMap.toScale).toBe(false);
    expect(issMap.altitudeToDrawn(0)).toBe(46);
    expect(issMap.drawnPlanetRadius).toBe(46);
    expect(issMap.altitudeToDrawn(408_000)).toBeCloseTo(150, 10);
    expect(issMap.altitudeToDrawn(102_000)).toBeCloseTo(46 + 104 / 4, 10);
  });

  it("reports how much altitude is stretched relative to Earth", () => {
    // k / (R_drawn / R) = (104 / 408 km) / (46 / 6,371 km)
    const expected = 104 / 408_000 / (46 / EARTH_MEAN_RADIUS_METRES);
    expect(issMap.stretchFactor).toBeCloseTo(expected, 12);
    expect(formatStretchFactor(issMap.stretchFactor)).toBe("35");
    expect(formatStretchFactor(1.43)).toBe("1.4");
  });

  it("never compresses heights: far targets are drawn to true scale", () => {
    expect(map.toScale).toBe(true);
    expect(map.stretchFactor).toBe(1);
    const scale = 150 / (EARTH_MEAN_RADIUS_METRES + 35_786_000);
    expect(map.drawnPlanetRadius).toBeCloseTo(
      scale * EARTH_MEAN_RADIUS_METRES,
      10,
    );
    expect(map.altitudeToDrawn(35_786_000)).toBeCloseTo(150, 10);
    // One scale for everything: drawn radius is proportional to radius.
    for (const radius of [EARTH_MEAN_RADIUS_METRES, 10_000_000, 30_000_000]) {
      expect(map.radiusToDrawn(radius)).toBeCloseTo(scale * radius, 10);
    }
  });

  it("is continuous where stretching stops (factor exactly 1)", () => {
    // Stretch is 1 when k = R_drawn / R, at maxAltitude = 104 R / 46.
    const boundary = (104 * EARTH_MEAN_RADIUS_METRES) / 46;
    const below = createStretchMap({
      drawnMaxRadius: 150,
      drawnPlanetRadius: 46,
      maxAltitudeMetres: boundary * 0.999,
      planetRadiusMetres: EARTH_MEAN_RADIUS_METRES,
    });
    const above = createStretchMap({
      drawnMaxRadius: 150,
      drawnPlanetRadius: 46,
      maxAltitudeMetres: boundary * 1.001,
      planetRadiusMetres: EARTH_MEAN_RADIUS_METRES,
    });
    expect(below.toScale).toBe(false);
    expect(above.toScale).toBe(true);
    expect(above.drawnPlanetRadius).toBeCloseTo(below.drawnPlanetRadius, 0);
    expect(below.stretchFactor).toBeCloseTo(1, 2);
  });

  it("inverts exactly and keeps orbit order", () => {
    for (const m of [map, issMap]) {
      for (const altitude of [0, 200_000, 408_000, 20_000_000]) {
        expect(m.drawnToAltitude(m.altitudeToDrawn(altitude))).toBeCloseTo(
          altitude,
          3,
        );
        expect(
          m.drawnToRadius(m.radiusToDrawn(EARTH_MEAN_RADIUS_METRES + altitude)),
        ).toBeCloseTo(EARTH_MEAN_RADIUS_METRES + altitude, 3);
      }
      expect(m.altitudeToDrawn(200_000)).toBeLessThan(
        m.altitudeToDrawn(408_000),
      );
    }
  });

  it("rejects a map with no room for altitude", () => {
    expect(() =>
      createStretchMap({
        drawnMaxRadius: 40,
        drawnPlanetRadius: 46,
        maxAltitudeMetres: 1,
        planetRadiusMetres: 1,
      }),
    ).toThrow(RangeError);
    expect(() =>
      createStretchMap({
        drawnMaxRadius: 150,
        drawnPlanetRadius: 46,
        maxAltitudeMetres: 0,
        planetRadiusMetres: 1,
      }),
    ).toThrow(RangeError);
  });
});

describe("conic sampling", () => {
  it("follows r = a(1 − e²) / (1 + e cos ν)", () => {
    expect(conicRadius(10, 0.5, 0)).toBeCloseTo(5, 12);
    expect(conicRadius(10, 0.5, Math.PI)).toBeCloseTo(15, 12);
    expect(conicRadius(10, 0, 1.3)).toBe(10);
  });

  it("samples the arc end to end, with periapsis rotation", () => {
    const points = sampleConic({
      eccentricity: 0.5,
      fromTrueAnomalyRadians: 0,
      periapsisAngleRadians: Math.PI / 2,
      segments: 4,
      semiMajorAxisMetres: 10,
      toTrueAnomalyRadians: Math.PI,
    });
    expect(points).toHaveLength(5);
    expect(points[0]).toEqual({ angleRadians: Math.PI / 2, radiusMetres: 5 });
    expect(points[4]!.radiusMetres).toBeCloseTo(15, 12);
    expect(points[4]!.angleRadians).toBeCloseTo(1.5 * Math.PI, 12);
  });

  it("maps polar points to SVG with y pointing down", () => {
    const top = polarToSvg(
      { angleRadians: Math.PI / 2, radiusMetres: EARTH_MEAN_RADIUS_METRES },
      map,
      { x: 100, y: 100 },
    );
    expect(top.x).toBeCloseTo(100, 10);
    expect(top.y).toBeCloseTo(100 - map.drawnPlanetRadius, 10);
  });

  it("writes a path that starts at burn 1 and ends at burn 2", () => {
    const model = computeTransferModel(200_000, 35_786_000)!;
    const path = toSvgPath(
      sampleConic({
        eccentricity: model.eccentricity,
        fromTrueAnomalyRadians: 0,
        periapsisAngleRadians: 0,
        semiMajorAxisMetres: model.semiMajorAxisMetres,
        toTrueAnomalyRadians: Math.PI,
      }).map((point) => polarToSvg(point, map, { x: 0, y: 0 })),
    );
    const start = map.altitudeToDrawn(200_000).toFixed(2);
    expect(path.startsWith(`M${start} 0.00`)).toBe(true);
    expect(path.endsWith("L-150.00 0.00")).toBe(true);
    expect(path).not.toContain("NaN");
  });

  it("rejects open conics", () => {
    expect(() =>
      sampleConic({
        eccentricity: 1,
        fromTrueAnomalyRadians: 0,
        periapsisAngleRadians: 0,
        semiMajorAxisMetres: 1,
        toTrueAnomalyRadians: 1,
      }),
    ).toThrow(RangeError);
  });
});

describe("target scale", () => {
  it("spans 160 km to 400,000 km on a log scale", () => {
    expect(positionToAltitude(0)).toBeCloseTo(TARGET_MIN_ALTITUDE_METRES, 6);
    expect(positionToAltitude(TARGET_SCALE_STEPS)).toBeCloseTo(
      TARGET_MAX_ALTITUDE_METRES,
      0,
    );
    const middle = positionToAltitude(TARGET_SCALE_STEPS / 2);
    expect(middle).toBeCloseTo(
      Math.sqrt(TARGET_MIN_ALTITUDE_METRES * TARGET_MAX_ALTITUDE_METRES),
      0,
    );
    expect(altitudeToPosition(middle)).toBeCloseTo(TARGET_SCALE_STEPS / 2, 9);
  });

  it("rounds to three significant figures in km", () => {
    expect(roundTargetAltitude(201_400)).toBe(201_000);
    expect(roundTargetAltitude(12_345_000)).toBe(12_300_000);
    expect(roundTargetAltitude(160_000)).toBe(160_000);
  });

  it("puts the Moon stop at the Moon's mean distance from Earth's centre", () => {
    const moon = TARGET_STOPS.find((stop) => stop.id === "moon")!;
    expect(moon.altitudeMetres + EARTH_MEAN_RADIUS_METRES).toBe(
      MOON_MEAN_DISTANCE_METRES,
    );
    for (const stop of TARGET_STOPS) {
      expect(stop.altitudeMetres).toBeGreaterThan(TARGET_MIN_ALTITUDE_METRES);
      expect(stop.altitudeMetres).toBeLessThan(TARGET_MAX_ALTITUDE_METRES);
    }
  });

  it("snaps to a stop when moving toward it, and lets one step leave it", () => {
    const iss = TARGET_STOPS[0]!;
    const stopPosition = altitudeToPosition(iss.altitudeMetres);
    const approach = snapTarget(
      stopPosition - SNAP_TOLERANCE_STEPS - 5,
      Math.round(stopPosition) - 3,
    );
    expect(approach.stop?.id).toBe("iss");
    expect(approach.altitudeMetres).toBe(408_000);

    const onStop = selectionForStop(iss);
    const leave = snapTarget(onStop.position, Math.round(onStop.position) + 1);
    expect(leave.stop).toBeUndefined();
    const further = snapTarget(leave.position, leave.position + 1);
    expect(further.stop).toBeUndefined();
  });

  it("does not snap at the ends of the scale (Home and End)", () => {
    const moon = selectionForStop(TARGET_STOPS[2]!);
    expect(TARGET_SCALE_STEPS - moon.position).toBeLessThan(
      SNAP_TOLERANCE_STEPS,
    );
    const end = snapTarget(moon.position - 20, TARGET_SCALE_STEPS);
    expect(end.stop).toBeUndefined();
    expect(end.altitudeMetres).toBe(TARGET_MAX_ALTITUDE_METRES);
    expect(snapTarget(100, 0).altitudeMetres).toBe(TARGET_MIN_ALTITUDE_METRES);
  });
});

describe("transfer model", () => {
  it("takes every number from the Hohmann analysis and vis-viva", () => {
    const model = computeTransferModel(200_000, 35_786_000)!;
    const analysis = analyzeHohmannTransfer({
      finalAltitudeMetres: 35_786_000,
      initialAltitudeMetres: 200_000,
    });
    expect(model.firstBurnDeltaVMetresPerSecond).toBe(
      analysis.transfer.firstBurnDeltaVMetresPerSecond,
    );
    expect(model.secondBurnDeltaVMetresPerSecond).toBe(
      analysis.transfer.secondBurnDeltaVMetresPerSecond,
    );
    expect(model.totalDeltaVMetresPerSecond).toBe(
      analysis.transfer.totalDeltaVMetresPerSecond,
    );
    expect(model.transferTimeSeconds).toBe(
      analysis.transfer.transferTimeSeconds,
    );
    expect(model.departureSpeedMetresPerSecond).toBe(
      calculateVisViva({
        gravitationalParameter: analysis.resolved.gravitationalParameter,
        orbitalRadiusMetres: analysis.initialOrbit.orbitalRadiusMetres,
        semiMajorAxisMetres: analysis.transfer.transferSemiMajorAxisMetres,
      }).orbitalVelocityMetresPerSecond,
    );
    // Burn 1 = departure speed minus circular speed.
    expect(
      model.departureSpeedMetresPerSecond -
        model.initial.circularSpeedMetresPerSecond,
    ).toBeCloseTo(model.firstBurnDeltaVMetresPerSecond, 9);
  });

  it("returns null for equal altitudes", () => {
    expect(computeTransferModel(400_000, 400_000)).toBeNull();
  });

  it("handles a lowering transfer", () => {
    const model = computeTransferModel(408_000, 200_000)!;
    expect(model.raising).toBe(false);
    expect(model.departureSpeedMetresPerSecond).toBeLessThan(
      model.initial.circularSpeedMetresPerSecond,
    );
    expect(narrateTransfer(model).burn1).toContain("slow down by");
  });

  it("moves the craft on Kepler timing from burn 1 to burn 2", () => {
    for (const [from, to] of [
      [200_000, 35_786_000],
      [35_786_000, 200_000],
    ] as const) {
      const model = computeTransferModel(from, to)!;
      const start = craftStateAt(model, 0);
      const end = craftStateAt(model, 1);
      expect(start.sweptAngleRadians).toBe(0);
      expect(start.radiusMetres).toBeCloseTo(model.initial.radiusMetres, 0);
      expect(end.sweptAngleRadians).toBe(Math.PI);
      expect(end.radiusMetres).toBeCloseTo(model.target.radiusMetres, 0);
      expect(end.elapsedSeconds).toBe(model.transferTimeSeconds);

      // Half the time sweeps more than half the angle when leaving
      // periapsis (raising), less when leaving apoapsis (lowering).
      const half = craftStateAt(model, 0.5).sweptAngleRadians;
      if (model.raising) expect(half).toBeGreaterThan(Math.PI / 2);
      else expect(half).toBeLessThan(Math.PI / 2);
    }
  });

  it("narrates one sentence per step from computed values", () => {
    const model = computeTransferModel(200_000, 408_000)!;
    const narration = narrateTransfer(model);
    // Under 100 m/s, the burn and both speeds carry one decimal.
    const burn1 = model.firstBurnDeltaVMetresPerSecond.toFixed(1);
    expect(model.firstBurnDeltaVMetresPerSecond).toBeLessThan(100);
    expect(narration.burn1).toContain(`speed up by ${burn1}${NBSP}m/s`);
    expect(narration.burn1).toContain(
      `from ${formatSpeed(model.initial.circularSpeedMetresPerSecond, 1)}${NBSP}m/s`,
    );
    expect(narration.burn1.startsWith(`Burn 1 at 200${NBSP}km`)).toBe(true);
    expect(narration.burn2.startsWith(`Burn 2 at 408${NBSP}km`)).toBe(true);
    expect(narration.coast).toContain(
      formatDuration(model.transferTimeSeconds),
    );
    for (const sentence of Object.values(narration)) {
      // One sentence: a full stop only at the end (decimal points aside).
      expect(sentence.match(/\.(?!\d)/g)?.length ?? 0).toBe(1);
      expect(sentence).not.toContain(EM_DASH);
    }
  });

  it("formats durations with each number joined to its unit", () => {
    expect(formatDuration(45 * 60)).toBe(`45${NBSP}min`);
    expect(formatDuration(5 * 3_600 + 17 * 60)).toBe(`5${NBSP}h 17${NBSP}min`);
    expect(formatDuration(3 * 3_600)).toBe(`3${NBSP}h`);
    expect(formatDuration(4.94 * 86_400)).toBe(`4.9${NBSP}days`);
  });

  it("shows large burns as whole numbers and small ones to one decimal", () => {
    expect(burnDecimals(2_455)).toBe(0);
    expect(burnDecimals(60.4)).toBe(1);
    expect(formatSpeed(7_788.42, 1)).toBe("7,788.4");
    expect(totalDecimals(computeTransferModel(200_000, 35_786_000)!)).toBe(0);
    expect(totalDecimals(computeTransferModel(200_000, 408_000)!)).toBe(1);
  });
});

describe("TransferCanvas and TransferExplorer markup", () => {
  it("draws an accessible SVG with direct labels", () => {
    const model = computeTransferModel(200_000, 35_786_000);
    const markup = renderToStaticMarkup(
      <TransferCanvas
        description="Test description"
        initialAltitudeMetres={200_000}
        model={model}
        planetRadiusMetres={EARTH_MEAN_RADIUS_METRES}
        targetAltitudeMetres={35_786_000}
        title="Test title"
      />,
    );
    expect(markup).toMatch(/<svg[^>]*role="img"/);
    expect(markup).toContain("<title");
    expect(markup).toContain("Start 200 km");
    expect(markup).toContain("Target 35,786 km");
    expect(markup).toContain("Burn 1");
    expect(markup).toContain("Burn 2");
    expect(markup).not.toContain("NaN");
    // Direction of travel and the solid Earth disc.
    expect(markup).toContain("<polygon");
    expect(markup).toContain('fill="var(--bg-inset)"');
  });

  it("keeps the dragged ring under the pointer on the frozen map", () => {
    const frozen = createStretchMap({
      drawnMaxRadius: 140,
      drawnPlanetRadius: 44,
      maxAltitudeMetres: 35_786_000,
      planetRadiusMetres: EARTH_MEAN_RADIUS_METRES,
    });
    const radius = frozen.altitudeToDrawn(10_000_000);
    expect(positionToAltitude(dragPosition(frozen, radius))).toBeCloseTo(
      10_000_000,
      0,
    );
    // Inside Earth: the bottom of the scale. Past the edge: further up.
    expect(dragPosition(frozen, 1)).toBe(0);
    expect(dragPosition(frozen, 160)).toBeGreaterThan(
      altitudeToPosition(35_786_000),
    );
    expect(dragPosition(frozen, 10_000)).toBe(TARGET_SCALE_STEPS);
  });

  it("renders the full explorer with live numbers, table twin and assumptions", () => {
    const markup = renderToStaticMarkup(<TransferExplorer />);
    const model = computeTransferModel(200_000, 35_786_000)!;
    const text = markup.replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'");

    expect(markup.match(/type="range"/g)).toHaveLength(2);
    expect(markup).toContain(
      'aria-valuetext="35,786 km, geostationary altitude"',
    );
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain("<details");
    expect(markup).toContain("<table");
    expect(markup).toContain('aria-live="polite"');
    expect(text).toContain(TRANSFER_ASSUMPTIONS);
    expect(text.replace(/&nbsp;/g, NBSP)).toContain(
      narrateTransfer(model).burn1,
    );
    expect(text).toContain("Total delta-v");
    expect(text).toContain("Drawn to scale.");
    expect(text).toContain(
      Math.round(model.totalDeltaVMetresPerSecond).toLocaleString("en-US"),
    );
    // Nothing plays on load; the play control is a user action.
    expect(text).toContain("Play the coast");
    expect(text).not.toContain(EM_DASH);
    expect(markup).not.toMatch(/gradient|box-shadow|rounded-(md|lg|xl|full)/);
  });

  it("renders the compact variant: drawing, total, slider and a lab link", () => {
    const markup = renderToStaticMarkup(
      <TransferExplorer
        defaultTargetAltitudeMetres={408_000}
        variant="compact"
      />,
    );
    const text = markup.replace(/<[^>]+>/g, "");
    expect(markup.match(/type="range"/g)).toHaveLength(1);
    expect(markup).toContain('aria-valuetext="408 km, ISS altitude"');
    expect(markup).not.toContain("<table");
    expect(markup).not.toContain("aria-pressed");
    expect(text).toContain("Total delta-v");
    expect(text).toContain("Transfer time");
    expect(text).toContain("Open in the Engineering Lab");
    expect(markup).toContain('href="/engineering-lab"');
    expect(text).toContain("heights above it are drawn");
  });

  it("explains the Moon stop truthfully", () => {
    const markup = renderToStaticMarkup(
      <TransferExplorer
        defaultTargetAltitudeMetres={TARGET_STOPS[2]!.altitudeMetres}
      />,
    );
    const text = markup.replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'");
    expect(markup.replace(/&#x27;/g, "'")).toContain(
      "aria-valuetext=\"378,029 km, orbit radius equal to the Moon's mean distance, 384,400 km from Earth's centre\"",
    );
    expect(text).toContain(
      "384,400 km from Earth's centre (NASA Moon Fact Sheet); Moon's gravity ignored.",
    );
  });
});
