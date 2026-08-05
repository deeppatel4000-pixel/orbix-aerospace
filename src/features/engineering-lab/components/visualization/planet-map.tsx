import type { ReactNode } from "react";

import type { GroundTrackViewMode } from "./orbit-ground-path";

export interface PlanetMapProps {
  readonly children?: ReactNode;
  readonly mode: GroundTrackViewMode;
  readonly zoomScale: number;
}

function GroundMap() {
  return (
    <g>
      <rect
        fill="#07191f"
        height="280"
        rx="14"
        stroke="#315b63"
        strokeWidth="1.5"
        width="600"
        x="60"
        y="70"
      />
      <g stroke="#376068" strokeOpacity="0.38" strokeWidth="1">
        <path d="M 60 126 H 660 M 60 182 H 660 M 60 238 H 660 M 60 294 H 660" />
        <path d="M 135 70 V 350 M 210 70 V 350 M 285 70 V 350 M 360 70 V 350 M 435 70 V 350 M 510 70 V 350 M 585 70 V 350" />
      </g>
      <g fill="#17373a" stroke="#477078" strokeWidth="1">
        <path d="M 120 130 L 165 102 L 224 111 L 245 145 L 218 173 L 180 165 L 154 206 L 122 194 L 102 158 Z" />
        <path d="M 220 215 L 259 205 L 278 232 L 267 279 L 239 321 L 221 286 L 230 252 Z" />
        <path d="M 333 121 L 385 99 L 443 115 L 478 145 L 542 138 L 590 166 L 559 201 L 493 190 L 451 216 L 414 191 L 381 198 L 348 164 Z" />
        <path d="M 374 205 L 417 211 L 437 252 L 416 307 L 383 293 L 359 245 Z" />
        <path d="M 535 259 L 574 245 L 606 266 L 591 296 L 549 299 L 524 280 Z" />
      </g>
      <g fill="#759097" fontFamily="monospace" fontSize="9">
        <text x="66" y="64">
          90° N
        </text>
        <text x="66" y="367">
          90° S
        </text>
        <text x="52" y="213" textAnchor="end">
          0°
        </text>
        <text x="360" y="367" textAnchor="middle">
          0° LONGITUDE
        </text>
      </g>
    </g>
  );
}

function OrbitMap() {
  return (
    <g>
      <circle
        cx="360"
        cy="210"
        fill="#071d25"
        r="126"
        stroke="#4a8590"
        strokeWidth="2"
      />
      <circle cx="337" cy="185" fill="#0e3c48" opacity="0.7" r="105" />
      <g fill="none" stroke="#5e929a" strokeOpacity="0.38" strokeWidth="1">
        <ellipse cx="360" cy="210" rx="126" ry="36" />
        <ellipse cx="360" cy="210" rx="126" ry="73" />
        <ellipse cx="360" cy="210" rx="46" ry="126" />
        <ellipse cx="360" cy="210" rx="88" ry="126" />
        <path d="M 234 210 H 486 M 360 84 V 336" />
      </g>
      <g fill="#1c4b4b" stroke="#4e7a7b" strokeWidth="0.8">
        <path d="M 292 149 L 323 128 L 358 143 L 351 168 L 326 177 L 308 201 L 285 190 L 275 165 Z" />
        <path d="M 350 216 L 378 209 L 393 234 L 381 278 L 359 293 L 342 260 Z" />
        <path d="M 383 140 L 420 131 L 453 151 L 464 177 L 438 197 L 410 189 L 392 203 L 374 179 Z" />
      </g>
      <text
        fill="#78959b"
        fontFamily="monospace"
        fontSize="9"
        textAnchor="middle"
        x="360"
        y="363"
      >
        PLANETARY VIEW // NOT TO SCALE
      </text>
    </g>
  );
}

export function PlanetMap({ children, mode, zoomScale }: PlanetMapProps) {
  return (
    <svg
      aria-labelledby="planet-map-title planet-map-description"
      className="h-auto w-full min-w-[38rem]"
      role="img"
      viewBox="0 0 720 420"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="planet-map-title">
        {mode === "orbit"
          ? "Illustrative Earth orbit view"
          : "Illustrative Earth ground-track view"}
      </title>
      <desc id="planet-map-description">
        A simplified educational planet display with a latitude and longitude
        grid, generalized continent shapes, a conceptual orbital path, and a
        spacecraft position marker. It is not geographic or navigational data.
      </desc>
      <rect fill="#02080c" height="420" width="720" />
      <g
        style={{
          transform: `scale(${zoomScale})`,
          transformBox: "fill-box",
          transformOrigin: "center",
        }}
      >
        {mode === "orbit" ? <OrbitMap /> : <GroundMap />}
        {children}
      </g>
    </svg>
  );
}
