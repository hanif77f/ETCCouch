"use server";

import { saveMessage } from "@/lib/messages";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendMessageAction(prevState, formData) {
  const name = (formData.get("name") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim();
  const subject = (formData.get("subject") || "").toString().trim();
  const message = (formData.get("message") || "").toString().trim();

  if (!name) return { error: "Please enter your name.", success: false };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address.", success: false };
  if (!message) return { error: "Please write a message.", success: false };

  await saveMessage({ name, email, subject, message });

  return { error: null, success: true };
}
