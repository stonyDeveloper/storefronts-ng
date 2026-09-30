// Color math + deterministic randomness for the generative storefront hero.
// Everything here must stay pure: HeroBackground renders on server and client,
// and identical output for identical inputs is what prevents hydration mismatches.

export interface HSL {
  h: number; // 0–360
  s: number; // 0–100
  l: number; // 0–100
}

export function hexToHsl(hex: string): HSL {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return { h: 240, s: 6, l: 10 }; // fall back to brand near-black
  const int = parseInt(m[1], 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Shift an HSL color by deltas, clamping s/l and wrapping hue. */
export function shift(c: HSL, d: { h?: number; s?: number; l?: number }): HSL {
  return {
    h: (((c.h + (d.h ?? 0)) % 360) + 360) % 360,
    s: clamp(c.s + (d.s ?? 0), 0, 100),
    l: clamp(c.l + (d.l ?? 0), 0, 100),
  };
}

/** CSS color string from HSL + alpha — what the gradient layers consume. */
export function hsla(c: HSL, alpha = 1): string {
  return `hsla(${c.h}, ${c.s}%, ${c.l}%, ${alpha})`;
}

/** True when the color is light enough that white text on it would fail. */
export function isLight(hex: string): boolean {
  return hexToHsl(hex).l > 62;
}

/** FNV-1a 32-bit — stable, fast string hash for seeding. */
export function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * mulberry32 PRNG seeded from a string. Returns () => number in [0, 1).
 * Same string → same sequence, on server and client alike.
 */
export function seededRandom(seed: string): () => number {
  let a = hashString(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random number in [min, max) from a PRNG. */
export function range(rand: () => number, min: number, max: number): number {
  return min + rand() * (max - min);
}

/** Pick one item from a weighted list. */
export function pickWeighted<T>(rand: () => number, entries: [T, number][]): T {
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = rand() * total;
  for (const [item, w] of entries) {
    roll -= w;
    if (roll <= 0) return item;
  }
  return entries[entries.length - 1][0];
}

export interface HeroPalette {
  base: HSL;
  /** Two brighter, hue-shifted glows for the mesh. */
  tintA: HSL;
  tintB: HSL;
  /** Darker anchor that gives the mesh depth. */
  shade: HSL;
  /** Strongly hue-rotated accent — the "pop" color for blobs/aurora. */
  pop: HSL;
}

/**
 * Derive a small palette from the store's primary color. Deltas are seeded so
 * two stores with the same primary color still get different atmospheres.
 */
export function deriveHeroPalette(primaryHex: string, rand: () => number): HeroPalette {
  const base = hexToHsl(primaryHex);
  const dark = base.l < 40;
  // Near-greys have no meaningful hue — give them one so glows aren't muddy.
  const hue = base.s < 12 ? Math.round(range(rand, 0, 360)) : base.h;
  const seeded = { ...base, h: hue };
  const dir = rand() < 0.5 ? -1 : 1;

  return {
    base,
    tintA: shift(seeded, {
      h: dir * range(rand, 14, 30),
      s: Math.max(28, seeded.s) - seeded.s + range(rand, 0, 14),
      l: dark ? range(rand, 14, 22) : range(rand, 8, 14),
    }),
    tintB: shift(seeded, {
      h: -dir * range(rand, 10, 24),
      s: Math.max(24, seeded.s) - seeded.s + range(rand, 0, 10),
      l: dark ? range(rand, 8, 14) : -range(rand, 4, 8),
    }),
    shade: shift(seeded, { l: dark ? -range(rand, 4, 8) : -range(rand, 10, 16) }),
    pop: shift(seeded, {
      h: dir * range(rand, 34, 60),
      s: Math.max(36, seeded.s) - seeded.s + range(rand, 0, 18),
      l: dark ? range(rand, 18, 28) : range(rand, 10, 18),
    }),
  };
}
