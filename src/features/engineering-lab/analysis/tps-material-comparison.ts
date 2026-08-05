import { listTPSMaterials } from "@/features/engineering-lab/materials";
import type {
  MaterialTPSSizingAnalysis,
  MaterialTPSSizingInputs,
  TPSMaterialComparisonAnalysis,
  TPSMaterialComparisonInputs,
  TPSMaterialComparisonResult,
} from "@/features/engineering-lab/types";

import { analyzeMaterialTPSSizing } from "./material-tps-sizing";

const RANKING_DESCRIPTION =
  "Educational ordinal score: thermal-margin rank has first priority, lower TPS mass has second priority, and lower thickness has third priority.";

function rankAscending(value: number, values: readonly number[]): number {
  const rankedValues = Array.from(new Set(values)).sort(
    (first, second) => first - second,
  );

  return rankedValues.indexOf(value);
}

function toMaterialInputs(
  scenarioInputs: Omit<TPSMaterialComparisonInputs, "materialIds">,
  materialId: string,
): MaterialTPSSizingInputs {
  return {
    ...scenarioInputs,
    materialId,
  };
}

function rankResults(
  analyses: readonly MaterialTPSSizingAnalysis[],
): TPSMaterialComparisonResult[] {
  const thermalMargins = analyses.map(
    (analysis) => analysis.tpsSizing.safetyMargin.marginPercentage,
  );
  const masses = analyses.map(
    (analysis) => analysis.estimatedTPSMassForArea.totalTPSMassKilograms,
  );
  const thicknesses = analyses.map(
    (analysis) => analysis.tpsSizing.estimatedThickness.millimetres,
  );
  const priorityBase = analyses.length + 1;

  return analyses
    .map((analysis) => {
      const thermalMarginRank = rankAscending(
        analysis.tpsSizing.safetyMargin.marginPercentage,
        thermalMargins,
      );
      const massRank = rankAscending(
        analysis.estimatedTPSMassForArea.totalTPSMassKilograms,
        masses,
      );
      const thicknessRank = rankAscending(
        analysis.tpsSizing.estimatedThickness.millimetres,
        thicknesses,
      );
      const thermalMarginContribution =
        thermalMarginRank * priorityBase * priorityBase;
      const massPenalty = massRank * priorityBase;
      const thicknessPenalty = thicknessRank;

      return {
        estimatedTPSMass: analysis.estimatedTPSMassForArea,
        heatLoadMargin: analysis.tpsSizing.safetyMargin,
        marginClassification: analysis.suitabilitySummary,
        material: analysis.material,
        rankingLogic: {
          description: RANKING_DESCRIPTION,
          massPenalty,
          massRank,
          thermalMarginContribution,
          thermalMarginRank,
          thicknessPenalty,
          thicknessRank,
        },
        rankingScore:
          thermalMarginContribution - massPenalty - thicknessPenalty,
        thickness: analysis.tpsSizing.estimatedThickness,
        tpsSizing: analysis.tpsSizing,
      };
    })
    .sort((first, second) => second.rankingScore - first.rankingScore);
}

/**
 * Compares catalog materials against one shared reentry scenario by delegating
 * each case to the existing material-aware TPS analysis. The ordinal ranking
 * is educational only and is not spacecraft design optimization. Catalog
 * values are simplified estimates, and this comparison excludes manufacturing
 * constraints, structural integration, cost, lifecycle degradation, and the
 * qualification testing required for real thermal-protection systems.
 */
export function analyzeTPSMaterialComparison(
  inputs: TPSMaterialComparisonInputs,
): TPSMaterialComparisonAnalysis {
  const { materialIds, ...scenarioInputs } = inputs;
  const resolvedMaterialIds =
    materialIds ?? listTPSMaterials().map((material) => material.id);

  if (resolvedMaterialIds.length === 0) {
    throw new RangeError(
      "TPS material comparison requires at least one material.",
    );
  }

  const analyses = resolvedMaterialIds.map((materialId) =>
    analyzeMaterialTPSSizing(toMaterialInputs(scenarioInputs, materialId)),
  );
  const results = rankResults(analyses);
  const recommendedMaterial = results[0];

  if (!recommendedMaterial) {
    throw new Error("TPS material comparison did not produce a result.");
  }

  return {
    materialsCompared: results.length,
    recommendedMaterial,
    results,
  };
}
