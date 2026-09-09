"use client";

import { useEffect } from "react";
import Grid from "./components/Grid";
import Button from "@/components/ui/Button";
import { useBattleship } from "./hooks/useBattleship";
import { Shuffle, Swords } from "lucide-react";

/** Battleship entry — conforms to the board contract used by GamePageShell. */
export default function Battleship({ difficulty, size, onStatusChange, onResult }) {
  const bs = useBattleship({ difficulty });
  const { phase, turn, winner, enemyRemaining, playerRemaining } = bs;

  useEffect(() => {
    let text;
    if (phase === "setup") text = "Arrange your fleet, then start the battle";
    else if (winner === "player") text = "You win — enemy fleet destroyed!";
    else if (winner === "ai") text = "Defeated — your fleet was sunk.";
    else text = turn === "player" ? "Your shot — fire at the enemy grid" : "Enemy is firing…";
    onStatusChange?.(text);
  }, [phase, turn, winner, onStatusChange]);

  // Celebratory end-of-game popup.
  useEffect(() => {
    if (!winner) return;
    const won = winner === "player";
    onResult?.({
      outcome: won ? "win" : "lose",
      title: won ? "Victory at sea!" : "Fleet sunk",
      message: won
        ? "Enemy fleet destroyed — you rule the waters!"
        : "Your fleet was sunk. Regroup and try again?",
    });
  }, [winner, onResult]);

  if (phase === "setup") {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted">Your fleet</p>
        <Grid variant="own" fleet={bs.playerFleet} shots={bs.playerShots} sunk={bs.playerSunk} size={size} />
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={bs.shuffle}>
            <Shuffle size={16} /> Shuffle fleet
          </Button>
          <Button size="sm" onClick={bs.startBattle}>
            <Swords size={16} /> Start battle
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-fg">
            Enemy waters · {enemyRemaining} ships left
          </p>
          <Grid
            variant="enemy"
            fleet={bs.enemyFleet}
            shots={bs.enemyShots}
            sunk={bs.enemySunk}
            onFire={bs.fire}
            disabled={turn !== "player" || Boolean(winner)}
            size={size}
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-fg">
            Your fleet · {playerRemaining} ships left
          </p>
          <Grid variant="own" fleet={bs.playerFleet} shots={bs.playerShots} sunk={bs.playerSunk} size={size} />
        </div>
      </div>
    </div>
  );
}

