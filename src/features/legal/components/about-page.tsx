import Image from "next/image";
import Link from "next/link";

import { creditLine, licenceLabel } from "@/components/ui/photo-hero";
import { siteLegal } from "@/config/site-legal";
import { ContactEmailLink } from "@/features/legal/components/contact-email-link";
import { LegalPage } from "@/features/legal/components/legal-page";
import { LegalSection } from "@/features/legal/components/legal-section";
import { getSitePhoto } from "@/features/vehicles/data/gallery";

/**
 * The page's one photograph (the `about` slot of the photo slot map, used
 * nowhere else), set under the intro rule as its art-directed image
 * (spec 7): a hard-edged plate at the file's 3:2 ratio, so the whole
 * aircraft shows. Below 40rem it bleeds across the 16px page gutters, like
 * the profile and Learn plates; to 80rem it takes the full container
 * width; from 80rem it starts at the text column and bleeds to the right
 * viewport edge (the wrapper clips the scrollbar's width). The catalogue
 * caption sits on the ground below, in the text column (spec 6).
 */
function AboutPlate() {
  const photo = getSitePhoto("about");
  const licence = licenceLabel(photo.license);

  return (
    <figure className="m-0 xl:grid xl:grid-cols-12 xl:gap-x-6">
      <div className="aspect-[3/2] overflow-hidden max-sm:-mx-4 xl:col-span-9 xl:col-start-4 xl:mr-[calc((min(100vw,72rem)_-_100vw)/2_-_2rem)]">
        <Image
          alt={photo.alt}
          className="h-full w-full object-cover saturate-[0.9]"
          fetchPriority="high"
          height={photo.height}
          loading="eager"
          sizes="(min-width: 80rem) calc(50vw + 17rem), 100vw"
          src={photo.src}
          style={{ objectPosition: photo.objectPosition }}
          width={photo.width}
        />
      </div>
      <figcaption className="orbix-caption xl:col-span-9 xl:col-start-4">
        <span className="orbix-caption__number">Fig. 1</span>
        {photo.caption} {creditLine(photo.credit)}.{" "}
        <a
          aria-label={licence.isShortened ? licence.full : undefined}
          href={photo.licenseUrl}
          rel="license"
        >
          {licence.short}
        </a>
        . <a href={photo.sourceUrl}>Source file</a>.
      </figcaption>
    </figure>
  );
}

export function AboutPage() {
  return (
    <LegalPage
      plate={<AboutPlate />}
      lead={`ORBIX is an educational website about aircraft, launch vehicles and the engineering behind them. It is a personal project created by ${siteLegal.operatorName}, a high school senior who plans to study aerospace engineering. The idea, the research and every decision are his. AI coding assistants (Codex, then Claude Code) wrote the code under his direction.`}
      title="About ORBIX"
    >
      <LegalSection id="sources" title="Sources and corrections">
        <p>
          Vehicle figures come from publicly available information. Sources
          often disagree, so many values carry a qualifier such as
          &ldquo;approximate&rdquo;, and the data files do not yet cite a source
          for each value. Check anything important with the original publisher.
          Engineering Lab results are calculated in your browser with textbook
          equations.
        </p>
        <p>
          To report an error, email <ContactEmailLink /> with the page, the
          value and a source if you have one.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact">
        <p>
          Questions and accessibility problems also go to <ContactEmailLink />.{" "}
          <Link href="/build-log">How I built ORBIX</Link> explains how the site
          was made. The code is on <a href={siteLegal.sourceCodeUrl}>GitHub</a>{" "}
          under the MIT License.
        </p>
      </LegalSection>

      <LegalSection id="what-orbix-is-not" title="What ORBIX is not">
        <p>
          ORBIX is free, has no advertising and is not an official source. It is
          not affiliated with or endorsed by NASA, any armed service or any
          vehicle manufacturer. The calculators use simplified models and must
          not be used for operational, flight, safety or certification decisions
          (see the <Link href="/terms#educational-use">terms of use</Link>).
        </p>
      </LegalSection>
    </LegalPage>
  );
}
