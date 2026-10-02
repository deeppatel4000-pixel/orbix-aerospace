# ORBIX v4 plan: built for a five-minute read

Status: binding for the v4 pass. Visual language stays `orbix-design-v3.md` (no boxes, no
gradients, hard-edged photos with captions, open rules, condensed Plex display, B612 Mono for
numbers). Research behind each decision:
`C:\Users\Deep\AppData\Local\Temp\claude\C--Users-Deep-dev-orbix\0aef5163-b2c7-4e1b-945a-29343ae8c21d\scratchpad\research-v4\`
(`content.md` five-minute strategy, `diagrams.md` interactive visuals, `images.md` photo and drawing
manifest with slot map, `skills.md` humanizer vetting).

## 1. Audience and goal

An admissions officer gives the site about five minutes; an engineering faculty reader may check
the physics. In ten seconds they must see that this is a 12th grader's own project, what it does,
and one striking thing ORBIX itself made. Less content, better content. Expansion comes after
college.

## 2. Owner decisions recorded

- The partly AI-generated ORBIX logo stays (owner decision 2026-09-28). Ignore advice to replace it.
- Deep Patel is a 12th grader (senior) planning to study aerospace engineering.
- Authorship framing is fixed: the idea, the research and every decision are Deep's; AI coding
  assistants (Codex, then Claude Code) wrote the code under his direction. Never "I coded".
- "What I learned" is the owner's own text. Keep its substance; only replace "all 33 tools" with
  wording that stays true after tools are deferred (for example "every tool in the lab").

## 3. Information architecture

- Header nav (5): Engineering Lab, Verification, Aircraft, Rockets, How I built it.
- Footer: Compare, Learn, About, Image credits, legal pages.
- `/showcase` is removed as a page: its architecture figure and quality checks move into the build
  log ("How it is organized"); `/showcase` and `/showcase-capture/*` redirect (permanent) to
  `/build-log#structure` and the lab mission planner respectively. Mission presets live in the lab.
- Compare opens preloaded (SR-71, F-22, B-2) instead of empty.

## 4. Home (budget 250 visible words, about 2,500 px at 1440)

1. Hero: H1 thesis, lead with name and grade, byline (idea and research mine, code by AI coding
   assistants under my direction, link to How I built it), primary action Open the Engineering Lab,
   secondary See how it is checked. Right column: the interactive Transfer Explorer (V1) in its
   compact form, live numbers visible. No photo in the hero.
2. Proof line: the verification score computed from code, plus one sample row (Hohmann LEO to GEO).
3. Three featured tools as text links with their equations.
4. Vehicles: one photo plate (not used elsewhere), one sentence, links to Aircraft, Rockets and a
   preloaded Compare.
5. Authorship: three sentences, links to build log and GitHub.
   Cut: registry tables, the six-item list, the sourcing paragraph (one footer line remains).

## 5. Interactive visuals (plain SVG and React, no new dependencies)

Shared module `src/features/orbits/`: stretched-altitude mapping (Earth at a fixed drawn radius,
altitude mapped linearly outward, labeled "altitude not to scale; Earth to scale"), conic path
sampling, a scrubber hook with reduced-motion guard, and a `TransferCanvas`. Physics stays in
calculators: add `calculators/kepler-position.ts` (Kepler's equation by Newton iteration) with unit
tests and one verification case from a published worked example.

- **V1 Transfer Explorer** (flagship; replaces the showcase transfer diagrams and the lab/learn orbit
  diagram): drag the target orbit (mirrored by a native range input, log scale 160 km to
  400,000 km, snap stops ISS 408 km, GEO 35,786 km, Moon distance). Live delta-v for each burn,
  total, transfer time, and a one-sentence narration per burn. User-started play button animates
  the craft along the arc using Kepler timing; reduced motion shows static positions. Direct labels
  on paths, 13px minimum figure text. Text table twin for screen readers. States its assumptions
  (circular, coplanar, impulsive).
- **V2 Mission Planner** (replaces the eight mission-* modules, replay, dashboard, ground track):
  pick a preset or a goal; the planner computes every step with existing analyses, draws each
  step on the shared canvas, lists steps as an ordered list, shows unmodeled steps as plain gray
  rows ("Launch: not modeled"). Never claims feasibility.
- **V3 Delta-v ledger**: one horizontal bar per mission on one shared m/s axis, segments in flight
  order, labeled, with a text table; Mars rows marked "preset allowances, not computed".
- Remove the decorative ground track (not computed), the replay slideshow and duplicate mission
  viewers.

Motion amendment to v3 section 10: user-started animation in V1/V2 is allowed; nothing moves on
load; reduced motion disables it.

## 6. Engineering Lab

Keep about 16 tools: rocket equation, thrust-to-weight, lift, drag, standard atmosphere, flight
condition, stagnation, normal shock, oblique shock, supersonic inlet compression (absorbs shock
pressure loss and multi-shock recovery), stagnation-point heating estimate (retitled), reentry
deceleration only if not bounded at 11 km (otherwise defer), Hohmann (V1 inside it), plane change,
mission planner (V2 with V3). Defer (remove from the page and nav, keep code and tests): reentry
trajectory, TPS material selection, TPS material comparison, vehicle reentry evaluation, vehicle
reentry comparison, and the entry half of the mission profile. Tool intros at most 30 words.
Update every tool count in copy from the code.

## 7. Images

Follow `images.md` slot map exactly: no photo file appears in more than one slot site-wide (credits
thumbnails excepted). Every hero and plate uses an original at least 1.0x its largest displayed
device size at 1440 DPR 2 (re-export from the full-resolution original; replace sources whose
original is too small, for example the B-2 and F-35). Each profile gets a short gallery of 2 to 3
additional views. Every new image: license verified on its source page, credit, license, source
link, recorded in `docs/assets/image-provenance.md` and shown on `/credits`. No NC or ND licenses.

Drawings: the aircraft scale figure and the rocket height figure use real outlines traced (as SVG)
from public-domain USAF/NASA three-views and side views, or CC BY-SA 4.0 drawings with exact
attribution and "cropped, labels removed" noted (derived figures released under CC BY-SA 4.0 and
credited). Each outline is normalized to the recorded length, span or height. Compare uses the
drawings instead of photo thumbnails.

## 8. Copy

Every user-visible sentence written or rewritten in v4 goes through the installed `humanizer` skill
(`C:\Users\Deep\.claude\skills\humanizer\SKILL.md`): read it and apply it. It must not add facts,
numbers, dates or opinions that are not in the source. Word budgets: home 250, lab hero 60 and tool
intros 30, verification prose about 1,600 (tables uncounted) with a three-line summary at the top,
build log 600 to 700, aircraft and rockets 200 each excluding data, profiles 450, compare 120,
learn 1,200 to 1,400 (pathways 1, 2, 3 and 5; defer 4 and 6; remove duplicated paragraphs), about 200. Say "selected results checked", never "validated". All counts computed from code.

## 9. Definition of done

- v3 definition of done still holds (zero gradients and boxes, AA, no overflow, validate and e2e).
- No photo repeated across slots; no image displayed above 1.0x its source resolution at DPR 2.
- Home first screen at 1440 and 390 shows: thesis, name and grade, the live Transfer Explorer.
- Every interactive visual works by keyboard, has a text alternative, and respects reduced motion.
- Every number shown is computed by the existing calculators or comes from the data; every claim
  is true.
