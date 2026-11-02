// SUPPORT-STU (2 Nov 2026): support lives inside Stu. The website's live chat widget and bot are gone.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => fs.readFileSync(path.join(app, f), "utf8");

const root = read("root.tsx");
assert.ok(!/ChatWidget/.test(root), "root.tsx still mentions ChatWidget");
assert.ok(!/chat-widget/.test(root), "root.tsx still imports the chat widget");
assert.ok(!fs.existsSync(path.join(app, "components/chat-widget.tsx")), "chat-widget.tsx is back");
assert.ok(!fs.existsSync(path.join(app, "routes/api.chat.tsx")), "api.chat.tsx is back");
// The old conversations stay readable for the admin.
assert.ok(fs.existsSync(path.join(app, "lib/chat/logger.server.ts")), "the chat log reader was deleted");
assert.ok(!/DROP\s+TABLE[^;]*support_chat_logs/i.test(read("lib/chat/logger.server.ts")), "support_chat_logs must never be dropped");

// No page tells people to use a chat bubble.
for (const f of ["routes/contact.tsx", "components/site-b2c/pages/ContactB2C.tsx"]) {
  assert.ok(!/chat bubble|live chat|support chat|the bubble/i.test(read(f)), `${f} still points at the chat`);
}
console.log("chat-retired: ok");
