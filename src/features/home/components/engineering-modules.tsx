import { MapPinned, Plane, Rocket, Wind } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ModuleCard } from "@/features/home/components/module-card";
import { SectionHeading } from "@/features/home/components/section-heading";

const engineeringModules = [
  {
    code: "MOD-01",
    description:
      "Inspect aircraft through airframe, propulsion, performance, and mission-system perspectives.",
    href: "/aircraft",
    icon: Plane,
    title: "Aircraft Explorer",
  },
  {
    code: "MOD-02",
    description:
      "Break launch vehicles into stages, propulsion systems, payload constraints, and flight profiles.",
    href: "/rockets",
    icon: Rocket,
    title: "Rocket Lab",
  },
  {
    code: "MOD-03",
    description:
      "Connect lift, drag, pressure, velocity, and geometry through transparent engineering methods.",
    href: "/engineering-lab",
    icon: Wind,
    title: "Aerodynamics",
  },
  {
    code: "MOD-04",
    description:
      "Explore how objectives, constraints, environments, and vehicle capability shape a mission.",
    href: "/engineering-lab",
    icon: MapPinned,
    title: "Mission Planner",
  },
] as const;

export function EngineeringModules() {
  return (
    <section
      aria-labelledby="engineering-modules-title"
      className="orbix-section orbix-brand-glow scroll-mt-24 border-y border-border/70 bg-surface/25"
      id="engineering-modules"
    >
      <Container>
        <SectionHeading
          description="Purpose-built workspaces connect vehicle exploration to tested physics, mission analysis, and systems thinking."
          eyebrow="Engineering workstations"
          title="Engineering modules"
          titleId="engineering-modules-title"
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {engineeringModules.map((module) => (
            <ModuleCard key={module.title} {...module} />
          ))}
        </div>
      </Container>
    </section>
  );
}
