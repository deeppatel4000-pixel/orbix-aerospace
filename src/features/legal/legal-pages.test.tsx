import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { siteLegal } from "@/config/site-legal";
import {
  AboutPage,
  AccessibilityPage,
  CookiesPage,
  CreditsPage,
  PrivacyPage,
  TermsPage,
} from "@/features/legal";
import {
  describeSourceSite,
  listImageCredits,
} from "@/features/legal/data/image-credits";
import { formatLegalDate } from "@/features/legal/lib/format-legal-date";
import { legalMetadata } from "@/features/legal/lib/legal-metadata";

const pages: ReadonlyArray<readonly [string, () => ReactElement]> = [
  ["about", () => <AboutPage />],
  ["accessibility", () => <AccessibilityPage />],
  ["cookies", () => <CookiesPage />],
  ["credits", () => <CreditsPage />],
  ["privacy", () => <PrivacyPage />],
  ["terms", () => <TermsPage />],
];

const bannedCopy =
  /\b(elevate|seamless|unleash|next-gen|cutting-edge|revolutionary|empower|world-class|premium|state-of-the-art|industry-leading|professional-grade|trusted by)\b/i;

describe("legal pages", () => {
  for (const [name, render] of pages) {
    describe(name, () => {
      const markup = renderToStaticMarkup(render());

      it("has exactly one h1 and at least one h2", () => {
        expect(markup.match(/<h1\b/g)).toHaveLength(1);
        expect(markup).toMatch(/<h2\b/);
      });

      it("shows the revision date and a mailto contact link", () => {
        expect(markup).toContain(`dateTime="${siteLegal.lastUpdated}"`);
        expect(markup).toContain(`href="mailto:${siteLegal.contactEmail}"`);
      });

      it("contains no em dash, emoji or banned copy", () => {
        expect(markup).not.toContain(String.fromCharCode(0x2014));
        expect(markup).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
        expect(markup).not.toMatch(bannedCopy);
      });

      it("links every table-of-contents entry to a section on the page", () => {
        const anchors = [...markup.matchAll(/href="#([^"]+)"/g)].map(
          (match) => match[1],
        );
        for (const id of anchors) {
          expect(markup).toContain(`id="${id}"`);
        }
      });
    });
  }

  it("says ORBIX stores nothing in the browser, with no removed tool named", () => {
    // No shipped page writes to browser storage (the scenario library is not
    // rendered), so neither page may describe saving or a storage key.
    for (const page of [<PrivacyPage key="p" />, <CookiesPage key="c" />]) {
      const text = renderToStaticMarkup(page).replace(/<[^>]+>/g, "");
      expect(text).toMatch(/ORBIX (does not use it|does not write to)/);
      expect(text).not.toContain("orbix.mission-scenarios.v1");
      expect(text).not.toContain("Scenario Library");
      expect(text).not.toContain("#scenario-library");
    }
  });

  it("says who made ORBIX on /about and links to the build log", () => {
    const markup = renderToStaticMarkup(<AboutPage />);
    expect(markup).toContain('href="/build-log"');
    expect(markup).toContain(
      `a personal project created by ${siteLegal.operatorName}, a high school senior who plans to study aerospace engineering`,
    );
  });

  it("gives /about a #sources section for the home page link", () => {
    expect(renderToStaticMarkup(<AboutPage />)).toContain('id="sources"');
  });
});

describe("image credits", () => {
  it("lists one row per vehicle visual with a source link", () => {
    const credits = listImageCredits();
    expect(credits.length).toBeGreaterThan(0);
    for (const credit of credits) {
      expect(credit.vehicleName).not.toBe("");
      expect(credit.src.startsWith("/")).toBe(true);
    }
  });

  it("names the source site for known hosts", () => {
    expect(
      describeSourceSite("https://commons.wikimedia.org/wiki/File:X.jpg"),
    ).toBe("Wikimedia Commons");
    expect(describeSourceSite("https://images.nasa.gov/details/x")).toBe(
      "NASA",
    );
    expect(describeSourceSite("not a url")).toBe("Source");
  });
});

describe("formatLegalDate", () => {
  it("formats ISO dates without a time zone shift", () => {
    expect(formatLegalDate("2026-09-27")).toBe("27 September 2026");
    expect(formatLegalDate("2026-01-01")).toBe("1 January 2026");
  });

  it("returns unrecognized input unchanged", () => {
    expect(formatLegalDate("soon")).toBe("soon");
  });
});

describe("legalMetadata", () => {
  it("sets a page title, description, canonical path and Open Graph copy", () => {
    const metadata = legalMetadata({
      description: "Test description.",
      path: "/privacy",
      title: "Privacy policy",
    });
    expect(metadata.title).toBe("Privacy policy");
    expect(metadata.alternates?.canonical).toBe("/privacy");
    expect(metadata.openGraph?.title).toBe("Privacy policy | ORBIX");
    expect(metadata.openGraph?.description).toBe("Test description.");
  });
});
