"use client";

import { useEffect, useMemo } from "react";
import Board from "./components/Board";
import PromotionDialog from "./components/PromotionDialog";
import CapturedTray, { computeCaptured } from "./components/CapturedTray";
import { useChess } from "./hooks/useChess";
import { WHITE, BLACK } from "./constants";

/** Chess entry — conforms to the board contract used by GamePageShell. */
export default function Chess({ mode, difficulty, roomId, role, size, onStatusChange, onResult }) {
  const chess = useChess({ mode, difficulty, roomId, role });
  const { state, status, pendingPromo, peerConnected, myColor } = chess;
  const captured = useMemo(() => computeCaptured(state.board), [state.board]);

  useEffect(() => {
    const side = state.turn === WHITE ? "White" : "Black";
    const online = mode === "online";
    let text;
    if (status.status === "checkmate") {
      const winner = status.winner;
      text = online
        ? winner === myColor
          ? "Checkmate — you win! 🎉"
          : "Checkmate — your opponent wins."
        : `Checkmate — ${winner === WHITE ? "White" : "Black"} wins!`;
    } else if (status.status === "stalemate") text = "Stalemate — it's a draw.";
    else if (status.status === "draw") text = "Draw.";
    else if (online && !peerConnected) text = "Waiting for a friend to join…";
    else if (online) {
      const you = state.turn === myColor;
      text = `${you ? "Your move" : "Opponent's move"}${status.status === "check" ? " — check!" : ""}`;
    } else text = `${side} to move${status.status === "check" ? " — check!" : ""}`;
    onStatusChange?.(text);
  }, [state.turn, status, mode, peerConnected, myColor, onStatusChange]);

  // Celebratory end-of-game popup.
  useEffect(() => {
    const s = status.status;
    if (s !== "checkmate" && s !== "stalemate" && s !== "draw") return;
    if (s === "stalemate") {
      onResult?.({ outcome: "draw", title: "Stalemate", message: "No legal moves left — it's a draw." });
      return;
    }
    if (s === "draw") {
      onResult?.({ outcome: "draw", title: "Draw", message: "The game ends in a draw." });
      return;
    }
    const winner = status.winner;
    let outcome, title, message;
    if (mode === "single") {
      const won = winner === WHITE;
      outcome = won ? "win" : "lose";
      title = won ? "Checkmate — you win!" : "Checkmate";
      message = won ? "You beat the engine. Bravo!" : "The engine delivered checkmate. Try again?";
    } else if (mode === "online") {
      const won = winner === myColor;
      outcome = won ? "win" : "lose";
      title = won ? "Checkmate — you win!" : "Checkmate";
      message = won ? "A well-earned victory." : "Your opponent delivered checkmate.";
    } else {
      const w = winner === WHITE ? "White" : "Black";
      outcome = "win";
      title = `Checkmate — ${w} wins!`;
      message = `${w} delivered the final blow.`;
    }
    onResult?.({ outcome, title, message });
  }, [status, mode, myColor, onResult]);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {/* Captured pieces flank the board — White's tray (Player's side) on the
          left, Black's tray (Computer/opponent's side) on the right — instead
          of stacking above/below it. Stacks only on phones. */}
      <div className="flex w-full flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-3">
        <CapturedTray owner={WHITE} pieces={captured.whiteCaptured} advantage={captured.advantage} compact />
        <Board
          board={state.board}
          selected={chess.selected}
          legalTargets={chess.legalTargets}
          lastMove={chess.lastMove}
          onSquareClick={chess.onSquareClick}
          size={size}
        />
        <CapturedTray owner={BLACK} pieces={captured.blackCaptured} advantage={-captured.advantage} compact />
      </div>

      {pendingPromo ? (
        <PromotionDialog color={state.turn} onSelect={chess.choosePromotion} />
      ) : null}
    </div>
  );
}

