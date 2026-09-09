import { SIZE } from "../constants";

/**
 * Battleship AI — hunt & target strategy, fully inside this game folder.
 * - Hunt mode: fire on a parity ("checkerboard") pattern to find ships fast.
 * - Target mode: after a hit, queue orthogonal neighbours; once two hits line
 *   up, fire along that axis to finish the ship.
 *
 * Implements createAI(difficulty).getMove({ shots, hits }) -> cell index.
 *   shots: Set of already-fired indexes
 *   hits:  Set of indexes that were hits (not yet sunk cleared by caller)
 */
const rc = (i) => [Math.floor(i / SIZE), i % SIZE];
const toIdx = (r, c) => r * SIZE + c;
const inB = (r, c) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

export function createAI(difficulty = "Medium") {
  const level = String(difficulty).toLowerCase();
  const useParity = level !== "easy"; // easy = pure random hunt

  return {
    getMove({ shots, hits }) {
      const untried = (i) => !shots.has(i);

      // TARGET MODE: we have unresolved hits — chase them.
      const activeHits = [...hits].filter((h) => shots.has(h));
      if (level !== "easy" && activeHits.length > 0) {
        // If two hits are adjacent, prefer extending that line.
        const candidates = new Set();
        for (const h of activeHits) {
          const [r, c] = rc(h);
          for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nr = r + dr, nc = c + dc;
            if (inB(nr, nc) && untried(toIdx(nr, nc))) candidates.add(toIdx(nr, nc));
          }
        }
        // Rank cells that continue a straight run of hits higher.
        let best = null, bestScore = -1;
        for (const cand of candidates) {
          const [r, c] = rc(cand);
          let score = 1;
          for (const [dr, dc] of [[1, 0], [0, 1]]) {
            const a = toIdx(r + dr, c + dc), b = toIdx(r - dr, c - dc);
            if (hits.has(a) || hits.has(b)) score += 5;
          }
          if (score > bestScore) { bestScore = score; best = cand; }
        }
        if (best != null) return best;
      }

      // HUNT MODE
      const cells = [];
      for (let i = 0; i < SIZE * SIZE; i++) {
        if (!untried(i)) continue;
        const [r, c] = rc(i);
        if (useParity && (r + c) % 2 !== 0) continue;
        cells.push(i);
      }
      const pool = cells.length ? cells : [...Array(SIZE * SIZE).keys()].filter(untried);
      return pool[Math.floor(Math.random() * pool.length)];
    },
  };
}

