# ORBIX legal risk register

Last reviewed: 27 September 2026. Operator: Deep Patel (Massachusetts, United States).

This register records known legal risks for the ORBIX repository and website and what is being
done about each one. It is a working checklist written by the project, not legal advice, and it
does not state that any risk has been cleared. For a definite answer on any item, consult a
qualified lawyer.

Status values: **Open** (no mitigation yet), **In progress**, **Mitigated** (reduced, still
watched), **Owner action** (needs a decision or fact only the operator can supply).

| #   | Risk                                   | Status       | Summary                                                                                                                                                                                                                   |
| --- | -------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Third-party and AI-generated images    | Mitigated    | Images are being replaced with verified public-domain or openly licensed files, each recorded in `docs/assets/image-provenance.md` and credited on `/credits`. AI-generated environment plates are being removed.         |
| 2   | Trademarks of named organisations      | Mitigated    | Vehicle, manufacturer, and agency names are used only to identify subjects. `NOTICE.md`, the README, and `/credits` state non-affiliation and no endorsement.                                                             |
| 3   | Personal contact email published       | Owner action | `deep.patel4000@gmail.com` is published as a temporary contact. Replace it with a dedicated ORBIX address in `src/config/site-legal.ts`, `README.md`, and `NOTICE.md`.                                                    |
| 4   | ORBIX logo provenance                  | Accepted     | The owner confirmed on 28 September 2026 that the logo was partly AI-generated and chose to keep it. `/credits` discloses this.                                                                                           |
| 5   | "ORBIX" name conflicts                 | Accepted     | Other uses of "Orbix" exist (see below). The owner judged on 28 September 2026 that none is the same kind of use as a free educational site. Revisit before any commercial use.                                           |
| 6   | Operator is a student (possible minor) | Mitigated    | Terms are accepted by users of the site, not by the operator. The site has no accounts, no payments, and no analytics, and collects no personal data.                                                                     |
| 7   | Accessibility (ADA)                    | Mitigated    | Exposure is low for a free, non-commercial educational site, but WCAG 2.2 AA is the target and the `/accessibility` page gives a contact route for problems.                                                              |
| 8   | Export control (ITAR / EAR)            | Mitigated    | The site uses only public-domain, published information and simplified textbook models. Keep it that way: no controlled technical data, no non-public specifications.                                                     |
| 9   | Liability for use of calculations      | Mitigated    | Educational-use notices in the README, the app, and `/terms` state that results are simplified and must not be used for operational, safety, or certification decisions. The MIT License disclaims warranty for the code. |
| 10  | Contributions without clear rights     | Mitigated    | `CONTRIBUTING.md` states that contributions are MIT-licensed, that contributors must own what they submit, and that images need a verified free licence and no AI generation.                                             |

## Notes by item

### 1. Images

- Every raster image must have an entry in `docs/assets/image-provenance.md` with author or agency,
  licence, source page, and modifications, and must appear on `/credits`.
- NASA imagery is generally not copyrighted, but NASA's guidelines forbid use that implies
  endorsement. U.S. military imagery is usually public domain as a work of the U.S. Government, but
  individual files must still be checked.
- The four AI-generated environment plates and five mission images recorded in
  `docs/assets/visuals/generated-environments.md` were deleted on 27 September 2026. Only the
  ORBIX logo (item 4) remains unverified.
- Status changes to Mitigated when no unverified or AI-generated image remains in `public/`.

### 2. Trademarks

- Names such as NASA, SpaceX, Lockheed Martin, Boeing, and Northrop Grumman, and vehicle names such
  as F-22 Raptor or Falcon 9, belong to their owners.
- Use names in plain text to identify the subject only. Do not use third-party logos, insignia, or
  mission patches as decoration, and do not imply sponsorship.

### 3. Personal contact email

- Publishing a personal email address invites spam and links the site to the operator's personal
  identity. It is acceptable as a temporary measure.
- Action: create a dedicated address and update the single constant `contactEmail` in
  `src/config/site-legal.ts`, plus the plain-text copies in `README.md` and `NOTICE.md`.

### 4. ORBIX logo provenance

- `docs/brand/orbix-brand-assets.md` records the logo files and their hashes but not how the
  artwork was created.
- Owner decision, 28 September 2026: the logo was made with the help of AI image generation tools and is
  kept. `/credits` says so. Under current U.S. Copyright Office guidance, purely AI-generated
  material is not protected by copyright, so the logo may have limited copyright protection; the name
  and logo can still identify the project, and `NOTICE.md` does not license them for reuse.

### 5. "ORBIX" name conflicts

A web search on 27 September 2026 (not a legal clearance search, and not a full USPTO search)
found these existing uses of the name:

- **Orbix CORBA middleware** (originally IONA Technologies, later Micro Focus, now sold by Rocket
  Software as "Rocket Orbix"). This is an established software product and Rocket Software marks
  the name as a trademark.
- **ORBIX** trademark filing by Move the Chain Inc, described as software-as-a-service for employee
  engagement and workforce management (USPTO serial 99562742, per uspto.report).
- **Orbix** by Radiall, a product line of RF connectivity components for the space market.
- Other historic or unrelated "Orbix" filings, including Orbix Healthcare Corporation and a
  cancelled "ORBIX REV360" registration.
- **Orbex** (Orbital Express Launch Ltd.), a UK launch company with a similar-sounding name.

Owner decision, 28 September 2026: accepted for non-commercial educational use.

Assessment: ORBIX is a non-commercial educational project, which lowers the practical risk, but
"Orbix" is already used in software and in the space sector. The name should not be registered,
sold, or used commercially without a proper search of the USPTO trademark database
(tmsearch.uspto.gov) and legal advice. If the project ever becomes commercial, consider renaming.
Status stays Open until the owner decides.

### 6. Operator is a student

- The operator may be under 18. Contracts made by a minor can be voidable by the minor, so the
  site does not ask the operator to enter agreements with users. The terms on `/terms` are
  conditions that users accept by using the site; they do not require the operator to pay or
  deliver anything.
- ORBIX has no accounts, no payments, no advertising, no analytics, and no forms that send data to
  a server. Scenario data saved by users stays in their own browser storage. This keeps COPPA and
  state privacy laws out of scope as far as the project can tell.
- Hosting-provider request logs (Vercel) are outside the project's control and are covered by the
  provider's own privacy policy.

### 7. Accessibility

- The Americans with Disabilities Act has been applied to websites of businesses open to the
  public. ORBIX is not a business and charges nothing, so exposure is low.
- The redesign targets WCAG 2.2 AA: contrast, visible focus, keyboard operation, labelled inputs,
  and reduced-motion support. The `/accessibility` page (added by the redesign) states the target and gives a contact route for problems.

### 8. Export control

- ITAR (22 CFR 120 to 130) and the EAR (15 CFR 730 to 774) control technical data for defence and
  dual-use articles. Information that is already published and generally available to the public
  is excluded from both.
- ORBIX uses only published specifications from public sources and simplified textbook equations.
- Rule for contributors and the operator: do not add non-public data, design details beyond
  published figures, or anything obtained under a non-disclosure agreement, employment, or
  internship.

## Not legal advice

This register is a project planning document. It is not legal advice and does not create a
lawyer-client relationship. Nothing in it claims that ORBIX has been cleared of any legal risk.
