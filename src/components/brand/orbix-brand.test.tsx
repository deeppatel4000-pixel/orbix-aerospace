import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  getOrbixEnvironmentLabel,
  OrbixBackground,
  OrbixEnvironmentBackdrop,
  OrbixMark,
} from ".";

const bannedDecoration =
  /plasma|violet|purple|indigo|fuchsia|drop-shadow|shadow-\[|orbix-starfield|orbix-grid|orbix-atmosphere-glow/i;

describe("ORBIX brand system", () => {
  it("renders an accessible primary mark when a title is supplied", () => {
    const markup = renderToStaticMarkup(
      <OrbixMark title="ORBIX orbital mark" />,
    );

    expect(markup).toContain('role="img"');
    expect(markup).toContain("ORBIX orbital mark");
    expect(markup).not.toMatch(bannedDecoration);
  });

  it("renders the deprecated background as an empty decorative element", () => {
    const markup = renderToStaticMarkup(<OrbixBackground />);

    expect(markup).toContain('aria-hidden="true"');
    expect(markup).not.toMatch(bannedDecoration);
    expect(markup).not.toContain("<svg");
  });

  it("no longer renders environment photographs of unknown origin", () => {
    const markup = renderToStaticMarkup(
      <OrbixEnvironmentBackdrop theme="tactical" />,
    );

    expect(markup).toContain('data-orbix-environment="tactical"');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).not.toContain("<img");
    expect(markup).not.toContain(".webp");
    expect(getOrbixEnvironmentLabel("laboratory")).toBe(
      "Aerospace research laboratory",
    );
  });
});
