import {
  educationCategoryMeta,
  educationCategoryOrder,
  getRowEducation,
  type EducationCategoryId,
} from "@/features/compare/education";
import type { ComparisonResult, ComparisonRow } from "@/features/compare/types";

export interface ComparisonRowGroup {
  readonly categoryId: EducationCategoryId;
  readonly label: string;
  readonly rows: readonly ComparisonRow[];
  readonly summary: string;
}

/**
 * Groups the already-computed comparison rows by their educational category
 * for display. This is a purely presentational reordering: every row and
 * every cell value produced by the adapters passes through unchanged, only
 * the grouping and section order is derived here.
 */
export function groupComparisonRows(
  result: ComparisonResult,
): readonly ComparisonRowGroup[] {
  const rowsByCategory = new Map<EducationCategoryId, ComparisonRow[]>();

  for (const row of result.rows) {
    const education = getRowEducation(result.category, row.id);
    const categoryId = education?.categoryId ?? "capability";
    const bucket = rowsByCategory.get(categoryId);

    if (bucket) {
      bucket.push(row);
    } else {
      rowsByCategory.set(categoryId, [row]);
    }
  }

  return educationCategoryOrder
    .filter((categoryId) => rowsByCategory.has(categoryId))
    .map((categoryId) => ({
      categoryId,
      label: educationCategoryMeta[categoryId].label,
      rows: rowsByCategory.get(categoryId) ?? [],
      summary: educationCategoryMeta[categoryId].summary,
    }));
}
