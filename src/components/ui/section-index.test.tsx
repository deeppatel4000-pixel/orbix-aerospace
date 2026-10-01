import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { formatIndexNumber, SectionIndex } from "@/components/ui/section-index";

describe("formatIndexNumber", () => {
  it("pads to two digits", () => {
    expect(formatIndexNumber(1)).toBe("01");
    expect(formatIndexNumber(6)).toBe("06");
    expect(formatIndexNumber(12)).toBe("12");
  });
});

describe("SectionIndex", () => {
  const items = [
    {
      description: "Two vehicles side by side.",
      href: "/compare",
      title: "Compare",
    },
    {
      href: "/engineering-lab",
      meta: "33 calculators",
      title: "Engineering Lab",
    },
    { title: "Sourcing" },
  ] as const;

  it("is a plain list with no row numbers (spec 3.7)", () => {
    const markup = renderToStaticMarkup(<SectionIndex items={items} />);
    expect(markup).toMatch(/^<ul class="orbix-section-index">/);
    expect(markup).not.toContain("orbix-section-index__number");
    expect(markup).not.toMatch(/>0\d</);
  });

  it("links the title when a row has a destination, and only then", () => {
    const markup = renderToStaticMarkup(<SectionIndex items={items} />);
    expect(markup).toContain(
      '<h3 class="orbix-section-index__title"><a href="/compare">Compare</a></h3>',
    );
    expect(markup).toContain(
      '<h3 class="orbix-section-index__title">Sourcing</h3>',
    );
    expect(markup.match(/<a /g)).toHaveLength(2);
  });

  it("renders description and meta when given", () => {
    const markup = renderToStaticMarkup(<SectionIndex items={items} />);
    expect(markup).toContain(
      '<p class="orbix-section-index__description">Two vehicles side by side.</p>',
    );
    expect(markup).toContain(
      '<p class="orbix-section-index__meta">33 calculators</p>',
    );
  });

  it("ignores the retired start prop and uses the requested heading level", () => {
    const markup = renderToStaticMarkup(
      <SectionIndex headingAs="h2" items={items} start={4} />,
    );
    expect(markup).toMatch(/^<ul class="orbix-section-index">/);
    expect(markup).not.toContain("start=");
    expect(markup).toContain('<h2 class="orbix-section-index__title">');
  });
});
