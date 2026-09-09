export const SIZE = 10;

// Classic fleet: name + length.
export const FLEET = [
  { id: "carrier", name: "Carrier", size: 5 },
  { id: "battleship", name: "Battleship", size: 4 },
  { id: "cruiser", name: "Cruiser", size: 3 },
  { id: "submarine", name: "Submarine", size: 3 },
  { id: "destroyer", name: "Destroyer", size: 2 },
];

// Cell states on a shot-tracking grid.
export const CELL = {
  EMPTY: 0,
  SHIP: 1,
  HIT: 2,
  MISS: 3,
  SUNK: 4,
};

