"use client";

import { useState } from "react";
import { Copy, Check, Link2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function InviteModal({ open, onClose, link }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { setCopied(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Invite a friend">
      <p className="mb-4 text-sm leading-relaxed text-muted">
        Share this link with a friend. When they open it, you&apos;ll be connected and the
        game will sync between you.
      </p>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5">
        <Link2 size={16} className="shrink-0 text-muted" />
        <input
          readOnly
          value={link}
          className="w-full bg-transparent text-sm text-fg outline-none"
          onFocus={(e) => e.target.select()}
        />
        <Button size="sm" onClick={copy} className="shrink-0">
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <p className="mt-4 text-xs text-muted">
        Keep this tab open — you&apos;re the host. As soon as your friend opens the link on their
        device, you&apos;ll be connected and moves will sync live.
      </p>
    </Modal>
  );
}

