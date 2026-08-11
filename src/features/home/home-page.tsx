import { AnalysisPreview } from "@/features/home/components/analysis-preview";
import { FinalCta } from "@/features/home/components/final-cta";
import { Hero } from "@/features/home/components/hero";
import { MissionPreview } from "@/features/home/components/mission-preview";
import { ResearchPreview } from "@/features/home/components/research-preview";
import { VehicleSystems } from "@/features/home/components/vehicle-systems";

/**
 * Homepage narrative:
 *
 *   hero              what ORBIX is
 *   vehicle systems   what you can explore   -> /aircraft, /rockets
 *   analysis          what you can analyse   -> /compare, /engineering-lab
 *   mission           what you can watch     -> Mission Control
 *   research          what you can learn     -> /learn
 *   final             where to go next       -> /rockets, /compare
 *
 * Each section has a different composition — full-bleed media, a card row,
 * two editorial columns, a split with a backdrop, an index, a quiet close —
 * so the page does not read as one repeated card grid.
 */
export function HomePage() {
  return (
    <>
      <Hero />
      <VehicleSystems />
      <AnalysisPreview />
      <MissionPreview />
      <ResearchPreview />
      <FinalCta />
    </>
  );
}
