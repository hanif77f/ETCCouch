import fs from "node:fs/promises";
import path from "node:path";

// Contact form submissions are stored the same way blog posts are — as a
// JSON file — so the form works end-to-end with no external backend.
const DATA_FILE = path.join(process.cwd(), "src", "data", "messages.json");

export async function saveMessage({ name, email, subject, message }) {
  let messages = [];
  try {
    messages = JSON.parse(await fs.readFile(DATA_FILE, "utf-8"));
  } catch {
    messages = [];
  }

  const entry = {
    id: Date.now().toString(36),
    name,
    email,
    subject: subject || "General inquiry",
    message,
    receivedAt: new Date().toISOString(),
  };

  messages.push(entry);
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(messages, null, 2), "utf-8");
  return entry;
}
