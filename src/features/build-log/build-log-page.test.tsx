import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { siteLegal } from "@/config/site-legal";
import { BuildLogPage } from "@/features/build-log";

const markup = renderToStaticMarkup(<BuildLogPage />);
const text = markup
  .replace(/<[^>]+>/g, " ")
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/\s+/g, " ");

describe("build log page", () => {
  it("has one h1 titled How I built ORBIX", () => {
    expect(markup.match(/<h1\b/g)).toHaveLength(1);
    // The last word is wrapped in an accent span; the text must read whole.
    const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(markup)?.[1] ?? "";
    expect(h1.replace(/<[^>]+>/g, "")).toBe("How I built ORBIX");
  });

  it("renders the key sentences", () => {
    for (const sentence of [
      "I plan to study aerospace engineering.",
      "ORBIX was my idea from the start.",
      "I researched the vehicle specifications and the engineering behind every tool",
      "I am an aspiring aerospace engineer, not a software engineer",
      "Claude Code by Anthropic",
      "AI is changing how software is written",
    ]) {
      expect(text).toContain(sentence);
    }
  });

  it("includes the owner's What I learned section", () => {
    expect(text).toContain("What I learned");
    expect(text).toContain("Across all 33 tools in the lab");
  });

  it("links to verification, the source code and the contact address", () => {
    expect(markup).toContain('href="/verification"');
    expect(markup).toContain(`href="${siteLegal.sourceCodeUrl}"`);
    expect(markup).toContain(`href="mailto:${siteLegal.contactEmail}"`);
  });

  it("lists the project facts as a definition list", () => {
    expect(markup).toContain("<dl");
    expect(text).toContain("Started August 2026");
    expect(text).toContain("Built with Next.js, React, TypeScript");
  });

  it("contains no em dash or emoji", () => {
    expect(markup).not.toContain("\u2014");
    expect(markup).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });
});
