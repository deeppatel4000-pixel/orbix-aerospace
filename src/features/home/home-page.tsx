import { EngineeringModules } from "@/features/home/components/engineering-modules";
import { FeaturedVehicles } from "@/features/home/components/featured-vehicles";
import { Hero } from "@/features/home/components/hero";
import { ProjectPhilosophy } from "@/features/home/components/project-philosophy";

export function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedVehicles />
      <EngineeringModules />
      <ProjectPhilosophy />
    </>
  );
}
