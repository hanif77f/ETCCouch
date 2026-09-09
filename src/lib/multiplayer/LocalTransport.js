import { Transport } from "./Transport";

/**
 * LocalTransport — "pass and play" on one device. There is no network; sends
 * are echoed back synchronously so games can use the exact same message flow
 * as real online play. Useful default and a reference implementation.
 */
export class LocalTransport extends Transport {
  async connect() {
    queueMicrotask(() => this._emit("open", { role: "host", local: true }));
  }

  send(message) {
    queueMicrotask(() => this._emit("message", message));
  }

  disconnect() {
    this._emit("close", { reason: "local-disconnect" });
    this._handlers.clear();
  }
}

