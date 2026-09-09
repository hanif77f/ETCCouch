/**
 * Transport — abstract multiplayer networking interface.
 *
 * Games talk ONLY to this interface, never to a concrete network stack. This
 * keeps game logic and UI fully decoupled from how bytes move between players,
 * so a real signaling service (WebRTC, WebSocket relay, etc.) can be dropped in
 * later by adding a new Transport implementation — no game code changes.
 *
 * Lifecycle:
 *   connect()            -> Promise<void>   establish the session
 *   send(message)        -> void            broadcast a move/state to peers
 *   on(event, handler)   -> unsubscribe fn  subscribe to inbound events
 *   disconnect()         -> void            tear down
 *
 * Events emitted: "open" | "message" | "peerjoin" | "peerleave" | "close" | "error"
 */
export class Transport {
  constructor() {
    if (new.target === Transport) {
      throw new Error("Transport is abstract — extend it with a concrete implementation.");
    }
    this._handlers = new Map();
  }

  /** @returns {Promise<void>} */
  connect() {
    throw new Error("connect() not implemented");
  }

  /** @param {object} _message */
  send(_message) {
    throw new Error("send() not implemented");
  }

  disconnect() {
    throw new Error("disconnect() not implemented");
  }

  /** Subscribe to an event. Returns an unsubscribe function. */
  on(event, handler) {
    if (!this._handlers.has(event)) this._handlers.set(event, new Set());
    this._handlers.get(event).add(handler);
    return () => this._handlers.get(event)?.delete(handler);
  }

  /** @protected — implementations call this to fan out events. */
  _emit(event, payload) {
    this._handlers.get(event)?.forEach((h) => h(payload));
  }
}

