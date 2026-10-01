import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { VehicleProfileHero } from "./vehicle-profile-hero";

const record = [
  { label: "Maximum speed", value: "Mach 0.95" },
  { label: "Service ceiling", unit: "ft", value: "50,000" },
  { label: "Range", unit: "nmi", value: "6,000" },
  { label: "Crew", value: "2" },
];

const visual = {
  alt: "Test airframe",
  credit: "Test",
  crop: { base: "50% 50%", lg: "50% 50%" },
  height: 1200,
  license: "Public domain",
  sourceUrl: "https://example.org/file",
  src: "/test.jpg",
  width: 800,
};

describe("VehicleProfileHero key figures", () => {
  // The featured figures measure wider than a quarter of the 46rem text
  // column, so four across overflowed the gap (B-2 at 1440). Every layout
  // sets them two by two: the featured pair on one row, the rest under it.
  it.each(["band", "split", "portrait", undefined] as const)(
    "sets the figures two by two in the %s layout",
    (photo) => {
      const html = renderToStaticMarkup(
        <VehicleProfileHero
          breadcrumbs={[{ label: "Aircraft" }]}
          classification="Strategic bomber"
          lead="Lead."
          name="B-2 Spirit"
          photo={photo}
          record={record}
          visual={photo ? visual : undefined}
        />,
      );
      const lists = html.match(/<dl[^>]*class="orbix-spec__list"[^>]*>/g);
      expect(lists).toHaveLength(1);
      expect(lists?.[0]).toContain('data-columns="2"');
      expect(html.match(/data-primary="true"/g)).toHaveLength(2);
    },
  );
});
