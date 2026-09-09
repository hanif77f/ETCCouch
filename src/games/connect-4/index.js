"use client";

import { useEffect } from "react";
import Board from "./components/Board";
import { useConnect4 } from "./hooks/useConnect4";
import { RED } from "./constants";

/** Connect 4 entry — conforms to the board contract used by GamePageShell. */
export default function Connect4({ mode, difficulty, roomId, role, size, onStatusChange, onResult }) {
  const { state, play, canPlay, peerConnected, myColor } = useConnect4({
    mode,
    difficulty,
    roomId,
    role,
  });
  const { winner, current } = state;

  useEffect(() => {
    const label = (p) => (p === RED ? "Red" : "Yellow");
    let text;
    if (winner === "draw") text = "It's a draw!";
    else if (winner === myColor && mode === "online") text = "You win! 🎉";
    else if (winner && mode === "online") text = "Your opponent wins.";
    else if (winner) text = `${label(winner)} wins!`;
    else if (mode === "online" && !peerConnected) text = "Waiting for a friend to join…";
    else if (mode === "online") text = current === myColor ? "Your turn" : "Opponent's turn…";
    else text = `${label(current)}'s turn`;
    onStatusChange?.(text);
  }, [winner, current, mode, peerConnected, myColor, onStatusChange]);

  // Celebratory end-of-game popup.
  useEffect(() => {
    if (!winner) return;
    const label = (p) => (p === RED ? "Red" : "Yellow");
    if (winner === "draw") {
      onResult?.({ outcome: "draw", title: "It's a draw!", message: "The board filled up — dead even." });
      return;
    }
    let outcome, title, message;
    if (mode === "single") {
      const won = winner === RED;
      outcome = won ? "win" : "lose";
      title = won ? "Congratulations!" : "So close!";
      message = won ? "Four in a row before the computer — great play!" : "The computer connected four first. Rematch?";
    } else if (mode === "online") {
      const won = winner === myColor;
      outcome = won ? "win" : "lose";
      title = won ? "Congratulations!" : "Good game!";
      message = won ? "Four in a row — you win!" : `${label(winner)} connected four first.`;
    } else {
      outcome = "win";
      title = `${label(winner)} wins!`;
      message = `${label(winner)} connected four.`;
    }
    onResult?.({ outcome, title, message });
  }, [winner, mode, myColor, onResult]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Board state={state} onDrop={play} canPlay={canPlay} size={size} />
    </div>
  );
}

