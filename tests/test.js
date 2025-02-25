import assert from "node:assert";
import test from "node:test";
import {
  removeEscapeCharacters,
  removeURLFragment,
  removePercentEscapeSequences,
  removeTrailingLeadingDots,
  removeConsecutiveDots,
} from "../utils.js";

test("Remove all escape characters from url", () => {
  assert.strictEqual(removeEscapeCharacters("http://example.com/\nfoo"), "http://example.com/foo");
  assert.strictEqual(removeEscapeCharacters("http://example.com/\rfoo"), "http://example.com/foo");
  assert.strictEqual(removeEscapeCharacters("http://example.com/\tfoo"), "http://example.com/foo");
});

test("Remove the url fragment from the url", () => {
  assert.strictEqual(removeURLFragment("http://example.com/#frag"), "http://example.com/");
});

test("Remove percent escape sequences from the url", () => {
  assert.strictEqual(removePercentEscapeSequences("http://example.com/f%20o%20o"), "http://example.com/f+o+o");
});

test("Remove all trailing and leading dots in the url", () => {
  assert.strictEqual(removeTrailingLeadingDots("http://example.com."), "http://example.com");
  assert.strictEqual(removeTrailingLeadingDots(".http://example.com"), "http://example.com");
});

test("Remove all consecutive dots in the url", () => {
  assert.strictEqual(removeConsecutiveDots("http://example.com/.."), "http://example.com/.");
  assert.strictEqual(removeConsecutiveDots("http://example.com/../..."), "http://example.com/./.");
  assert.strictEqual(removeConsecutiveDots("http://example..com/"), "http://example.com/");
});
