import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { MissionScenario } from "@/features/engineering-lab/missions";

import {
  ScenarioLibrary,
  ScenarioLibraryIntegration,
} from "./scenario-library";

const scenario: MissionScenario = {
  category: "orbital-deployment",
  createdAt: "2026-08-04T12:00:00.000Z",
  description: "An accessible saved scenario fixture.",
  id: "saved-scenario",
  name: "Saved Deployment Scenario",
  profile: {
    deltaVBudget: {
      hohmannTransfer: {
        finalAltitudeMetres: 550_000,
        initialAltitudeMetres: 200_000,
      },
      missionName: "Saved Deployment Scenario",
    },
    missionName: "Saved Deployment Scenario",
  },
  updatedAt: "2026-08-04T12:30:00.000Z",
};

function renderLibrary(initialScenarios: readonly MissionScenario[]) {
  return renderToStaticMarkup(
    <ScenarioLibraryIntegration initialScenarios={initialScenarios}>
      <ScenarioLibrary />
    </ScenarioLibraryIntegration>,
  );
}

describe("ScenarioLibrary", () => {
  it("renders saved scenario metadata and included systems", () => {
    const markup = renderLibrary([scenario]);

    expect(markup).toContain("Saved educational scenarios");
    expect(markup).toContain("Saved Deployment Scenario");
    expect(markup).toContain("An accessible saved scenario fixture.");
    expect(markup).toContain("Orbital Deployment");
    expect(markup).toContain("Delta-v budget");
    expect(markup).toContain("Created");
    expect(markup).toContain("Updated");
  });

  it("renders load, duplicate, and delete actions", () => {
    const markup = renderLibrary([scenario]);

    expect(markup).toContain('aria-label="Load Saved Deployment Scenario"');
    expect(markup).toContain(">Load<");
    expect(markup).toContain(
      'aria-label="Duplicate Saved Deployment Scenario"',
    );
    expect(markup).toContain(">Duplicate<");
    expect(markup).toContain('aria-label="Delete Saved Deployment Scenario"');
    expect(markup).toContain(">Delete<");
  });

  it("renders a clear empty state", () => {
    const markup = renderLibrary([]);

    expect(markup).toContain("No saved mission scenarios");
    expect(markup).toContain("Configure and analyze a mission in Module 28");
  });

  it("provides accessible library and live-announcement semantics", () => {
    const markup = renderLibrary([scenario]);

    expect(markup).toContain('aria-label="Saved mission scenarios"');
    expect(markup).toContain('role="list"');
    expect(markup).toContain('role="listitem"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain("Save Current Mission");
    expect(markup).toContain('disabled=""');
  });
});
