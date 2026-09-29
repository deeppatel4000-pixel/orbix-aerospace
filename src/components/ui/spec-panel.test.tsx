import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RecordRow } from "@/components/ui/record-row";
import { SpecPanel } from "@/components/ui/spec-panel";

describe("SpecPanel", () => {
  const items = [
    { label: "Maximum speed", value: "Mach 2.25" },
    {
      label: "Service ceiling",
      secondary: "15,240 m",
      unit: "ft",
      value: "50,000",
    },
  ] as const;

  it("pairs every label with its value in a definition list", () => {
    const markup = renderToStaticMarkup(<SpecPanel items={items} />);
    expect(markup).toContain('<dl class="orbix-spec-grid" data-columns="2">');
    expect(markup).toMatch(
      /<dt>Maximum speed<\/dt><dd class="orbix-spec-cell__value">Mach 2<span class="orbix-num-sep">.<\/span>25<\/dd>/,
    );
  });

  it("shows the unit and the second unit system", () => {
    const markup = renderToStaticMarkup(<SpecPanel items={items} />);
    expect(markup).toContain(
      '50<span class="orbix-num-sep">,</span>000<span class="orbix-spec-cell__unit">ft</span>',
    );
    expect(markup).toContain(
      '<dd class="orbix-spec-cell__secondary">15<span class="orbix-num-sep">,</span>240 m</dd>',
    );
  });

  it("renders the head only when there is something to put in it", () => {
    expect(renderToStaticMarkup(<SpecPanel items={items} />)).not.toContain(
      "orbix-spec-panel__head",
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
      '<p class="orbix-spec-panel__kicker">Featured aircraft</p>',
    );
    expect(markup).toContain(
      '<h3 class="orbix-spec-panel__title">F-22 Raptor</h3>',
    );
    expect(markup).toContain('data-columns="3"');
  });

  it("defaults the title to an h2 and passes section attributes through", () => {
    const markup = renderToStaticMarkup(
      <SpecPanel aria-label="Featured" items={items} title="F-22 Raptor" />,
    );
    expect(markup).toContain(
      '<section class="orbix-spec-panel" aria-label="Featured">',
    );
    expect(markup).toContain('<h2 class="orbix-spec-panel__title">');
  });

  it("renders the footnote under the grid", () => {
    const markup = renderToStaticMarkup(
      <SpecPanel footnote="Published figures." items={items} />,
    );
    expect(markup).toMatch(
      /<\/dl><div class="orbix-spec-panel__foot">Published figures.<\/div>/,
    );
  });
});

describe("RecordRow", () => {
  it("renders each figure as a label and a value with an optional unit", () => {
    const markup = renderToStaticMarkup(
      <RecordRow
        items={[
          { label: "Maximum speed", value: "Mach 3" },
          { label: "Range", unit: "mi", value: "2,900" },
        ]}
      />,
    );
    expect(markup).toContain("<dt>Maximum speed</dt><dd>Mach 3</dd>");
    expect(markup).toContain(
      '<dd>2<span class="orbix-num-sep">,</span>900<span class="orbix-record-row__unit">mi</span></dd>',
    );
    expect(markup.match(/orbix-record-row__item/g)).toHaveLength(2);
  });
});
