import { FLEET, SIZE } from "../constants";

/** Pure Battleship rules engine. No React. A "fleet" is an array of ships,
 *  each with its occupied cell indexes and the hits taken. */

export const idx = (r, c) => r * SIZE + c;
export const inBounds = (r, c) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

function shipCells(r, c, size, horizontal) {
  const cells = [];
  for (let i = 0; i < size; i++) {
    const rr = horizontal ? r : r + i;
    const cc = horizontal ? c + i : c;
    cells.push([rr, cc]);
  }
  return cells;
}

function canPlace(occupied, cells) {
  return cells.every(([r, c]) => inBounds(r, c) && !occupied.has(idx(r, c)));
}

/** Randomly place the full fleet. Returns { ships, occupied:Set }. */
export function randomFleet() {
  const occupied = new Set();
  const ships = [];
  for (const def of FLEET) {
    let placed = false;
    while (!placed) {
      const horizontal = Math.random() < 0.5;
      const r = Math.floor(Math.random() * SIZE);
      const c = Math.floor(Math.random() * SIZE);
      const cells = shipCells(r, c, def.size, horizontal);
      if (canPlace(occupied, cells)) {
        const cellIdx = cells.map(([rr, cc]) => idx(rr, cc));
        cellIdx.forEach((i) => occupied.add(i));
        ships.push({ ...def, cells: cellIdx, hits: new Set(), horizontal });
        placed = true;
      }
    }
  }
  return { ships, occupied };
}

/** Fire at a cell index against a fleet. Returns { result, ship, alreadyShot }. */
export function fireAt(ships, shots, cellIndex) {
  if (shots.has(cellIndex)) return { alreadyShot: true };
  const ship = ships.find((s) => s.cells.includes(cellIndex));
  if (!ship) return { result: "miss", alreadyShot: false };
  ship.hits.add(cellIndex);
  const sunk = ship.cells.every((c) => ship.hits.has(c));
  return { result: sunk ? "sunk" : "hit", ship, alreadyShot: false };
}

export const isFleetSunk = (ships) =>
  ships.every((s) => s.cells.every((c) => s.hits.has(c)));

export const sunkCells = (ships) =>
  ships.filter((s) => s.cells.every((c) => s.hits.has(c))).flatMap((s) => s.cells);

