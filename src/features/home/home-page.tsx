import { Hero } from "@/features/home/components/hero";
import { RegistrySplit } from "@/features/home/components/registry-split";
import { SiteSections } from "@/features/home/components/site-sections";
import { SourcingNote } from "@/features/home/components/sourcing-note";

/**
 * Homepage (design v3, spec 11, Home):
 *
 *   hero             H1, one-sentence lead and two actions on solid ground,
 *                    then the SR-71B photograph as a full-bleed band with
 *                    its catalogue caption
 *   registries       two open catalogue columns, aircraft and launch
 *                    vehicles: plate, caption, open table, registry link
 *   section index    a plain ruled list: Compare, Engineering Lab, Learn,
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
