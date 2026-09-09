"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createTransport } from "@/lib/multiplayer";

/**
 * useMultiplayer — React binding over the Transport abstraction.
 * Handles lifecycle and exposes a stable `send` plus connection status.
 * Games stay agnostic of the underlying networking implementation.
 *
 * @param {{ mode: "single"|"local"|"online", roomId?: string, role?: "host"|"guest", onMessage?: (m)=>void, onPeerJoin?: (p)=>void }} opts
 */
export function useMultiplayer({ mode, roomId, role, onMessage, onPeerJoin } = {}) {
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [peerConnected, setPeerConnected] = useState(false);
  const transportRef = useRef(null);
  const msgRef = useRef(onMessage);
  const joinRef = useRef(onPeerJoin);

  useEffect(() => {
    msgRef.current = onMessage;
    joinRef.current = onPeerJoin;
  }, [onMessage, onPeerJoin]);

  useEffect(() => {
    if (mode === "single") return;
    const connectingTimer = setTimeout(() => setConnectionStatus("connecting"), 0);
    const transport = createTransport(mode, { roomId, role });
    transportRef.current = transport;

    const offs = [
      transport.on("open", () => setConnectionStatus("open")),
      transport.on("message", (m) => msgRef.current?.(m)),
      transport.on("peerjoin", (p) => {
        setPeerConnected(true);
        joinRef.current?.(p);
      }),
      transport.on("peerleave", () => setPeerConnected(false)),
      transport.on("close", () => setConnectionStatus("closed")),
      transport.on("error", () => setConnectionStatus("error")),
    ];

    transport.connect();

    return () => {
      clearTimeout(connectingTimer);
      offs.forEach((off) => off());
      transport.disconnect();
      transportRef.current = null;
      setPeerConnected(false);
    };
  }, [mode, roomId, role]);

  const send = useCallback((message) => {
    transportRef.current?.send(message);
  }, []);

  const status = mode === "single" ? "idle" : connectionStatus;
  return { status, peerConnected, send };
}
