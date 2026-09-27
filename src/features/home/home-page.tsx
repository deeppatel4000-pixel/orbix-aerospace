import { FeaturedRecords } from "@/features/home/components/featured-records";
import { Hero } from "@/features/home/components/hero";
import { SiteSections } from "@/features/home/components/site-sections";
import { SourcingNote } from "@/features/home/components/sourcing-note";

/**
 * Homepage (spec 14, Home):
 *
 *   intro              what ORBIX is, two destinations, one credited photo
 *   what is here       plain list of every section of the site
 *   featured records   three record cards from the registries
 *   sourcing           how vehicle values are sourced, and their limits
 */
export function HomePage() {
  return (
    <>
      <Hero />
      <div className="flex flex-col gap-12 py-12 sm:gap-16 sm:py-16">
        <SiteSections />
        <FeaturedRecords />
        <SourcingNote />
      </div>
    </>
  );
}
