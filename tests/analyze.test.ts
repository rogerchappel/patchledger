import assert from "node:assert/strict";
import test from "node:test";
import { analyzePatch } from "../src/analyze.js";
import { hasErrors } from "../src/policy.js";
import { createFixtureRepo, createPolicyFailureRepo } from "./helpers/git-fixture.js";

test("analyzePatch builds a ledger from a real git range", async () => {
  const fixture = await createFixtureRepo();
  const ledger = await analyzePatch({
    repo: fixture.repo,
    base: "main",
    head: "feature/review-ledger",
    testLog: fixture.testLog,
    maxFilesPerCommit: 4,
    maxLinesPerCommit: 200,
    allowMissingTests: false,
  });

  assert.equal(ledger.summary.commitCount, 2);
  assert.equal(ledger.summary.changedFileCount, 2);
  assert.equal(ledger.summary.verificationEvidence.length, 1);
  assert.equal(hasErrors(ledger.issues), false);
});

test("analyzePatch reports policy errors for weak commit hygiene", async () => {
  const fixture = await createPolicyFailureRepo();
  const ledger = await analyzePatch({
    repo: fixture.repo,
    base: "main",
    head: "feature/review-ledger",
    testLog: fixture.testLog,
    maxFilesPerCommit: 4,
    maxLinesPerCommit: 200,
    allowMissingTests: false,
  });

  assert.equal(hasErrors(ledger.issues), true);
  assert.ok(ledger.issues.some((issue) => issue.code === "non-conventional-commit"));
});
