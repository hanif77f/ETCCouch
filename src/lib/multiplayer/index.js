import { LocalTransport } from "./LocalTransport";
import { BroadcastChannelTransport } from "./BroadcastChannelTransport";
import { PeerTransport } from "./PeerTransport";

export { Transport } from "./Transport";
export { LocalTransport } from "./LocalTransport";
export { BroadcastChannelTransport } from "./BroadcastChannelTransport";
export { PeerTransport } from "./PeerTransport";

/** Short, URL-safe room id. */
export function createRoomId() {
  const rnd =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 10)
      : Math.random().toString(36).slice(2, 12);
  return rnd;
}

/**
 * Build a shareable invite link for a game room.
 * @param {string} gameSlug
 * @param {string} roomId
 */
export function createInviteLink(gameSlug, roomId) {
  const base =
    typeof window !== "undefined" ? window.location.origin : "https://games.example.com";
  return `${base}/games/${gameSlug}?room=${roomId}`;
}

/**
 * Transport factory. Central place to choose the networking implementation for
 * a given mode.
 *
 * Online play uses PeerTransport (real WebRTC cross-device play). The old
 * BroadcastChannelTransport is kept as a same-browser-only reference and is no
 * longer selected here.
 * @param {"local"|"online"} mode
 * @param {{ roomId?: string, role?: "host"|"guest" }} [opts]
 */
export function createTransport(mode, { roomId, role } = {}) {
  if (mode === "online" && roomId) return new PeerTransport(roomId, role || "guest");
  return new LocalTransport();
}

