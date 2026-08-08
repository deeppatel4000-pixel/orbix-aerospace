import { Command, FlaskConical, Orbit } from "lucide-react";

import { OrbixBackground } from "@/components/brand/orbix-background";
import { OrbixEnvironmentBackdrop } from "@/components/brand/orbix-environment";
import { OrbixMark } from "@/components/brand/orbix-mark";
import { OrbixWordmark } from "@/components/brand/orbix-wordmark";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";

const disciplines = [
  ["01", "Orbital mechanics"],
  ["02", "Mission systems"],
  ["03", "Atmospheric entry"],
  ["04", "Thermal protection"],
] as const;

export function Hero() {
  return (
    <section className="orbix-brand-glow relative isolate overflow-hidden border-b border-accent/18 bg-background">
      <OrbixEnvironmentBackdrop theme="orbital" />
      <OrbixBackground className="-z-10 opacity-55" />

      <Container className="grid min-h-[calc(100svh-5.5rem)] items-center gap-14 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.14fr)_minmax(22rem,0.62fr)] lg:gap-20 lg:py-24 xl:gap-28">
        <div className="relative max-w-4xl">
          <div className="orbix-kicker flex items-center gap-3 border-l-2 border-accent pl-3">
            <Orbit aria-hidden="true" size={15} strokeWidth={1.6} />
            Mission design // Engineering analysis // Technical review
          </div>

          <div className="mt-7 flex items-end gap-4">
            <h1 aria-label="ORBIX" className="w-full max-w-[39rem]">
              <OrbixWordmark
                className="w-full"
                priority
                sizes="(max-width: 640px) calc(100vw - 2.5rem), 624px"
              />
            </h1>
            <span
              className="mb-1 hidden h-2 w-2 rounded-full bg-telemetry shadow-[0_0_16px_var(--telemetry-green)] sm:block"
              aria-hidden="true"
            />
          </div>

          <p className="font-display mt-5 max-w-3xl text-2xl leading-[1.08] font-medium tracking-[-0.03em] text-foreground sm:text-3xl lg:text-[2.75rem]">
            Design the mission. Trace the engineering.
          </p>

          <p className="mt-7 max-w-[40rem] text-base leading-8 text-muted sm:text-lg">
            <span className="font-medium text-foreground">ORBIX</span> is an
            educational aerospace engineering platform connecting orbital
            mechanics, vehicle analysis, atmospheric reentry, thermal
            protection, and mission visualization in one traceable workflow.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              className="w-full sm:w-auto"
              href="/engineering-lab#mission-control-dashboard"
            >
              <Command aria-hidden="true" size={17} />
              Enter Mission Control
            </ButtonLink>
            <ButtonLink
              className="w-full sm:w-auto"
              href="/engineering-lab"
              variant="secondary"
            >
              <FlaskConical aria-hidden="true" size={17} />
              Open Engineering Lab
            </ButtonLink>
          </div>

          <ol
            aria-label="ORBIX engineering disciplines"
            className="mt-12 grid max-w-[40rem] grid-cols-2 gap-px overflow-hidden border-y border-border/75 bg-border/70 sm:grid-cols-4"
          >
            {disciplines.map(([code, label]) => (
              <li className="bg-background/86 px-4 py-3.5" key={code}>
                <span className="font-mono text-[0.58rem] tracking-[0.14em] text-accent">
                  {code}
                </span>
                <p className="mt-1.5 text-xs leading-5 text-muted">{label}</p>
              </li>
            ))}
          </ol>
        </div>

        <aside
          aria-label="ORBIX integrated engineering domains"
          className="orbix-frame relative mx-auto w-full max-w-[27rem] overflow-hidden border-accent/22 bg-background/72 p-1 shadow-[0_30px_90px_rgb(0_0_0/0.42)] backdrop-blur-xl lg:mx-0 lg:justify-self-end"
        >
          <div className="technical-grid relative min-h-[29rem] overflow-hidden border border-border/70 bg-surface/68 p-5 sm:min-h-[33rem] sm:p-7">
            <div className="flex items-start justify-between gap-5 border-b border-border/80 pb-4">
              <div>
                <p className="orbix-kicker">Traceable systems core</p>
                <p className="mt-1.5 text-sm font-medium text-foreground">
                  ORBIX // Educational engineering platform
                </p>
              </div>
              <span className="inline-flex items-center gap-2 font-mono text-[0.56rem] tracking-[0.14em] text-telemetry uppercase">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-telemetry shadow-[0_0_12px_var(--telemetry-green)]"
                />
                Educational platform
              </span>
            </div>

            <div className="relative flex min-h-64 items-center justify-center">
              <div
                aria-hidden="true"
                className="absolute h-56 w-56 rounded-full border border-accent/20"
              />
              <div
                aria-hidden="true"
                className="absolute h-36 w-72 -rotate-12 rounded-[50%] border border-dashed border-plasma/25"
              />
              <div
                aria-hidden="true"
                className="absolute h-64 w-36 rotate-[28deg] rounded-[50%] border border-accent/14"
              />
              <OrbixMark
                className="relative h-28 w-28 drop-shadow-[0_0_38px_rgb(108_230_255/0.22)] sm:h-32 sm:w-32"
                sizes="128px"
              />
            </div>

            <dl className="grid gap-px border border-accent/28 bg-accent/22 sm:grid-cols-2">
              {disciplines.map(([code, label]) => (
                <div className="bg-background/96 px-3.5 py-3" key={code}>
                  <dt className="font-mono text-[0.58rem] tracking-[0.14em] text-accent uppercase">
                    SYS-{code}
                  </dt>
                  <dd className="mt-1 text-xs leading-5 text-foreground">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </Container>

      <div className="border-t border-border/70 bg-surface/45">
        <Container className="flex flex-col gap-2 py-3 font-mono text-[0.6rem] tracking-[0.14em] text-muted uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>ORBIX platform // Educational models and workflows</span>
          <span className="inline-flex items-center gap-2 text-telemetry">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-telemetry"
            />
            Systems catalog
          </span>
        </Container>
      </div>
    </section>
  );
}
