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

  it("loads the photo eagerly, sized for the split plate by default", () => {
    const markup = render();
    expect(markup).not.toContain('loading="lazy"');
    expect(markup).toContain('sizes="(min-width: 64rem) 50vw, 100vw"');
    expect(render({ layout: "band" })).toContain('sizes="100vw"');
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

  it("prints a catalogue caption with the figure number before the credit", () => {
    const markup = render({
      caption: "SR-71B over the Sierra Nevada",
      figureNumber: "1",
    });
    const text = markup
      .match(/<figcaption[^>]*>(.*)<\/figcaption>/)?.[1]
      ?.replace(/<[^>]+>/g, "");
    expect(text).toBe(
      "Fig. 1SR-71B over the Sierra Nevada. Photo: NASA. Public domain. Source file.",
    );
    expect(markup).toContain(
      '<span class="orbix-caption__number">Fig. 1</span>',
    );
  });

  it("names the subject from the alt text when no caption is given", () => {
    const text = render()
      .match(/<figcaption[^>]*>(.*)<\/figcaption>/)?.[1]
      ?.replace(/<[^>]+>/g, "");
    expect(text).toBe(
      `${visual.alt}. Photo: NASA. Public domain. Source file.`,
    );
  });

  it("does not print 'Photo:' before a credit that already says photo", () => {
    const text = render({
      caption: "F-15C Eagle",
      visual: { ...visual, credit: "U.S. Air Force photo by Master Sgt. A" },
    })
      .match(/<figcaption[^>]*>(.*)<\/figcaption>/)?.[1]
      ?.replace(/<[^>]+>/g, "");
    expect(text).toBe(
      "F-15C Eagle. US Air Force photo by Master Sgt. A. Public domain. Source file.",
    );
  });

  it("shortens a public-domain licence and keeps the full wording in the name", () => {
    const markup = render();
    expect(markup).toContain('aria-label="Public domain (US government work)"');
    expect(markup).toContain(">Public domain</a>");
    expect(markup).not.toContain("U.S.");
  });

  it("prints the licence as text when no licence page is known", () => {
    const markup = render({ visual: { ...visual, licenseUrl: undefined } });
    expect(markup).toContain("<span>Public domain (US government work)</span>");
  });

  it("shows other licences whole, without a redundant label", () => {
    expect(licenceLabel("CC BY-SA 4.0")).toEqual({
      full: "CC BY-SA 4.0",
      isShortened: false,
      short: "CC BY-SA 4.0",
    });
  });

  it("sets the aside under the hero text, only when given", () => {
    expect(render()).not.toContain("orbix-photo-hero__facts");
    const markup = render({ aside: <div>Figures</div> });
    expect(markup).toContain(
      '<div class="orbix-photo-hero__facts"><div>Figures</div></div>',
    );
    expect(markup.indexOf("__facts")).toBeLessThan(markup.indexOf("<figure"));
  });

  it("can override the route accent", () => {
    expect(render({ division: "aircraft" })).toContain(
      'data-division="aircraft"',
    );
    expect(render()).not.toContain("data-division");
  });

  it("puts the heading before the photograph and never animates it", () => {
    const markup = render({ entrance: true });
    expect(markup.indexOf("<h1>")).toBeLessThan(markup.indexOf("<figure"));
    expect(markup).not.toContain("orbix-rise");
  });

  it("draws no scrim, mask or registration marks", () => {
    const markup = render();
    expect(markup).not.toMatch(/scrim|reg-marks|marks/);
  });

  it("maps the v2 right placement to a portrait plate", () => {
    expect(render()).toContain('data-plate="landscape"');
    expect(render({ placement: "right" })).toContain('data-plate="portrait"');
    expect(render({ plate: "portrait" })).toContain('data-plate="portrait"');
    expect(render()).toContain('data-layout="split"');
    expect(render({ layout: "band" })).toContain('data-layout="band"');
  });
});
