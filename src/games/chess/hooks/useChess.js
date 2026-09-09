"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createInitialState, getStatus, legalMoves, makeMove } from "../engine";
import { createAI } from "../ai";
import { WHITE, BLACK } from "../constants";
import { useMultiplayer } from "@/hooks/useMultiplayer";

/**
 * Orchestrates a chess session across single / local / online modes.
 * Human plays White in single-player; the AI plays Black.
 */
export function useChess({ mode, difficulty, roomId, role }) {
  const [state, setState] = useState(() => createInitialState());
  const [selected, setSelected] = useState(null);
  const [pendingPromo, setPendingPromo] = useState(null); // { from, to }
  const [lastMove, setLastMove] = useState(null); // { from, to }
  const ai = useMemo(() => createAI(difficulty), [difficulty]);
  // Online: host plays White, guest plays Black. Single-player human is White.
  const myColor = mode === "online" ? (role === "guest" ? BLACK : WHITE) : WHITE;
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const status = useMemo(() => getStatus(state), [state]);
  const legalForSelected = useMemo(
    () => (selected == null ? [] : legalMoves(state, selected)),
    [state, selected]
  );

  const applyRemote = useCallback((message) => {
    if (message?.type === "move" && message.move) {
      setState((s) => makeMove(s, message.move));
      setSelected(null);
      setLastMove({ from: message.move.from, to: message.move.to });
    }
  }, []);

  const { peerConnected, send } = useMultiplayer({ mode, roomId, role, onMessage: applyRemote });

  const commit = useCallback(
    (move, broadcast = true) => {
      setState((prev) => makeMove(prev, move));
      setSelected(null);
      setPendingPromo(null);
      setLastMove({ from: move.from, to: move.to });
      if (broadcast && mode === "online") send({ type: "move", move });
    },
    [mode, send]
  );

  const humanTurn =
    mode === "single" ? state.turn === WHITE : mode === "online" ? state.turn === myColor : true;

  const onSquareClick = useCallback(
    (index) => {
      if (status.winner || pendingPromo) return;
      if (mode === "single" && state.turn !== WHITE) return;
      // Online: only act on your own turn, and only move your own pieces.
      if (mode === "online" && (!peerConnected || state.turn !== myColor)) return;

      const moves = selected == null ? [] : legalMoves(state, selected);
      const target = moves.find((m) => m.to === index);

      if (selected != null && target) {
        // Promotion needs a choice.
        const promos = moves.filter((m) => m.to === index && m.promotion);
        if (promos.length) {
          setPendingPromo({ from: selected, to: index });
          return;
        }
        commit(target);
        return;
      }

      // Select own piece.
      const piece = state.board[index];
      if (piece && legalMoves(state, index).length) setSelected(index);
      else setSelected(null);
    },
    [state, selected, status, pendingPromo, mode, myColor, peerConnected, commit]
  );

  const choosePromotion = useCallback(
    (pieceType) => {
      if (!pendingPromo) return;
      const move = legalMoves(state, pendingPromo.from).find(
        (m) => m.to === pendingPromo.to && m.promotion === pieceType
      );
      if (move) commit(move);
    },
    [pendingPromo, state, commit]
  );

  // AI move in single-player.
  useEffect(() => {
    if (mode !== "single" || status.winner || state.turn === WHITE) return;
    const t = setTimeout(() => {
      const move = ai.getMove(stateRef.current);
      if (move) commit(move, false);
    }, 350);
    return () => clearTimeout(t);
  }, [mode, state, status, ai, commit]);

  return {
    state,
    status,
    selected,
    lastMove,
    legalTargets: legalForSelected.map((m) => m.to),
    pendingPromo,
    peerConnected,
    humanTurn,
    myColor,
    onSquareClick,
    choosePromotion,
  };
}
