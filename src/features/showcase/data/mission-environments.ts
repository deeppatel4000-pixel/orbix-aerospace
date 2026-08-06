import type { OrbixEnvironmentTheme } from "@/components/brand/orbix-environment";

const missionEnvironments: Readonly<Record<string, OrbixEnvironmentTheme>> = {
  "iss-style-resupply": "launch",
  "leo-satellite-deployment": "launch",
  "lunar-transfer-concept": "orbital",
  "mars-transfer-concept": "orbital",
  "reentry-demonstrator": "laboratory",
};

export function getShowcaseMissionEnvironment(
  missionId: string,
): OrbixEnvironmentTheme {
  return missionEnvironments[missionId] ?? "orbital";
}
