import assert from "node:assert/strict";
import test from "node:test";

process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/contact-message-test";
process.env.JWT_SECRET = "contact-message-test-secret-that-is-long-enough";
process.env.ADMIN_EMAIL = "admin@example.com";
process.env.ADMIN_PASSWORD = "admin-test-password";

const { contactRoutes } = await import("../dist/routes/contactRoutes.js");

test("contact inbox listing is guarded by admin authentication", () => {
  const messagesRoute = contactRoutes.stack.find((layer) => layer.route?.path === "/messages");

  assert.ok(messagesRoute);
  assert.equal(messagesRoute.route.methods.get, true);
  assert.equal(messagesRoute.route.stack[0].name, "requireAuth");
});
