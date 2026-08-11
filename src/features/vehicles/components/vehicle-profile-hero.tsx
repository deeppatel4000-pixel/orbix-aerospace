import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { cn } from "@/lib/cn";

/**
 * The shared vehicle profile hero.
 *
 * ## Two media layouts, one system
 *
 * Aircraft and launch vehicles have opposite geometry, so forcing both into
 * one frame guarantees one of them is cropped badly:
 *
 *   backdrop  Full-bleed media behind the content. Suits aircraft, which are
 *             photographed wide across the frame — the B-2's wingspan and the
 *             SR-71's extreme horizontal profile both need the full width.
 *
 *   column    Content beside a tall media column. Suits launch vehicles,
 *             which are vertical subjects; a backdrop crop would slice
 *             Saturn V and Starship through the middle, which is exactly the
 *             failure the discovery phase fixed on the index cards.
 *
 * Everything else — typography, division accent, breadcrumb, the technical
 * record — is shared, so a profile reads as the same product either way.
 *
 * ## Media is passed in, not constructed here
 *
 * `AircraftImage` and `RocketImage` have around seven consumers each spanning
 * profiles, related-vehicle strips, visual panels and the homepage. This
 * component never imports them; the caller supplies an already-configured
 * element. Nothing outside the profile heroes changes behaviour.
 */
export interface ProfileHeroCrumb {
  readonly href?: string;
  readonly label: string;
}

export interface ProfileHeroRecordItem {
  /** Formatted, already-qualified value. Never fabricated or defaulted. */
  readonly value: string;
  readonly label: string;
}

interface VehicleProfileHeroProps {
  breadcrumbs: readonly ProfileHeroCrumb[];
  classification: string;
  description: string;
  mediaLayout: "backdrop" | "column";
  media: ReactNode;
  name: string;
  record: readonly ProfileHeroRecordItem[];
}

export function VehicleProfileHero({
  breadcrumbs,
  classification,
  description,
  media,
  mediaLayout,
  name,
  record,
}: VehicleProfileHeroProps) {
  const isBackdrop = mediaLayout === "backdrop";

  return (
    <header className="orbix-profile-hero isolate overflow-hidden">
      {isBackdrop ? (
        <>
          {media}
          {/* One scrim, reading left-to-dark so the text column stays legible
              while the subject keeps the right of the frame. Replaces two
              stacked multi-stop gradients plus a `technical-grid` overlay in
              mix-blend-screen. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--orbix-bg-page)_0%,color-mix(in_srgb,var(--orbix-bg-page)_82%,transparent)_48%,transparent_100%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-background to-transparent"
          />
        </>
      ) : null}

      <Container
        className={cn(
          "relative py-10 lg:py-14",
          isBackdrop && "flex min-h-[62svh] flex-col justify-between",
        )}
      >
        <nav aria-label="Breadcrumb">
          <ol className="orbix-breadcrumbs">
            {breadcrumbs.map((crumb, index) => {
              const isCurrent = index === breadcrumbs.length - 1;

              return (
                <li className="contents" key={crumb.label}>
                  {index > 0 ? (
                    <span
                      aria-hidden="true"
                      className="orbix-breadcrumbs-separator"
                    >
                      /
                    </span>
                  ) : null}
                  {crumb.href && !isCurrent ? (
                    <Link href={crumb.href}>{crumb.label}</Link>
                  ) : (
                    <span aria-current={isCurrent ? "page" : undefined}>
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div
          className={cn(
            isBackdrop
              ? "mt-16 max-w-3xl"
              : "mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center lg:gap-16",
          )}
        >
          <div className={cn(!isBackdrop && "max-w-2xl")}>
            <p className="orbix-profile-hero__classification">
              {classification}
            </p>
            <h1 className="orbix-profile-hero__name">{name}</h1>
            <p className="text-muted-strong mt-5 text-base leading-8">
              {description}
            </p>

            <dl className="orbix-profile-hero__record">
              {record.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* The vertical media column. Only rendered for `column`, where the
              subject's own geometry earns the space. */}
          {isBackdrop ? null : (
            <div className="relative mx-auto w-full max-w-[22rem] lg:mx-0">
              {media}
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}
