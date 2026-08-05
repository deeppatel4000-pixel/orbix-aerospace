import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MissionScenarioBuilder } from "./mission-scenario-builder";

describe("MissionScenarioBuilder", () => {
  it("renders the mission identity and systems planning interface", () => {
    const markup = renderToStaticMarkup(<MissionScenarioBuilder />);

    expect(markup).toContain('aria-label="Custom mission scenario"');
    expect(markup).toContain("Mission briefing");
    expect(markup).toContain("Mission name");
    expect(markup).toContain("Mission category");
    expect(markup).toContain("Mission description");
    expect(markup).toContain("Mission systems checklist");
    expect(markup).toContain("Orbital transfer");
    expect(markup).toContain("Plane change");
    expect(markup).toContain("Reentry analysis");
    expect(markup).toContain("Vehicle comparison");
  });

  it("renders orbital, vehicle, reentry, and TPS input panels", () => {
    const markup = renderToStaticMarkup(<MissionScenarioBuilder />);

    expect(markup).toContain("Orbital parameters");
    expect(markup).toContain("Initial altitude");
    expect(markup).toContain("Target altitude");
    expect(markup).toContain("Inclination change");
    expect(markup).toContain("Spacecraft configuration");
    expect(markup).toContain("Vehicle mass");
    expect(markup).toContain("Reference area");
    expect(markup).toContain("Drag coefficient");
    expect(markup).toContain("Reentry conditions");
    expect(markup).toContain("Thermal protection inputs");
    expect(markup).toContain("Nose radius");
    expect(markup).toContain("Heating coefficient");
  });

  it("provides keyboard controls, descriptions, and live status semantics", () => {
    const markup = renderToStaticMarkup(<MissionScenarioBuilder />);

    expect(markup).toContain("<form");
    expect(markup).toContain('type="checkbox"');
    expect(markup).toContain('aria-controls="mission-scenario-orbital-panel"');
    expect(markup).toContain(
      'aria-describedby="mission-scenario-missionName-hint"',
    );
    expect(markup).toContain('aria-invalid="false"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain("Analyze Mission");
    expect(markup).toContain("Reset scenario");
  });

  it("explains that engineering calculations remain in the existing analyzer", () => {
    const markup = renderToStaticMarkup(<MissionScenarioBuilder />);

    expect(markup).toContain(
      "This workstation creates the existing mission-profile input object.",
    );
    expect(markup).toContain(
      "Engineering calculations begin only inside the Mission Profile Analyzer",
    );
    expect(markup).not.toContain("Total delta-v");
    expect(markup).not.toContain("Recommended TPS");
  });
});
