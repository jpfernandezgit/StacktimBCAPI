/**
 * Deterministic "personal constellation" avatar generator.
 *
 * Given a stable user id (UUID string) we produce a small set of star
 * positions and connecting edges. Same user id always yields the same
 * constellation — this is the user's visual signature in LISTEN.
 */

export interface ConstellationStar {
  x: number; // 0..1
  y: number; // 0..1
  size: number; // 0..1
}

export interface Constellation {
  stars: ConstellationStar[];
  edges: Array<[number, number]>;
}

/** xorshift32 seeded PRNG. Deterministic across platforms. */
function makePrng(seed: number): () => number {
  let state = seed | 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    // Convert to 0..1 float.
    return ((state >>> 0) % 100_000) / 100_000;
  };
}

/** Simple 32-bit hash of a string. */
function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Build a constellation for a given user id. `starCount` defaults to 9 which
 * fits nicely inside a circular avatar.
 */
export function buildConstellation(
  userId: string,
  starCount = 9,
): Constellation {
  const rng = makePrng(hashString(userId));
  const stars: ConstellationStar[] = [];
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: 0.15 + rng() * 0.7,
      y: 0.15 + rng() * 0.7,
      size: 0.3 + rng() * 0.7,
    });
  }

  // Connect each star to its nearest unvisited neighbour (minimum spanning
  // path) so every constellation feels drawn by one stroke.
  const edges: Array<[number, number]> = [];
  const visited = new Set<number>([0]);
  let current = 0;
  while (visited.size < stars.length) {
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < stars.length; i++) {
      if (visited.has(i)) continue;
      const dx = stars[i].x - stars[current].x;
      const dy = stars[i].y - stars[current].y;
      const d = dx * dx + dy * dy;
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    if (bestIdx === -1) break;
    edges.push([current, bestIdx]);
    visited.add(bestIdx);
    current = bestIdx;
  }

  return { stars, edges };
}
