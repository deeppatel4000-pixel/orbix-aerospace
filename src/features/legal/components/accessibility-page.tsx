import { ContactEmailLink } from "@/features/legal/components/contact-email-link";
import {
  LegalPage,
  type LegalTocItem,
} from "@/features/legal/components/legal-page";
import { LegalSection } from "@/features/legal/components/legal-section";

const toc: readonly LegalTocItem[] = [
  { id: "target", title: "Target standard" },
  { id: "measures", title: "What has been done" },
  { id: "limitations", title: "Known limitations" },
  { id: "testing", title: "How the site is checked" },
  { id: "report", title: "Report a problem" },
];

export function AccessibilityPage() {
  return (
    <LegalPage
      lead="ORBIX aims to be usable by everyone, including people who use a keyboard, a screen reader, magnification or reduced motion settings."
      title="Accessibility statement"
      toc={toc}
    >
      <LegalSection id="target" title="Target standard">
        <p>
          The target for ORBIX is the Web Content Accessibility Guidelines
          (WCAG) 2.2 at Level AA. This is a goal the site is built and tested
          against, not a certification. ORBIX has not had an independent
          accessibility audit.
        </p>
      </LegalSection>

      <LegalSection id="measures" title="What has been done">
        <ul>
          <li>
            <strong>Keyboard.</strong> Links, buttons and form controls are
            built to be reached and used with a keyboard alone. A &ldquo;Skip to
            main content&rdquo; link is the first stop on every page, and every
            focusable element shows a visible focus outline.
          </li>
          <li>
            <strong>Contrast.</strong> Text colors are chosen to meet at least
            4.5:1 contrast against their backgrounds, and form control edges and
            focus outlines at least 3:1. The ratios are measured and recorded in
            the ORBIX design specification.
          </li>
          <li>
            <strong>Reduced motion.</strong> If your system asks for reduced
            motion, transitions and animations are cut to effectively zero and
            the loading indicator stops spinning. The site uses no
            scroll-triggered or decorative looping animation.
          </li>
          <li>
            <strong>Images.</strong> Vehicle photographs have text alternatives
            describing what they show. Purely decorative graphics are hidden
            from screen readers.
          </li>
          <li>
            <strong>Forms.</strong> Calculator inputs use visible labels above
            the field, with units, and input errors are described in text, not
            by color alone.
          </li>
          <li>
            <strong>Structure.</strong> Each page has one main heading, a
            logical heading order and named navigation landmarks. Pages are laid
            out to work at screen widths down to 320 pixels without sideways
            scrolling.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="limitations" title="Known limitations">
        <ul>
          <li>
            <strong>Orbit drawings in the Engineering Lab.</strong> The transfer
            drawings in the Transfer Explorer, the Hohmann transfer tool and the
            mission planner each have a short text description, and the values
            they show are also given as text next to them. The Transfer Explorer
            can also show its numbers as a table. The shapes and positions in
            the drawings are not described in full.
          </li>
          <li>
            <strong>Redesign in progress.</strong> ORBIX is being redesigned
            during 2026. Some pages, especially parts of the Engineering Lab,
            may not yet fully meet the standards above while that work is
            completed.
          </li>
          <li>
            <strong>Long pages.</strong> The Engineering Lab contains many
            modules on one page. A tool index is provided to jump between them,
            but the page is long to navigate with a screen reader.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="testing" title="How the site is checked">
        <p>
          Changes are checked by keyboard-only use, by testing with reduced
          motion turned on, by viewing pages at narrow and wide screen sizes,
          and by automated browser tests that include keyboard navigation
          checks. These checks catch many problems, but not all of them.
        </p>
      </LegalSection>

      <LegalSection id="report" title="Report a problem">
        <p>
          If something on ORBIX is hard or impossible for you to use, please
          email <ContactEmailLink />. It helps to include the page address, what
          you were trying to do, and the browser and any assistive technology
          you use. I will reply and try to fix the problem or provide the
          information another way.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
