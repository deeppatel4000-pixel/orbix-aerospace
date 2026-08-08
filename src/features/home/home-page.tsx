import { FeaturedExperiences } from "@/features/home/components/featured-experiences";
import { FinalCta } from "@/features/home/components/final-cta";
import { Hero } from "@/features/home/components/hero";
import { MissionGalleryPreview } from "@/features/home/components/mission-gallery-preview";
import { PlatformHighlights } from "@/features/home/components/platform-highlights";
import { ShowcasePreview } from "@/features/home/components/showcase-preview";

export function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedExperiences />
      <PlatformHighlights />
      <MissionGalleryPreview />
      <ShowcasePreview />
      <FinalCta />
    </>
  );
}
