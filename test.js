import assert from "node:assert";
import test from "node:test";
import { removeEscapeCharacters } from "./utils.js";

test("Remove all escape characters from url", () => {
  assert.strictEqual(removeEscapeCharacters("http://example.com/\nfoo"), "http://example.com/foo");
});
