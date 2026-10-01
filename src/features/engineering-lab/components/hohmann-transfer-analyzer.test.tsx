import { describe, expect, it } from "vitest";

import { analyzeHohmannTransfer } from "@/features/engineering-lab/analysis";

import { transferDeltaVReadouts } from "./hohmann-transfer-analyzer";

function parse(text: string): number {
  return Number(text.replaceAll(",", ""));
}

describe("transferDeltaVReadouts", () => {
  it("shows both burns and the total at one precision that adds up", () => {
    const cases: readonly [number, number][] = [
      [400, 600],
      [400, 35_786],
      [200, 408],
      [600, 400],
      [300, 2_000],
    ];
    for (const [fromKm, toKm] of cases) {
      const { transfer } = analyzeHohmannTransfer({
        finalAltitudeMetres: toKm * 1_000,
        initialAltitudeMetres: fromKm * 1_000,
      });
      const shown = transferDeltaVReadouts(transfer);
      const decimals = (text: string) => text.split(".")[1]?.length ?? 0;
      expect(decimals(shown.first)).toBe(decimals(shown.total));
      expect(decimals(shown.second)).toBe(decimals(shown.total));
      expect(
        (parse(shown.first) + parse(shown.second)).toFixed(
          decimals(shown.total),
        ),
      ).toBe(parse(shown.total).toFixed(decimals(shown.total)));
    }
  });

  it("shows 400 to 600 km as 55.6 + 55.2 = 110.8 m/s", () => {
    const { transfer } = analyzeHohmannTransfer({
      finalAltitudeMetres: 600_000,
      initialAltitudeMetres: 400_000,
    });
    expect(transferDeltaVReadouts(transfer)).toEqual({
      first: "55.6",
      second: "55.2",
      total: "110.8",
    });
  });
});
