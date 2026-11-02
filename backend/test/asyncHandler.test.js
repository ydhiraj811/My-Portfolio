import assert from "node:assert/strict";
import test from "node:test";
import { asyncHandler } from "../dist/middleware/asyncHandler.js";

test("async route rejections reach Express error middleware", async () => {
  const handler = asyncHandler(async () => {
    throw new Error("database unavailable");
  });

  const error = await new Promise((resolve) => {
    handler({}, {}, resolve);
  });

  assert.equal(error.message, "database unavailable");
});
