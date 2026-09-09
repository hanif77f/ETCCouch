import { Transport } from "./Transport";

/**
 * PeerTransport — real cross-device multiplayer over WebRTC via PeerJS.
 *
 * Two browsers on two different machines connect peer-to-peer. WebRTC needs a
 * one-time "introduction" (signaling) to exchange connection info; we use
 * PeerJS's free public cloud for that, so THIS SITE STAYS FULLY STATIC — there
 * is no server for you to run. After the handshake, game messages travel
 * directly between the two players (with Google's public STUN servers helping
 * them find a route through most home routers).
 *
 * Roles:
 *   host  — the player who clicked "Invite Friend". Registers under a
 *           deterministic peer id derived from the room id and waits.
 *   guest — the player who opened the invite link. Dials the host's id.
 *
 * This is a drop-in replacement for the old BroadcastChannelTransport: it emits
 * the exact same events ("open" | "peerjoin" | "message" | "peerleave" |
 * "close" | "error"), so no game code has to change.
 */

// Namespaces our ids on the shared public PeerJS server so they don't collide
// with other apps. Kept strictly alphanumeric — the public server rejects ids
// containing symbols.
const ID_PREFIX = "playhubv1";

const peerIdFor = (roomId) => `${ID_PREFIX}${String(roomId).replace(/[^A-Za-z0-9]/g, "")}`;

export class PeerTransport extends Transport {
  /**
   * @param {string} roomId
   * @param {"host"|"guest"} role
   */
  constructor(roomId, role = "guest") {
    super();
    this.roomId = roomId;
    this.role = role;
    this.peer = null;
    this.conn = null;
    this._hostId = peerIdFor(roomId);
    this._closed = false;
  }

  async connect() {
    if (typeof window === "undefined") {
      this._emit("error", { message: "PeerTransport requires a browser environment." });
      return;
    }

    // Dynamic import keeps PeerJS out of the server bundle and only loads it
    // when an online game actually starts.
    let Peer;
    try {
      ({ default: Peer } = await import("peerjs"));
    } catch (err) {
      this._emit("error", { message: "Failed to load the networking library.", cause: err });
      return;
    }
    if (this._closed) return;

    if (this.role === "host") {
      // Deterministic id so the guest can find us from the invite link alone.
      this.peer = new Peer(this._hostId);
      this.peer.on("open", () => this._emit("open", { role: "host", id: this._hostId }));
      this.peer.on("connection", (conn) => this._bindConnection(conn));
    } else {
      // Guest gets a random id, then dials the host's deterministic id.
      this.peer = new Peer();
      this.peer.on("open", () => {
        this._emit("open", { role: "guest" });
        const conn = this.peer.connect(this._hostId, { reliable: true });
        this._bindConnection(conn);
      });
    }

    this.peer.on("error", (err) => {
      // "peer-unavailable" simply means the friend hasn't opened the link yet.
      this._emit("error", { message: err?.message || String(err), type: err?.type });
    });
    this.peer.on("disconnected", () => {
      // Lost the signaling socket — try to restore it so reconnection works.
      if (!this._closed) {
        try { this.peer?.reconnect(); } catch { /* noop */ }
      }
    });
  }

  _bindConnection(conn) {
    this.conn = conn;
    conn.on("open", () => this._emit("peerjoin", { at: Date.now() }));
    conn.on("data", (data) => {
      if (data && data.type === "message") this._emit("message", data.payload);
    });
    conn.on("close", () => this._emit("peerleave", { at: Date.now() }));
    conn.on("error", (err) => this._emit("error", { message: err?.message || String(err) }));
  }

  send(message) {
    if (this.conn && this.conn.open) {
      this.conn.send({ type: "message", payload: message });
    }
  }

  disconnect() {
    this._closed = true;
    try { this.conn?.close(); } catch { /* noop */ }
    try { this.peer?.destroy(); } catch { /* noop */ }
    this.conn = null;
    this.peer = null;
    this._emit("close", { reason: "disconnect" });
    this._handlers.clear();
  }
}

