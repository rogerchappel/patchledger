import assert from "node:assert/strict";
import test from "node:test";
import { isConventionalCommit } from "../src/policy.js";

test("isConventionalCommit accepts common conventional subjects", () => {
  assert.equal(isConventionalCommit("feat: add ledger writer"), true);
  assert.equal(isConventionalCommit("fix(cli): handle empty ranges"), true);
  assert.equal(isConventionalCommit("docs!: rewrite public API notes"), true);
});

test("isConventionalCommit rejects vague subjects", () => {
  assert.equal(isConventionalCommit("update stuff"), false);
  assert.equal(isConventionalCommit("feat add missing colon"), false);
});
