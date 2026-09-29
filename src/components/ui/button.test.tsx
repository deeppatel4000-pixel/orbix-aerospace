import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";
import { buttonClass } from "@/components/ui/button-class";
import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { RegistrationMarks } from "@/components/ui/registration-marks";
import { Tag } from "@/components/ui/tag";

describe("buttonClass", () => {
  it("maps each variant to its own class", () => {
    for (const variant of [
      "primary",
      "secondary",
      "tertiary",
      "ghost",
      "link",
    ] as const) {
      expect(buttonClass({ variant })).toBe(
        `orbix-button orbix-button--${variant}`,
      );
    }
    expect(buttonClass({ className: "mt-4", size: "lg" })).toBe(
      "orbix-button orbix-button--primary orbix-button--lg mt-4",
    );
  });
});

describe("Button", () => {
  it("never submits a form by accident", () => {
    expect(renderToStaticMarkup(<Button>Calculate delta-v</Button>)).toContain(
      'type="button"',
    );
    expect(
      renderToStaticMarkup(<Button type="submit">Calculate</Button>),
    ).toContain('type="submit"');
  });

  it("adds a decorative 16px trailing arrow only when asked", () => {
    expect(renderToStaticMarkup(<Button>Run</Button>)).not.toContain("<svg");
    const markup = renderToStaticMarkup(<Button arrow="right">Run</Button>);
    expect(markup).toMatch(/Run<svg[^>]*aria-hidden="true"/);
    expect(markup).toContain('width="16"');
  });
});

describe("ButtonLink", () => {
  it("renders a link with the button classes and the arrow after the label", () => {
    const markup = renderToStaticMarkup(
      <ButtonLink arrow="external" href="/aircraft" variant="secondary">
        Aircraft
      </ButtonLink>,
    );
    expect(markup).toMatch(
      /^<a class="orbix-button orbix-button--secondary" href="\/aircraft">Aircraft<svg/,
    );
  });
});

describe("text-variant arrows", () => {
  it("keeps a tertiary arrow inline with the last word of the label", () => {
    const name = "LEO Satellite Deployment";
    const markup = renderToStaticMarkup(
      <ButtonLink arrow="right" href="/x" variant="tertiary">
        Open the {name} presentation view
      </ButtonLink>,
    );
    expect(markup).toContain('<span class="orbix-button__label">');
    expect(markup).toMatch(
      /presentation <span class="orbix-button__nowrap">view<svg/,
    );
    expect(markup.replace(/<[^>]+>/g, "")).toBe(
      "Open the LEO Satellite Deployment presentation view",
    );
  });

  it("leads the label with a back arrow joined to the first word", () => {
    const markup = renderToStaticMarkup(
      <ButtonLink arrow="back" href="/showcase" variant="tertiary">
        Back to Inside ORBIX
      </ButtonLink>,
    );
    expect(markup).toMatch(
      /<span class="orbix-button__nowrap"><svg[^>]*lucide-arrow-left[^>]*orbix-button__icon--lead[^>]*>.*<\/svg>Back<\/span> to Inside ORBIX/,
    );
  });

  it("puts a back arrow before the label on boxed variants too", () => {
    expect(
      renderToStaticMarkup(
        <Button arrow="back" variant="secondary">
          Back
        </Button>,
      ),
    ).toMatch(/<svg[^>]*>.*<\/svg>Back<\/button>/);
  });
});

describe("small primitives", () => {
  it("Eyebrow renders a paragraph by default and any allowed element on request", () => {
    expect(renderToStaticMarkup(<Eyebrow>Registry</Eyebrow>)).toBe(
      '<p class="orbix-eyebrow">Registry</p>',
    );
    expect(
      renderToStaticMarkup(<Eyebrow as="span">Page not found</Eyebrow>),
    ).toBe('<span class="orbix-eyebrow">Page not found</span>');
  });

  it("Tag is square-cornered text with an optional accent tone", () => {
    expect(renderToStaticMarkup(<Tag>LEO</Tag>)).toBe(
      '<span class="orbix-tag">LEO</span>',
    );
    expect(renderToStaticMarkup(<Tag tone="accent">LEO</Tag>)).toBe(
      '<span class="orbix-tag orbix-tag--accent">LEO</span>',
    );
  });

  it("RegistrationMarks draws four hidden corner ticks at the given inset", () => {
    expect(renderToStaticMarkup(<RegistrationMarks inset="1rem" />)).toBe(
      '<span aria-hidden="true" class="orbix-reg-marks" style="--reg-inset:1rem"><span></span><span></span><span></span><span></span></span>',
    );
  });
});
