"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fireAt, isFleetSunk, randomFleet, sunkCells } from "../engine";
import { createAI } from "../ai";
import { SIZE } from "../constants";

/**
 * Battleship session vs the computer. Player fires at the enemy grid; the AI
 * returns fire on the player's grid using hunt-and-target logic.
 * Phases: "setup" (arrange fleet) -> "battle" -> "over".
 */
export function useBattleship({ difficulty }) {
  const ai = useMemo(() => createAI(difficulty), [difficulty]);

  const [phase, setPhase] = useState("setup");
  const [playerFleet, setPlayerFleet] = useState(() => randomFleet().ships);
  const [enemyFleet, setEnemyFleet] = useState(() => randomFleet().ships);
  const [enemyShots, setEnemyShots] = useState(() => new Set()); // player -> enemy
  const [playerShots, setPlayerShots] = useState(() => new Set()); // ai -> player
  const [turn, setTurn] = useState("player");
  const [winner, setWinner] = useState(null);

  // AI memory of unresolved hits on the player fleet.
  const aiHits = useRef(new Set());

  const shuffle = useCallback(() => setPlayerFleet(randomFleet().ships), []);
  const startBattle = useCallback(() => setPhase("battle"), []);

  // Player fires at an enemy cell.
  const fire = useCallback(
    (cellIndex) => {
      if (phase !== "battle" || turn !== "player" || winner) return;
      if (enemyShots.has(cellIndex)) return;

      const res = fireAt(enemyFleet, enemyShots, cellIndex);
      if (res.alreadyShot) return;
      const nextShots = new Set(enemyShots).add(cellIndex);
      setEnemyShots(nextShots);
      setEnemyFleet([...enemyFleet]);

      if (isFleetSunk(enemyFleet)) {
        setWinner("player");
        setPhase("over");
        return;
      }
      setTurn("ai");
    },
    [phase, turn, winner, enemyShots, enemyFleet]
  );

  // AI turn.
  useEffect(() => {
    if (phase !== "battle" || turn !== "ai" || winner) return;
    const t = setTimeout(() => {
      const move = ai.getMove({ shots: playerShots, hits: aiHits.current });
      const res = fireAt(playerFleet, playerShots, move);
      const nextShots = new Set(playerShots).add(move);
      setPlayerShots(nextShots);
      setPlayerFleet([...playerFleet]);

      if (res.result === "hit") aiHits.current.add(move);
      if (res.result === "sunk" && res.ship) {
        // ship down — clear its cells from active targeting memory
        res.ship.cells.forEach((c) => aiHits.current.delete(c));
      }

      if (isFleetSunk(playerFleet)) {
        setWinner("ai");
        setPhase("over");
        return;
      }
      setTurn("player");
    }, 500);
    return () => clearTimeout(t);
  }, [phase, turn, winner, ai, playerShots, playerFleet]);

  const enemyRemaining = enemyFleet.filter((s) => !s.cells.every((c) => s.hits.has(c))).length;
  const playerRemaining = playerFleet.filter((s) => !s.cells.every((c) => s.hits.has(c))).length;

  return {
    phase,
    turn,
    winner,
    playerFleet,
    enemyFleet,
    enemyShots,
    playerShots,
    enemySunk: sunkCells(enemyFleet),
    playerSunk: sunkCells(playerFleet),
    enemyRemaining,
    playerRemaining,
    shuffle,
    startBattle,
    fire,
  };
}

