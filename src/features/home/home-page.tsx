import { Hero } from "@/features/home/components/hero";
import { RegistrySplit } from "@/features/home/components/registry-split";
import { SiteSections } from "@/features/home/components/site-sections";
import { SourcingNote } from "@/features/home/components/sourcing-note";

/**
 * Homepage (design v2, spec 9, Home):
 *
 *   hero             full-bleed SR-71B photograph, wordmark, tagline H1,
 *                    lead, primary and tertiary actions, credit line
 *   registries       asymmetric split: large aircraft card, tall launch
 *                    vehicle card
 *   section index    01 to 06: Compare, Engineering Lab, Learn,
 *                    Verification, How I built ORBIX, Showcase
 *   sourcing         how vehicle values are sourced, and their limits
 */
export function HomePage() {
  return (
    <>
      <Hero />
      <RegistrySplit />
      <SiteSections />
      <SourcingNote />
    </>
  );
}
