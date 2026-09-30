import type { StoreCategory } from "@prisma/client";
import { HERO_STYLES } from "@/lib/validations";
import {
  deriveHeroPalette,
  hashString,
  hsla,
  isLight,
  pickWeighted,
  range,
  seededRandom,
} from "@/lib/colors";

export type HeroFamily = Exclude<(typeof HERO_STYLES)[number], "auto">;

const FAMILIES = HERO_STYLES.filter((s): s is HeroFamily => s !== "auto");

// Category biases the seeded pick so a fashion store leans elegant and a
// food store leans playful — but never deterministically the same family.
const CATEGORY_WEIGHTS: Record<StoreCategory, [HeroFamily, number][]> = {
  FASHION: [["aurora", 3], ["geometric", 2], ["blobs", 1]],
  BEAUTY: [["aurora", 3], ["blobs", 2], ["geometric", 1]],
  FOOD: [["blobs", 3], ["aurora", 1], ["geometric", 1]],
  ELECTRONICS: [["geometric", 3], ["aurora", 2], ["blobs", 1]],
  SPORTS: [["geometric", 3], ["blobs", 2], ["aurora", 1]],
  HOME: [["blobs", 2], ["geometric", 2], ["aurora", 1]],
  BOOKS: [["geometric", 2], ["aurora", 2], ["blobs", 1]],
  GENERAL: [["blobs", 1], ["aurora", 1], ["geometric", 1]],
};

// Film grain — feTurbulence tile as a data URI. Kills the flat-gradient look.
const GRAIN_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

interface HeroBackgroundProps {
  slug: string;
  primaryColor: string;
  category: StoreCategory;
  /** "auto" = seeded pick; a family name pins it. */
  heroStyle: string;
  /** Shrinks pixel-based effects (blur radii, pattern geometry) for small previews. */
  scale?: number;
}

const round1 = (v: number) => Math.round(v * 10) / 10;

/**
 * Deterministic generative hero atmosphere. Every value is derived from the
 * store slug via a seeded PRNG, so a given store always renders the same
 * background (server + client + ISR), while every store gets its own.
 */
export function HeroBackground({
  slug,
  primaryColor,
  category,
  heroStyle,
  scale = 1,
}: HeroBackgroundProps) {
  const rand = seededRandom(slug);
  const palette = deriveHeroPalette(primaryColor, rand);
  const light = isLight(primaryColor);

  const family: HeroFamily = FAMILIES.includes(heroStyle as HeroFamily)
    ? (heroStyle as HeroFamily)
    : pickWeighted(rand, CATEGORY_WEIGHTS[category] ?? CATEGORY_WEIGHTS.GENERAL);

  // Layer 1 — mesh: soft radial glows at seeded positions over the base color.
  const mesh = [
    `radial-gradient(ellipse ${round1(range(rand, 55, 80))}% ${round1(range(rand, 40, 60))}% at ${round1(range(rand, 15, 45))}% ${round1(range(rand, 5, 35))}%, ${hsla(palette.tintA, 0.5)} 0%, transparent 65%)`,
    `radial-gradient(ellipse ${round1(range(rand, 50, 75))}% ${round1(range(rand, 40, 65))}% at ${round1(range(rand, 55, 90))}% ${round1(range(rand, 45, 80))}%, ${hsla(palette.tintB, 0.45)} 0%, transparent 65%)`,
    `radial-gradient(ellipse ${round1(range(rand, 60, 90))}% ${round1(range(rand, 45, 70))}% at ${round1(range(rand, 30, 70))}% ${round1(range(rand, 85, 110))}%, ${hsla(palette.shade, 0.6)} 0%, transparent 70%)`,
  ].join(", ");

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: mesh }} />

      {family === "blobs" && <Blobs rand={rand} palette={palette} scale={scale} />}
      {family === "aurora" && <Aurora rand={rand} palette={palette} light={light} scale={scale} />}
      {family === "geometric" && <Geometric rand={rand} slug={slug} light={light} scale={scale} />}

      {/* Layer 3 — grain over everything */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("${GRAIN_URI}")`,
          opacity: light ? 0.07 : 0.05,
          mixBlendMode: "overlay",
        }}
      />

      {/* Seam into the (white) content below */}
      <div
        className="absolute inset-x-0 bottom-0 h-24"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08))" }}
      />
    </div>
  );
}

type LayerProps = {
  rand: () => number;
  palette: ReturnType<typeof deriveHeroPalette>;
  scale: number;
};

function Blobs({ rand, palette, scale }: LayerProps) {
  const configs = [
    {
      color: palette.pop,
      alpha: 0.5,
      width: range(rand, 38, 52),
      left: range(rand, -10, 50),
      top: range(rand, -20, 25),
      blur: range(rand, 70, 90),
      anim: "animate-hero-drift-a",
    },
    {
      color: palette.tintA,
      alpha: 0.45,
      width: range(rand, 30, 44),
      left: range(rand, 40, 80),
      top: range(rand, 20, 60),
      blur: range(rand, 60, 85),
      anim: "animate-hero-drift-b",
    },
    {
      color: palette.tintB,
      alpha: 0.4,
      width: range(rand, 24, 36),
      left: range(rand, 5, 60),
      top: range(rand, 50, 85),
      blur: range(rand, 55, 75),
      anim: "animate-hero-drift-c",
    },
  ];

  return (
    <>
      {configs.map((b, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${b.anim}`}
          style={{
            width: `max(${round1(b.width)}%, ${Math.round(240 * scale)}px)`,
            aspectRatio: "1",
            left: `${round1(b.left)}%`,
            top: `${round1(b.top)}%`,
            backgroundColor: hsla(b.color, b.alpha),
            filter: `blur(${Math.round(b.blur * scale)}px)`,
          }}
        />
      ))}
    </>
  );
}

function Aurora({ rand, palette, light, scale }: LayerProps & { light: boolean }) {
  const corners = [
    { left: -25, top: -35 },
    { left: 45, top: -40 },
    { left: -20, top: 25 },
    { left: 40, top: 20 },
  ];
  const corner = corners[Math.floor(range(rand, 0, corners.length)) % corners.length];
  const from = Math.round(range(rand, 0, 360));

  const conic = `conic-gradient(from ${from}deg, ${hsla(palette.tintA, 0.55)} 0deg, transparent 110deg, ${hsla(palette.pop, 0.5)} 190deg, transparent 290deg, ${hsla(palette.tintA, 0.55)} 360deg)`;

  return (
    <div
      className="absolute"
      style={{
        width: `${round1(range(rand, 75, 95))}%`,
        aspectRatio: "1",
        left: `${corner.left}%`,
        top: `${corner.top}%`,
        opacity: light ? 0.4 : 0.55,
      }}
    >
      <div
        className="animate-hero-aurora h-full w-full rounded-full"
        style={{ background: conic, filter: `blur(${Math.round(70 * scale)}px)` }}
      />
    </div>
  );
}

function Geometric({
  rand,
  slug,
  light,
  scale,
}: {
  rand: () => number;
  slug: string;
  light: boolean;
  scale: number;
}) {
  const ink = light ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.85)";
  const variant = pickWeighted<"dots" | "lines" | "arcs">(rand, [
    ["dots", 1],
    ["lines", 1],
    ["arcs", 1],
  ]);
  // Unique pattern id in case two heroes ever share a DOM
  const pid = `hero-${variant}-${hashString(slug).toString(36)}`;
  const maskX = round1(range(rand, 25, 75));
  const maskY = round1(range(rand, 20, 60));
  const mask = `radial-gradient(ellipse 85% 75% at ${maskX}% ${maskY}%, black 20%, transparent 78%)`;

  return (
    <div
      className="absolute inset-0"
      style={{ opacity: 0.09, maskImage: mask, WebkitMaskImage: mask }}
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        {variant === "dots" && (
          <>
            <defs>
              <pattern id={pid} width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.6" fill={ink} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${pid})`} />
          </>
        )}
        {variant === "lines" && (
          <>
            <defs>
              <pattern
                id={pid}
                width="26"
                height="26"
                patternUnits="userSpaceOnUse"
                patternTransform={`rotate(${Math.round(range(rand, -60, 60))})`}
              >
                <path d="M0 0H26" stroke={ink} strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${pid})`} />
          </>
        )}
        {variant === "arcs" && (
          <g
            fill="none"
            stroke={ink}
            strokeWidth="1.2"
            transform={`translate(${Math.round(range(rand, 100, 900) * scale)}, ${Math.round(range(rand, 50, 500) * scale)})`}
          >
            {Array.from({ length: 10 }, (_, i) => (
              <circle key={i} r={round1((i + 1) * 68 * scale)} />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
