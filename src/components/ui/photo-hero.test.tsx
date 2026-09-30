import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  licenceLabel,
  PhotoHero,
  type VisualRecord,
} from "@/components/ui/photo-hero";

const visual: VisualRecord = {
  alt: "NASA SR-71B Blackbird flying over the snow-covered Sierra Nevada mountains",
  credit: "NASA",
  license: "Public domain (U.S. government work)",
  licenseUrl: "https://commons.wikimedia.org/wiki/Template:PD-USGov-NASA",
  objectPosition: "50% 55%",
  sourceUrl:
    "https://commons.wikimedia.org/wiki/File:SR-71_Over_Snow_Capped_Mountains_-_GPN-2000-000162.jpg",
  src: "/images/aircraft/sr-71-blackbird.webp",
};

function render(props: Partial<Parameters<typeof PhotoHero>[0]> = {}) {
  return renderToStaticMarkup(
    <PhotoHero visual={visual} {...props}>
      <h1>SR-71 Blackbird</h1>
    </PhotoHero>,
  );
}

describe("PhotoHero", () => {
  it("renders the photo through next/image with its alt text and crop", () => {
    const markup = render();
    expect(markup).toContain(`alt="${visual.alt}"`);
    expect(markup).toContain(
      "/_next/image?url=%2Fimages%2Faircraft%2Fsr-71-blackbird.webp",
    );
    expect(markup).toContain("object-position:50% 55%");
  });

  it("loads the photo eagerly with full-bleed sizes by default", () => {
    const markup = render();
    expect(markup).not.toContain('loading="lazy"');
    expect(markup).toContain('sizes="100vw"');
  });

  it("can be told the photo is not the LCP image", () => {
    const markup = render({ priority: false, sizes: "50vw" });
    expect(markup).toContain('loading="lazy"');
    expect(markup).toContain('sizes="50vw"');
  });

  it("always shows the credit, the linked licence and the source", () => {
    const markup = render();
    expect(markup).toMatch(/<figcaption[^>]*>.*Photo: NASA/);
    expect(markup).toContain(`href="${visual.licenseUrl}"`);
    expect(markup).toContain(`href="${visual.sourceUrl}"`);
    expect(markup).toContain(">Source file</a>");
  });

  it("shortens a public-domain licence and keeps the full wording in the name", () => {
    const markup = render();
    expect(markup).toContain('aria-label="Public domain (US government work)"');
    expect(markup).toContain(">Public domain</a>");
    expect(markup).not.toContain("U.S.");
  });

  it("prints the licence as text when no licence page is known", () => {
    const markup = render({ visual: { ...visual, licenseUrl: undefined } });
    expect(markup).toContain(">Public domain (US government work)</span>");
  });

  it("shows other licences whole, without a redundant label", () => {
    expect(licenceLabel("CC BY-SA 4.0")).toEqual({
      full: "CC BY-SA 4.0",
      isShortened: false,
      short: "CC BY-SA 4.0",
    });
  });

  it("renders the aside slot only when given, and flags the layout", () => {
    expect(render()).not.toContain("orbix-photo-hero__aside");
    const markup = render({ aside: <div>Panel</div> });
    expect(markup).toContain('data-has-aside="true"');
    expect(markup).toContain(
      '<div class="orbix-photo-hero__aside"><div>Panel</div></div>',
    );
  });

  it("can override the route accent", () => {
    expect(render({ division: "aircraft" })).toContain(
      'data-division="aircraft"',
    );
    expect(render()).not.toContain("data-division");
  });

  it("puts the hero text in reading order after the figure", () => {
    const markup = render();
    expect(markup.indexOf("</figure>")).toBeLessThan(markup.indexOf("<h1>"));
    expect(markup).toContain('class="orbix-photo-hero__content orbix-rise"');
    expect(render({ entrance: false })).not.toContain("orbix-rise");
  });

  it("marks the framed photo with decorative registration marks", () => {
    const markup = render();
    expect(markup).toContain('class="orbix-reg-marks orbix-photo-hero__marks"');
    expect(markup).toMatch(/<span aria-hidden="true" class="orbix-reg-marks/);
  });

  it("marks the right-hand placement only when asked", () => {
    expect(render()).not.toContain("data-placement");
    expect(render({ placement: "right" })).toContain('data-placement="right"');
  });
});
