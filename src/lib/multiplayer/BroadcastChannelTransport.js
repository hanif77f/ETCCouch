import { Transport } from "./Transport";

/**
 * BroadcastChannelTransport — connects two tabs of the SAME browser sharing a
 * room id. This is a stand-in that proves the abstraction end-to-end (open a
 * share link in a second tab and moves sync) without any backend. Replace with
 * a WebRTC/WebSocket transport for true cross-device play — the game code that
 * consumes Transport stays identical.
 */
export class BroadcastChannelTransport extends Transport {
  constructor(roomId) {
    super();
    this.roomId = roomId;
    this.channel = null;
  }

  async connect() {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
      this._emit("error", { message: "BroadcastChannel unavailable in this environment." });
      return;
    }
    this.channel = new BroadcastChannel(`playhub:${this.roomId}`);
    this.channel.onmessage = (e) => {
      const { type, payload } = e.data || {};
      if (type === "hello") {
        this._emit("peerjoin", payload);
        this.channel.postMessage({ type: "welcome", payload: { at: Date.now() } });
      } else if (type === "welcome") {
        this._emit("peerjoin", payload);
      } else if (type === "message") {
        this._emit("message", payload);
      } else if (type === "bye") {
        this._emit("peerleave", payload);
      }
    };
    this._emit("open", { room: this.roomId });
    this.channel.postMessage({ type: "hello", payload: { at: Date.now() } });
  }

  send(message) {
    this.channel?.postMessage({ type: "message", payload: message });
  }

  disconnect() {
    this.channel?.postMessage({ type: "bye", payload: { at: Date.now() } });
    this.channel?.close();
    this.channel = null;
    this._emit("close", { reason: "disconnect" });
    this._handlers.clear();
  }
}

