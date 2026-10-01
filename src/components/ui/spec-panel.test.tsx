import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RecordRow } from "@/components/ui/record-row";
import { SpecPanel } from "@/components/ui/spec-panel";

describe("SpecPanel", () => {
  const items = [
    { label: "Maximum speed", primary: true, value: "Mach 2.25" },
    {
      label: "Service ceiling",
      secondary: "15,240 m",
      unit: "ft",
      value: "50,000",
    },
  ] as const;

  it("pairs every label with its value in an open definition list", () => {
    const markup = renderToStaticMarkup(<SpecPanel items={items} />);
    expect(markup).toContain('<dl class="orbix-spec__list">');
    expect(markup).toMatch(
      /<dt>Maximum speed<\/dt><dd class="orbix-spec__value">Mach 2<span class="orbix-num-sep">.<\/span>25<\/dd>/,
    );
    expect(markup).not.toMatch(/orbix-spec-(panel|grid|cell)/);
  });

  it("marks primary figures so they can be set larger", () => {
    const markup = renderToStaticMarkup(<SpecPanel items={items} />);
    expect(markup).toContain(
      '<div class="orbix-spec__item" data-primary="true"><dt>Maximum speed',
    );
    expect(markup).toContain('<div class="orbix-spec__item"><dt>Service');
  });

  it("shows the unit and the second unit system", () => {
    const markup = renderToStaticMarkup(<SpecPanel items={items} />);
    expect(markup).toContain(
      '50<span class="orbix-num-sep">,</span>000<span class="orbix-spec__unit">ft</span>',
    );
    expect(markup).toContain(
      '<dd class="orbix-spec__secondary">15<span class="orbix-num-sep">,</span>240 m</dd>',
    );
  });

  it("sets a name in sans and a figure in mono (spec 5)", () => {
    const markup = renderToStaticMarkup(
      <SpecPanel
        items={[
          { label: "Vehicle", value: "Saturn V" },
          { label: "Height", unit: "m", value: "110.6" },
          { label: "Status", kind: "figure", value: "n/a" },
        ]}
      />,
    );
    expect(markup).toContain(
      '<dd class="orbix-spec__value" data-kind="text">Saturn V</dd>',
    );
    expect(markup).toContain('<dd class="orbix-spec__value">110');
    expect(markup).toContain('<dd class="orbix-spec__value">n/a</dd>');

    const row = renderToStaticMarkup(
      <RecordRow
        items={[
          { label: "Aircraft", value: "F-22 Raptor" },
          { label: "Top speed", value: "Mach 2.25" },
        ]}
      />,
    );
    expect(row).toContain('<dd data-kind="text">F-22 Raptor</dd>');
    expect(row).toContain("<dd>Mach 2");
  });

  it("renders the head only when there is something to put in it", () => {
    expect(renderToStaticMarkup(<SpecPanel items={items} />)).not.toContain(
      "orbix-spec__head",
    );

    const markup = renderToStaticMarkup(
      <SpecPanel
        columns={3}
        description="Air superiority fighter"
        items={items}
        kicker="Featured aircraft"
        title="F-22 Raptor"
        titleAs="h3"
      />,
    );
    expect(markup).toContain(
      '<p class="orbix-spec__kicker">Featured aircraft</p>',
    );
    expect(markup).toContain('<h3 class="orbix-spec__title">F-22 Raptor</h3>');
    expect(markup).toContain('data-columns="3"');
  });

  it("defaults the title to an h2 and passes section attributes through", () => {
    const markup = renderToStaticMarkup(
      <SpecPanel aria-label="Featured" items={items} title="F-22 Raptor" />,
    );
    expect(markup).toContain(
      '<section class="orbix-spec" aria-label="Featured">',
    );
    expect(markup).toContain('<h2 class="orbix-spec__title">');
  });

  it("renders the footnote under the figures", () => {
    const markup = renderToStaticMarkup(
      <SpecPanel footnote="Published figures." items={items} />,
    );
    expect(markup).toMatch(
      /<\/dl><div class="orbix-spec__note">Published figures.<\/div>/,
    );
  });
});

describe("RecordRow", () => {
  it("renders each figure as a label and a value with an optional unit", () => {
    const markup = renderToStaticMarkup(
      <RecordRow
        items={[
          { label: "Maximum speed", value: "Mach 3" },
          { label: "Range", secondary: "4,667 km", unit: "mi", value: "2,900" },
        ]}
      />,
    );
    expect(markup).toContain("<dt>Maximum speed</dt><dd>Mach 3</dd>");
    expect(markup).toContain(
      '<dd>2<span class="orbix-num-sep">,</span>900<span class="orbix-record-row__unit">mi</span></dd>',
    );
    expect(markup).toContain(
      '<dd class="orbix-record-row__secondary">4<span class="orbix-num-sep">,</span>667 km</dd>',
    );
    expect(markup.match(/orbix-record-row__item/g)).toHaveLength(2);
  });

  it("takes a column count", () => {
    const markup = renderToStaticMarkup(
      <RecordRow columns={4} items={[{ label: "Range", value: "1" }]} />,
    );
    expect(markup).toContain(
      '<dl class="orbix-record-row__list" data-columns="4">',
    );
  });
});
