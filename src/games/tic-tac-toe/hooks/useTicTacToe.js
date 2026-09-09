"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { applyMove, createInitialState } from "../engine";
import { createAI } from "../ai";
import { PLAYER_O, PLAYER_X } from "../constants";
import { useMultiplayer } from "@/hooks/useMultiplayer";

/**
 * Orchestrates a Tic-Tac-Toe session across all three modes.
 * - single: human is X, AI is O.
 * - local: pass-and-play, two humans same device.
 * - online: moves relayed through the Transport abstraction.
 */
export function useTicTacToe({ mode, difficulty, roomId, role }) {
  const [state, setState] = useState(() => createInitialState(PLAYER_X));
  const ai = useMemo(() => createAI(difficulty), [difficulty]);
  // In online play each device controls ONE mark: host is X, guest is O.
  // (In single-player the human is always X.)
  const myMark = mode === "online" ? (role === "guest" ? PLAYER_O : PLAYER_X) : PLAYER_X;
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const applyRemote = useCallback((message) => {
    if (message?.type === "move" && typeof message.index === "number") {
      setState((s) => applyMove(s, message.index));
    }
  }, []);

  const { peerConnected, send } = useMultiplayer({
    mode,
    roomId,
    role,
    onMessage: applyRemote,
  });

  const play = useCallback(
    (index) => {
      // Online: you may only move on your own turn.
      if (mode === "online" && stateRef.current.current !== myMark) return;
      setState((prev) => {
        const next = applyMove(prev, index);
        if (next !== prev && mode === "online") {
          send({ type: "move", index });
        }
        return next;
      });
    },
    [mode, myMark, send]
  );

  // AI responds when it's O's turn in single-player.
  useEffect(() => {
    if (mode !== "single" || state.winner || state.current !== PLAYER_O) return;
    const t = setTimeout(() => {
      const index = ai.getMove(stateRef.current);
      if (typeof index === "number") setState((s) => applyMove(s, index));
    }, 420);
    return () => clearTimeout(t);
  }, [mode, state, ai]);

  const canPlay = useCallback(
    (index) => {
      if (state.winner || state.board[index]) return false;
      if (mode === "single") return state.current === PLAYER_X;
      if (mode === "online") return peerConnected && state.current === myMark;
      return true; // local pass-and-play
    },
    [state, mode, myMark, peerConnected]
  );

  return { state, play, canPlay, peerConnected, myMark };
}
