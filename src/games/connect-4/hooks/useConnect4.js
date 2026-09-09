"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { applyMove, createInitialState } from "../engine";
import { createAI } from "../ai";
import { RED, YELLOW } from "../constants";
import { useMultiplayer } from "@/hooks/useMultiplayer";

/** Orchestrates a Connect 4 session for single / local / online modes. */
export function useConnect4({ mode, difficulty, roomId, role }) {
  const [state, setState] = useState(() => createInitialState(RED));
  const ai = useMemo(() => createAI(difficulty), [difficulty]);
  // Online: host plays RED, guest plays YELLOW. Single-player human is RED.
  const myColor = mode === "online" ? (role === "guest" ? YELLOW : RED) : RED;
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const applyRemote = useCallback((message) => {
    if (message?.type === "move" && typeof message.col === "number") {
      setState((s) => applyMove(s, message.col));
    }
  }, []);

  const { peerConnected, send } = useMultiplayer({ mode, roomId, role, onMessage: applyRemote });

  const play = useCallback(
    (col) => {
      if (mode === "online" && stateRef.current.current !== myColor) return;
      setState((prev) => {
        const next = applyMove(prev, col);
        if (next !== prev && mode === "online") send({ type: "move", col });
        return next;
      });
    },
    [mode, myColor, send]
  );

  useEffect(() => {
    if (mode !== "single" || state.winner || state.current !== YELLOW) return;
    const t = setTimeout(() => {
      const col = ai.getMove(stateRef.current);
      if (typeof col === "number") setState((s) => applyMove(s, col));
    }, 450);
    return () => clearTimeout(t);
  }, [mode, state, ai]);

  const canPlay = useCallback(
    (col) => {
      if (state.winner) return false;
      if (mode === "single") return state.current === RED;
      if (mode === "online") return peerConnected && state.current === myColor;
      return true; // local pass-and-play
    },
    [state, mode, myColor, peerConnected]
  );

  return { state, play, canPlay, peerConnected, myColor };
}
