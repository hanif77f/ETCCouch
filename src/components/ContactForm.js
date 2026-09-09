"use client";

import { useActionState } from "react";
import { sendMessageAction } from "@/app/actions/contact-actions";

const initialState = { error: null, success: false };

const inputClass =
  "w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(sendMessageAction, initialState);

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/5 bg-white p-10 text-center shadow-sm">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h3 className="font-display text-xl font-bold text-ink">Message sent</h3>
        <p className="max-w-sm text-sm leading-6 text-muted">
          Thanks for reaching out — we&apos;ve received your message and will get back to you as soon as we can.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{state.error}</p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-semibold text-ink">
            Your name
          </label>
          <input id="name" name="name" required className={inputClass} placeholder="Jane Doe" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-ink">
            Email address
          </label>
          <input id="email" name="email" type="email" required className={inputClass} placeholder="jane@example.com" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="subject" className="text-sm font-semibold text-ink">
          Subject <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="subject" name="subject" className={inputClass} placeholder="What's this about?" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-semibold text-ink">
          Message
        </label>
        <textarea id="message" name="message" required rows={6} className={`${inputClass} resize-y`} placeholder="How can we help?" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex items-center justify-center rounded-md bg-brand px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
