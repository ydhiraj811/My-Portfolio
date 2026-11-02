import assert from "node:assert/strict";
import test from "node:test";
import { errorHandler } from "../dist/middleware/errorHandler.js";

function responseStub() {
  return {
    code: 200,
    body: null,
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test("malformed JSON errors remain client errors", () => {
  const response = responseStub();
  errorHandler({ status: 400 }, {}, response, () => {});
  assert.equal(response.code, 400);
  assert.equal(response.body.message, "The request body is invalid.");
});

test("oversized JSON errors return 413", () => {
  const response = responseStub();
  errorHandler({ status: 413 }, {}, response, () => {});
  assert.equal(response.code, 413);
  assert.equal(response.body.message, "The request body is too large.");
});
