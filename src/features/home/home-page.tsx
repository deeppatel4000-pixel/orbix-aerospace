import { Authorship } from "@/features/home/components/authorship";
import { FeaturedTools } from "@/features/home/components/featured-tools";
import { Hero } from "@/features/home/components/hero";
import { ProofLine } from "@/features/home/components/proof-line";
import { VehiclesPlate } from "@/features/home/components/vehicles-plate";

/**
 * Homepage (v4 plan section 4; budget 250 visible words, about 2,500 px at
 * 1440):
 *
 *   hero        thesis, author and grade, authorship byline, two actions;
 *               the compact Transfer Explorer beside them
 *   proof       the verification score and one sample row, computed
 *   tools       three Engineering Lab tools with their equations
 *   vehicles    one photo plate, one sentence, registry and compare links
 *   authorship  three sentences, build log and GitHub links
 *
 * Sections are separated by one 1px rule each (design v3 section 6).
 */
export function HomePage() {
  return (
    <>
      <Hero />
      <ProofLine />
      <FeaturedTools />
      <VehiclesPlate />
      <Authorship />
    </>
  );
}
