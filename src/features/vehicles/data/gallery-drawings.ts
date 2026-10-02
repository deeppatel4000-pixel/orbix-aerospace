/**
 * Outline drawings for the to-scale figures (Compare, the aircraft size
 * comparison and the rocket height lineup), one per vehicle.
 *
 * Each outline was traced from a public-domain U.S. government three-view or
 * side view, or from a CC BY-SA 4.0 illustration on Wikimedia Commons, and
 * then scaled so its bounding box matches the recorded dimensions in the
 * vehicle data:
 *
 * - Aircraft (`view: "top"`): plan view, nose up. x runs across the span,
 *   y from the nose (0) to the tail. Width = recorded wingspan, height =
 *   recorded length, both in meters.
 * - Launch vehicles (`view: "side"`): side view, nose up. Height = recorded
 *   height in meters; width follows the drawing at the same scale (fins,
 *   boosters and flaps included).
 *
 * `d` is an SVG path in meters with its origin at the top left of the
 * bounding box, so a figure can place it with
 * `<path d={drawing.d} transform="translate(x y)" />` inside a viewBox in
 * meters and stroke it with `vector-effect="non-scaling-stroke"` (spec v3
 * section 8: 1.5px strokes, no fills). The same outline is published as a
 * standalone file at `src`.
 *
 * The three CC BY-SA 4.0 derivatives (`shareAlike: true`) are released under
 * CC BY-SA 4.0 and must be credited wherever they are shown.
 */

export type DrawingView = "side" | "top";

export interface VehicleDrawing {
  /** Author line, as the license asks to be credited. */
  readonly credit: string;
  /** Closed SVG path in meters, origin at the top left of the bounding box. */
  readonly d: string;
  /** Bounding-box height in meters: recorded length (aircraft) or height (rockets). */
  readonly heightM: number;
  readonly license: string;
  readonly licenseUrl: string;
  /** What was changed from the source drawing. */
  readonly modifications: string;
  /** True when the outline is a CC BY-SA derivative, released under CC BY-SA 4.0. */
  readonly shareAlike: boolean;
  /** Human-readable file page of the source drawing. */
  readonly sourceUrl: string;
  /** The same outline as a standalone SVG file. */
  readonly src: string;
  readonly vehicleId: string;
  readonly view: DrawingView;
  /** Bounding-box width in meters: recorded wingspan (aircraft) or drawn width (rockets). */
  readonly widthM: number;
}

const drawings = {
  "b-2-spirit": {
    credit: "U.S. Army (Field Manual 44-80), via Wikimedia Commons",
    d: "M26.213 0 L52.426 18.1 L48.413 21.031 L39.783 14.94 L33.403 19.63 L30.203 17.73 L26.213 20.53 L22.223 17.73 L19.023 19.63 L12.643 14.94 L4.013 21.031 L0 18.1 Z",
    heightM: 21.031,
    license: "Public domain (U.S. government work)",
    licenseUrl:
      "https://commons.wikimedia.org/wiki/Template:PD-USGov-Military-Army",
    modifications:
      "Outline traced from the top view, straight edges redrawn as single lines and made symmetric; labels, dimension lines and other views removed; scaled to the recorded length and wingspan",
    shareAlike: false,
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Northrop_B-2_3-view_line_drawing.png",
    src: "/drawings/b-2-spirit.svg",
    vehicleId: "b-2-spirit",
    view: "top",
    widthM: 52.426,
  },
  "f-15-eagle": {
    credit:
      "U.S. Army (Field Manual 44-80); vector version by Malyszkz, via Wikimedia Commons",
    d: "M6.51 0.00 L6.61 0.03 L6.71 0.14 L6.82 0.35 L6.95 0.83 L7.05 1.44 L7.20 3.18 L7.28 5.66 L7.95 5.67 L8.00 5.73 L8.10 7.33 L8.20 7.46 L8.32 7.74 L8.42 9.41 L9.43 10.44 L9.48 10.39 L9.53 10.45 L9.53 10.55 L13.05 14.13 L13.05 14.52 L12.36 15.69 L12.20 15.69 L10.48 15.22 L8.66 15.23 L8.60 16.21 L9.30 17.06 L9.44 16.86 L9.51 16.92 L10.86 18.72 L10.80 18.99 L10.52 19.45 L10.24 19.45 L8.35 19.01 L8.18 18.87 L7.85 18.16 L7.73 18.16 L7.68 18.12 L6.67 18.12 L6.61 18.06 L6.60 17.21 L6.43 17.22 L6.43 18.06 L6.37 18.12 L5.36 18.12 L5.31 18.16 L5.19 18.16 L4.86 18.87 L4.67 19.02 L2.80 19.45 L2.52 19.45 L2.24 18.99 L2.18 18.72 L3.53 16.92 L3.60 16.86 L3.74 17.06 L4.43 16.23 L4.39 15.24 L4.36 15.22 L2.56 15.22 L0.84 15.69 L0.69 15.69 L0.00 14.52 L0.00 14.13 L3.51 10.55 L3.51 10.45 L3.56 10.39 L3.61 10.44 L4.62 9.41 L4.73 7.74 L4.83 7.50 L4.94 7.33 L5.04 5.73 L5.09 5.67 L5.76 5.66 L5.84 3.16 L6.00 1.39 L6.10 0.79 L6.21 0.38 L6.35 0.11 Z",
    heightM: 19.446,
    license: "Public domain (U.S. government work)",
    licenseUrl:
      "https://commons.wikimedia.org/wiki/Template:PD-USGov-Military-Army",
    modifications:
      "Outline traced from the top view; other views removed; scaled to the recorded length and wingspan",
    shareAlike: false,
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:McDonnell_Douglas_F-15_Eagle_3-view.svg",
    src: "/drawings/f-15-eagle.svg",
    vehicleId: "f-15-eagle",
    view: "top",
    widthM: 13.045,
  },
  "f-22-raptor": {
    credit: "U.S. Air Force, via Wikimedia Commons",
    d: "M6.70 0.00 L6.76 0.00 L6.85 0.09 L7.11 0.59 L7.25 1.00 L7.43 1.70 L7.45 2.02 L7.51 2.20 L7.54 2.61 L7.57 2.63 L7.57 2.81 L7.60 2.84 L7.72 4.68 L8.70 5.62 L8.99 8.46 L9.55 9.00 L11.26 10.50 L13.56 12.59 L13.56 13.79 L12.74 14.54 L9.96 15.47 L9.83 15.58 L9.83 15.78 L11.25 17.10 L11.25 18.39 L11.06 18.49 L10.97 18.49 L9.61 18.93 L9.18 18.58 L7.95 17.45 L7.95 16.63 L7.87 16.56 L7.50 16.88 L7.41 16.85 L7.01 16.56 L6.93 16.63 L6.93 17.54 L6.80 17.73 L6.62 17.51 L6.62 16.63 L6.54 16.56 L6.08 16.88 L5.70 16.56 L5.63 16.63 L5.63 17.42 L4.00 18.93 L2.35 18.43 L2.30 18.39 L2.33 18.36 L2.30 18.33 L2.33 18.24 L2.30 18.21 L2.33 18.18 L2.30 18.15 L2.33 18.06 L2.30 18.04 L2.33 17.92 L2.30 17.89 L2.30 17.13 L3.75 15.78 L3.75 15.58 L3.68 15.50 L0.87 14.57 L0.00 13.80 L0.00 12.57 L4.56 8.46 L4.85 5.62 L5.83 4.66 L5.89 3.22 L5.92 3.19 L5.92 2.93 L5.95 2.90 L5.95 2.66 L5.98 2.63 L5.98 2.40 L6.01 2.37 L6.07 1.82 L6.21 1.14 L6.35 0.67 Z",
    heightM: 18.928,
    license: "Public domain (U.S. government work)",
    licenseUrl: "https://commons.wikimedia.org/wiki/Template:PD-USGov",
    modifications:
      "Outline traced from the plan view; dimensions and other views removed; scaled to the recorded length and wingspan",
    shareAlike: false,
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Lockheed_Martin_F-22A_Raptor_3-view_line_drawing.jpg",
    src: "/drawings/f-22-raptor.svg",
    vehicleId: "f-22-raptor",
    view: "top",
    widthM: 13.564,
  },
  "f-35-lightning-ii": {
    credit: "F-35 Joint Program Office (jsf.mil), via Wikimedia Commons",
    d: "M5.33 0.00 L5.65 0.60 L5.78 0.95 L6.14 3.85 L6.22 4.27 L6.38 4.64 L6.79 4.20 L6.99 4.59 L7.10 7.04 L7.45 7.73 L7.58 7.86 L10.67 9.94 L10.67 11.46 L10.65 11.48 L7.16 12.35 L7.40 12.94 L7.46 13.00 L8.96 14.02 L8.96 14.87 L8.72 14.96 L6.34 15.54 L6.31 15.48 L6.22 14.92 L6.12 14.06 L5.98 13.61 L5.96 13.40 L5.67 13.96 L5.61 13.94 L5.59 13.97 L5.56 13.94 L5.53 13.96 L5.50 13.94 L5.40 13.97 L5.37 13.93 L5.33 13.97 L5.29 13.93 L5.26 13.97 L5.22 13.93 L5.19 13.96 L5.16 13.94 L5.13 13.97 L5.10 13.94 L4.99 13.97 L4.74 13.43 L4.70 13.38 L4.68 13.40 L4.68 13.57 L4.54 14.08 L4.35 15.51 L4.32 15.54 L1.72 14.89 L1.70 14.87 L1.70 14.03 L3.23 12.98 L3.49 12.35 L2.35 12.06 L2.07 12.01 L1.74 11.90 L1.71 11.93 L1.67 11.89 L0.00 11.47 L0.00 9.93 L3.16 7.80 L3.52 7.11 L3.56 7.00 L3.66 4.59 L3.87 4.20 L4.28 4.63 L4.44 4.26 L4.53 3.83 L4.83 1.17 L4.87 1.04 L4.86 1.01 L5.00 0.63 Z",
    heightM: 15.545,
    license: "Public domain (U.S. government work)",
    licenseUrl: "https://commons.wikimedia.org/wiki/Template:PD-USGov-Military",
    modifications:
      "Outline traced from the top-view rendering; scaled to the recorded length and wingspan",
    shareAlike: false,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:F-35A_Top.jpg",
    src: "/drawings/f-35-lightning-ii.svg",
    vehicleId: "f-35-lightning-ii",
    view: "top",
    widthM: 10.668,
  },
  "sr-71-blackbird": {
    credit: "U.S. Air Force, via Wikimedia Commons",
    d: "M8.47 0.00 L8.55 0.85 L9.14 2.06 L9.59 3.50 L9.91 5.03 L10.16 6.73 L10.34 9.27 L10.37 16.41 L11.67 18.84 L11.77 18.82 L11.79 18.38 L12.20 18.23 L12.50 16.82 L13.16 18.20 L13.43 18.36 L13.98 19.78 L14.34 21.24 L14.53 22.67 L14.59 24.23 L16.78 28.31 L16.95 28.72 L16.94 29.08 L16.85 29.27 L16.40 29.69 L14.08 30.30 L13.99 30.24 L13.62 29.54 L13.56 29.18 L13.37 29.82 L12.53 29.82 L12.39 30.20 L11.94 29.82 L11.81 29.96 L11.70 29.88 L11.15 30.94 L9.05 31.47 L8.61 32.74 L8.34 32.73 L8.29 32.67 L7.91 31.47 L5.82 30.95 L5.67 30.75 L5.25 29.88 L5.13 29.96 L5.03 29.82 L4.58 30.21 L4.42 29.83 L3.57 29.81 L3.38 29.26 L3.31 29.57 L3.14 29.92 L2.96 30.23 L2.86 30.29 L0.64 29.75 L0.20 29.40 L0.07 29.21 L0.00 28.94 L0.01 28.71 L0.11 28.42 L2.37 24.21 L2.42 22.67 L2.65 21.08 L2.95 19.84 L3.54 18.33 L3.80 18.18 L4.45 16.82 L4.75 18.22 L5.16 18.37 L5.17 18.79 L5.27 18.85 L6.59 16.39 L6.62 8.95 L6.81 6.57 L7.06 4.91 L7.34 3.58 L7.84 2.00 L8.39 0.85 Z",
    heightM: 32.736,
    license: "Public domain (U.S. government work)",
    licenseUrl:
      "https://commons.wikimedia.org/wiki/Template:PD-USGov-Military-Air_Force",
    modifications:
      "Outline traced from the top view; other views removed; scaled to the recorded length and wingspan",
    shareAlike: false,
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Lockheed_SR-71A_3view.svg",
    src: "/drawings/sr-71-blackbird.svg",
    vehicleId: "sr-71-blackbird",
    view: "top",
    widthM: 16.947,
  },
  "saturn-v": {
    credit: "David S. F. Portree / NASA (NASA RP-1357), via Wikimedia Commons",
    d: "M10.61 0.00 L11.30 1.09 L11.30 6.57 L11.60 7.04 L11.60 10.01 L12.93 11.40 L12.93 16.19 L14.36 24.83 L14.36 37.68 L14.57 37.77 L15.28 40.57 L15.82 41.23 L15.76 42.08 L16.30 43.68 L16.30 57.59 L16.84 58.61 L16.84 62.29 L16.30 63.26 L16.30 65.54 L16.75 66.25 L16.75 68.03 L17.01 68.59 L16.30 68.78 L16.30 99.02 L17.44 102.38 L21.38 104.47 L21.32 105.98 L18.64 106.00 L18.75 106.88 L16.58 106.94 L16.49 107.15 L17.18 108.48 L17.70 108.80 L17.92 111.00 L13.76 110.96 L14.03 109.05 L13.91 108.64 L14.33 107.08 L14.15 105.33 L13.12 105.37 L13.52 106.88 L11.66 106.90 L11.49 107.12 L12.13 108.29 L12.60 108.73 L12.78 111.00 L8.60 110.92 L8.85 108.66 L9.35 108.28 L10.04 107.13 L9.91 106.92 L7.81 106.86 L8.30 105.33 L7.19 105.33 L7.17 106.27 L7.01 106.32 L7.01 107.07 L7.44 108.69 L7.59 111.00 L3.48 111.00 L3.64 108.81 L4.16 108.50 L4.85 107.17 L4.78 106.96 L2.63 106.88 L2.73 106.00 L0.00 105.92 L0.05 104.41 L3.93 102.38 L5.01 99.08 L5.01 68.81 L4.40 68.62 L4.66 68.03 L4.66 66.27 L5.01 65.58 L5.01 63.19 L4.57 62.31 L4.57 58.59 L5.01 57.67 L4.97 43.84 L5.56 42.04 L5.53 41.23 L6.03 40.55 L6.96 37.72 L6.96 24.78 L8.38 16.26 L8.38 11.41 L9.71 10.03 L9.71 7.06 L10.02 6.57 L10.02 1.04 Z",
    heightM: 111.0,
    license: "Public domain (U.S. government work)",
    licenseUrl: "https://commons.wikimedia.org/wiki/Template:PD-USGov-NASA",
    modifications:
      "Outline traced; interior detail removed; scaled to the recorded height",
    shareAlike: false,
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:RP1357_p174_Saturn_V.svg",
    src: "/drawings/saturn-v.svg",
    vehicleId: "saturn-v",
    view: "side",
    widthM: 21.384,
  },
  "space-launch-system": {
    credit: "NASA/cbush, via Wikimedia Commons",
    d: "M9.27 0.00 L9.55 0.28 L9.72 1.16 L9.72 5.56 L10.34 6.44 L9.77 6.80 L9.77 8.15 L10.48 11.22 L11.50 13.19 L12.11 15.70 L12.14 20.88 L11.90 22.40 L11.90 25.17 L13.48 33.39 L13.48 50.77 L13.69 50.97 L13.98 50.77 L13.98 49.56 L14.67 47.05 L15.31 45.25 L15.84 44.53 L16.21 44.75 L16.73 45.79 L17.82 49.56 L17.82 93.84 L18.72 96.37 L17.69 96.38 L17.49 96.58 L18.00 98.25 L13.73 98.25 L14.31 96.58 L14.11 96.38 L13.08 96.37 L13.56 95.02 L13.35 94.82 L12.96 95.52 L12.49 95.75 L12.79 98.30 L10.58 98.30 L10.79 95.92 L10.56 95.70 L9.92 95.55 L8.78 95.55 L8.25 95.83 L8.51 97.10 L8.52 98.30 L6.35 98.30 L6.33 97.10 L6.57 95.83 L5.94 95.55 L5.26 94.54 L5.06 94.76 L5.62 96.37 L4.59 96.38 L4.39 96.58 L4.97 98.25 L0.69 98.25 L1.22 96.58 L1.02 96.38 L0.00 96.38 L0.89 93.84 L0.89 49.61 L2.05 45.70 L2.50 44.78 L2.87 44.53 L3.40 45.27 L4.01 47.05 L4.72 49.63 L4.72 50.77 L4.93 50.97 L5.13 50.77 L5.13 33.41 L6.76 25.22 L6.57 15.72 L7.19 13.07 L8.16 11.20 L8.87 8.15 L8.87 6.82 L8.30 6.42 L8.91 5.56 L8.91 1.11 Z",
    heightM: 98.3,
    license: "Public domain (U.S. government work)",
    licenseUrl: "https://commons.wikimedia.org/wiki/Template:PD-USGov-NASA",
    modifications:
      "Outline traced; insignia and interior detail removed; scaled to the recorded height",
    shareAlike: false,
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Space_Launch_System.svg",
    src: "/drawings/space-launch-system.svg",
    vehicleId: "space-launch-system",
    view: "side",
    widthM: 18.718,
  },
  "falcon-9": {
    credit:
      "Lucabon (based on work of Markus Säynevirta, Craigboy and Rressi), CC BY-SA 4.0, via Wikimedia Commons",
    d: "M2.19 0.00 L2.80 0.00 L3.08 0.15 L4.16 1.48 L4.65 2.59 L4.96 4.19 L4.96 11.90 L4.28 13.07 L4.28 27.99 L4.47 28.30 L4.41 28.79 L4.53 28.97 L4.53 33.23 L4.41 33.72 L4.41 58.87 L4.72 67.81 L4.28 68.24 L4.28 68.55 L4.04 68.92 L4.28 69.85 L3.08 69.88 L2.96 70.00 L0.74 69.88 L0.71 69.60 L0.96 68.92 L0.71 68.61 L0.65 68.24 L0.22 67.69 L0.46 59.74 L0.65 58.56 L0.65 29.90 L0.52 29.78 L0.52 28.23 L0.65 28.05 L0.65 13.01 L0.03 11.96 L0.00 11.62 L0.00 4.59 L0.15 3.27 L0.59 1.91 L1.39 0.68 Z",
    heightM: 70.0,
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    modifications:
      "Falcon 9 Block 5 (payload fairing) figure cropped; outline traced; logos, flags, labels and interior detail removed; scaled to the recorded height. This outline is released under CC BY-SA 4.0",
    shareAlike: true,
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Falcon9_rocket_family.svg",
    src: "/drawings/falcon-9.svg",
    vehicleId: "falcon-9",
    view: "side",
    widthM: 4.963,
  },
  "falcon-heavy": {
    credit:
      "Lucabon (based on work of Markus Säynevirta, Craigboy and Rressi), CC BY-SA 4.0, via Wikimedia Commons",
    d: "M5.89 0.00 L6.72 0.09 L7.92 1.54 L8.41 2.71 L8.72 4.62 L8.72 11.47 L8.66 11.96 L8.04 13.01 L8.04 26.63 L8.38 26.85 L8.60 26.57 L8.85 25.65 L9.46 24.66 L9.99 24.26 L10.42 24.26 L11.00 24.72 L11.56 25.65 L11.87 26.57 L11.99 27.99 L12.18 28.23 L12.18 29.71 L11.99 29.90 L11.99 58.44 L12.18 58.93 L12.42 67.81 L11.99 68.24 L11.99 68.55 L11.74 68.92 L11.99 69.85 L10.79 69.88 L10.66 70.00 L8.45 69.88 L8.41 69.60 L8.66 68.92 L8.20 68.52 L7.74 68.92 L7.98 69.60 L7.95 69.88 L6.84 69.88 L6.72 70.00 L4.44 69.88 L4.65 68.92 L4.32 68.52 L4.07 68.58 L3.73 68.92 L3.98 69.60 L3.95 69.88 L2.84 69.88 L2.71 70.00 L0.43 69.88 L0.65 68.92 L0.40 68.55 L0.40 68.24 L0.00 67.84 L0.22 59.00 L0.40 58.44 L0.40 29.90 L0.22 29.71 L0.22 28.30 L0.40 27.99 L0.52 26.57 L0.71 25.95 L1.20 24.97 L1.97 24.26 L2.53 24.32 L3.17 24.97 L4.01 26.91 L4.41 26.57 L4.41 13.07 L3.73 11.90 L3.73 4.19 L3.98 2.84 L4.53 1.48 L5.21 0.55 Z",
    heightM: 70.0,
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    modifications:
      "Falcon Heavy (reusable, with payload fairing) figure cropped; outline traced; logos, flags, labels and interior detail removed; scaled to the recorded height. This outline is released under CC BY-SA 4.0",
    shareAlike: true,
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Falcon9_rocket_family.svg",
    src: "/drawings/falcon-heavy.svg",
    vehicleId: "falcon-heavy",
    view: "side",
    widthM: 12.422,
  },
  starship: {
    credit: "FloraFallenrose, CC BY-SA 4.0, via Wikimedia Commons",
    d: "M8.75 0.00 L9.60 0.15 L11.55 3.10 L16.24 7.20 L16.19 9.35 L13.39 8.75 L13.14 9.00 L13.44 12.20 L14.04 13.49 L13.54 13.89 L13.54 37.78 L17.34 44.18 L17.34 51.58 L13.79 51.63 L13.54 51.88 L13.54 57.58 L13.79 57.83 L18.04 57.88 L17.99 58.63 L17.69 58.43 L17.49 58.63 L17.29 58.43 L17.09 58.63 L16.69 58.43 L16.39 58.63 L16.19 58.43 L15.89 58.63 L15.69 58.43 L14.69 58.63 L14.49 58.43 L14.19 58.83 L13.79 58.73 L13.54 58.98 L13.54 97.46 L13.94 98.46 L13.94 118.95 L13.54 119.65 L13.54 122.75 L13.94 124.05 L10.30 124.40 L4.05 124.05 L4.45 122.75 L4.45 119.65 L4.05 118.95 L4.05 98.46 L4.45 97.46 L4.45 58.98 L4.20 58.73 L3.80 58.83 L3.50 58.43 L3.30 58.63 L2.90 58.43 L2.60 58.63 L2.40 58.43 L2.10 58.63 L1.90 58.43 L1.60 58.63 L1.40 58.43 L1.10 58.63 L0.70 58.43 L0.00 58.63 L0.00 57.83 L4.20 57.83 L4.45 57.58 L4.45 51.88 L4.20 51.63 L0.65 51.58 L0.65 44.18 L4.45 37.78 L4.45 13.89 L3.95 13.49 L4.55 12.20 L4.85 9.00 L4.60 8.75 L1.80 9.35 L1.75 7.20 L6.45 3.10 L7.15 2.30 L8.25 0.30 Z",
    heightM: 124.4,
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    modifications:
      "Starship (block 3) figure cropped; outline traced; labels, flags and interior detail removed; scaled to the recorded height. This outline is released under CC BY-SA 4.0",
    shareAlike: true,
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:SuperHeavyLaunchers.png",
    src: "/drawings/starship.svg",
    vehicleId: "starship",
    view: "side",
    widthM: 18.043,
  },
} as const satisfies Record<string, VehicleDrawing>;

/**
 * True once Compare and the to-scale figures draw these outlines. Credits
 * lists the drawings only while this is true. The page team that wires
 * `getVehicleDrawing` into those figures sets it; the integration task
 * checks it.
 */
export const DRAWINGS_IN_USE: boolean = true;

/** The outline drawing for a vehicle, or undefined when there is none. */
export function getVehicleDrawing(
  vehicleId: string,
): VehicleDrawing | undefined {
  return drawings[vehicleId as keyof typeof drawings];
}

/** Every drawing, aircraft then launch vehicles. */
export function listDrawings(): readonly VehicleDrawing[] {
  return Object.values(drawings);
}
