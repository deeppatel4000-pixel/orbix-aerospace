import type { TPSMaterial } from "@/features/engineering-lab/types";

function assertNonEmpty(value: string, label: string): void {
  if (value.trim().length === 0) {
    throw new RangeError(`${label} must not be empty.`);
  }
}

function assertPositiveFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`Enter a finite number for ${label.toLowerCase()}.`);
  }

  if (value <= 0) {
    throw new RangeError(`${label} must be greater than zero.`);
  }
}

/**
 * Validates one reusable TPS material definition. Values are checked for
 * domain integrity only; this does not certify material suitability.
 */
export function validateTPSMaterial(material: TPSMaterial): void {
  assertNonEmpty(material.id, "Material ID");
  assertNonEmpty(material.name, "Material name");
  assertPositiveFinite(
    material.densityKilogramsPerCubicMetre,
    "Material density",
  );
  assertPositiveFinite(
    material.allowableHeatLoadMegajoulesPerSquareMetre,
    "Allowable heat load",
  );

  if (material.maximumTemperatureKelvin !== undefined) {
    assertPositiveFinite(
      material.maximumTemperatureKelvin,
      "Maximum temperature",
    );
  }
}

/**
 * Educational TPS catalog. Values are intentionally rounded, simplified
 * engineering estimates compatible with the current preliminary sizing model.
 * They are not specifications for certified flight hardware. Real TPS design
 * requires experimental data and must account for degradation, oxidation,
 * manufacturing constraints, and integration with the complete vehicle.
 */
const materialDefinitions = [
  {
    allowableHeatLoadMegajoulesPerSquareMetre: 30,
    densityKilogramsPerCubicMetre: 550,
    description:
      "Illustrative high-heat-tolerance sacrificial shield that consumes material while absorbing reentry energy.",
    id: "ablative-heat-shield",
    maximumTemperatureKelvin: 3_500,
    name: "Ablative Heat Shield",
    reusable: false,
  },
  {
    allowableHeatLoadMegajoulesPerSquareMetre: 18,
    densityKilogramsPerCubicMetre: 1_600,
    description:
      "Illustrative reusable carbon-carbon surface material for high-temperature leading-edge applications.",
    id: "reinforced-carbon-carbon",
    maximumTemperatureKelvin: 1_900,
    name: "Reinforced Carbon-Carbon",
    reusable: true,
  },
  {
    allowableHeatLoadMegajoulesPerSquareMetre: 8,
    densityKilogramsPerCubicMetre: 144,
    description:
      "Illustrative low-density reusable ceramic insulation tile for temperature-resistant external protection.",
    id: "ceramic-thermal-tile",
    maximumTemperatureKelvin: 1_500,
    name: "Ceramic Thermal Tile",
    reusable: true,
  },
] satisfies readonly TPSMaterial[];

for (const material of materialDefinitions) {
  validateTPSMaterial(material);
}

export const TPS_MATERIALS: readonly TPSMaterial[] = Object.freeze(
  materialDefinitions.map((material) => Object.freeze(material)),
);

const materialsById = new Map<string, TPSMaterial>();

for (const material of TPS_MATERIALS) {
  if (materialsById.has(material.id)) {
    throw new Error(`Duplicate TPS material ID: ${material.id}`);
  }

  materialsById.set(material.id, material);
}

export function getTPSMaterialById(id: string): TPSMaterial | undefined {
  return materialsById.get(id);
}

export function listTPSMaterials(): readonly TPSMaterial[] {
  return TPS_MATERIALS;
}
