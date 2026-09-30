import { describe, expect, it } from "vitest";

import { groupedCredits, shortCredit, shortLicense } from "./photo-credit";

const NBSP = " ";
const NB_HYPHEN = "‑";

describe("shortCredit", () => {
  it("joins a Creative Commons licence with no-break spaces", () => {
    expect(shortCredit("Steve Jurvetson", "CC BY 2.0")).toBe(
      "Steve Jurvetson, CC" + NBSP + "BY" + NBSP + "2.0",
    );
  });

  it("shortens government sources and public-domain licences", () => {
    expect(
      shortCredit(
        "U.S. Air Force photo",
        "Public domain (U.S. government work)",
      ),
    ).toBe("USAF, public" + NBSP + "domain");
    expect(shortCredit("NASA/Kim Shiflett", "Public domain")).toBe(
      "NASA, public" + NBSP + "domain",
    );
  });

  it("leaves one ordinary space, after the comma, as the only break", () => {
    const credit = shortCredit("Steve Jurvetson", "CC BY-SA 2.0");
    expect(credit.split(" ")).toEqual([
      "Steve",
      "Jurvetson,",
      expect.any(String),
    ]);
    expect(shortLicense("CC BY-SA 2.0")).toBe(
      "CC" + NBSP + "BY" + NB_HYPHEN + "SA" + NBSP + "2.0",
    );
  });
});

describe("groupedCredits", () => {
  it("groups by licence then source with unbreakable names", () => {
    const groups = groupedCredits([
      {
        credit: "U.S. Air Force photo",
        license: "Public domain",
        licenseUrl: "",
        name: "F-22 Raptor",
      },
      {
        credit: "U.S. Air Force photo",
        license: "Public domain",
        licenseUrl: "",
        name: "B-2 Spirit",
      },
      {
        credit: "Steve Jurvetson",
        license: "CC BY 2.0",
        licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
        name: "Starship",
      },
    ]);

    expect(groups).toEqual([
      {
        license: "public" + NBSP + "domain",
        licenseUrl: undefined,
        sources:
          "USAF (F" +
          NB_HYPHEN +
          "22" +
          NBSP +
          "Raptor, B" +
          NB_HYPHEN +
          "2" +
          NBSP +
          "Spirit)",
      },
      {
        license: "CC" + NBSP + "BY" + NBSP + "2.0",
        licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
        sources: "Steve Jurvetson (Starship)",
      },
    ]);
  });
});
