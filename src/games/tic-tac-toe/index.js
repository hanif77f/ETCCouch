"use client";

import { useEffect } from "react";
import Board from "./components/Board";
import { useTicTacToe } from "./hooks/useTicTacToe";

/**
 * Tic-Tac-Toe game entry. Conforms to the board contract expected by
 * GamePageShell: props { mode, difficulty, roomId, onStatusChange }.
 */
export default function TicTacToe({ mode, difficulty, roomId, role, size, onStatusChange, onResult }) {
  const { state, play, canPlay, peerConnected, myMark } = useTicTacToe({
    mode,
    difficulty,
    roomId,
    role,
  });
  const { board, current, winner, line } = state;

  useEffect(() => {
    let text;
    if (winner === "draw") text = "It's a draw!";
    else if (winner === myMark && mode === "online") text = "You win! 🎉";
    else if (winner && mode === "online") text = "Your opponent wins.";
    else if (winner) text = `${winner} wins!`;
    else if (mode === "online" && !peerConnected) text = "Waiting for a friend to join…";
    else if (mode === "online") text = current === myMark ? "Your turn" : "Opponent's turn…";
    else text = `${current}'s turn`;
    onStatusChange?.(text);
  }, [current, winner, mode, peerConnected, myMark, onStatusChange]);

  // Fire the celebratory end-of-game popup.
  useEffect(() => {
    if (!winner) return;
    if (winner === "draw") {
      onResult?.({ outcome: "draw", title: "It's a draw!", message: "Evenly matched — nobody could break through." });
      return;
    }
    let outcome, title, message;
    if (mode === "single") {
      const won = winner === "X";
      outcome = won ? "win" : "lose";
      title = won ? "Congratulations!" : "So close!";
      message = won ? "You beat the computer — nicely played!" : "The computer edged this one. Try again?";
    } else if (mode === "online") {
      const won = winner === myMark;
      outcome = won ? "win" : "lose";
      title = won ? "Congratulations!" : "Good game!";
      message = won ? "You outplayed your opponent." : "Your opponent took this round.";
    } else {
      outcome = "win";
      title = `${winner} wins!`;
      message = `Player ${winner} takes the round.`;
    }
    onResult?.({ outcome, title, message });
  }, [winner, mode, myMark, onResult]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Board board={board} line={line} onCellClick={play} canPlay={canPlay} size={size} />
    </div>
  );
}

