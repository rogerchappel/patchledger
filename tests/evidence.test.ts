import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readTestEvidence } from "../src/evidence.js";

async function evidenceFrom(content: string): Promise<string[]> {
  const directory = await mkdtemp(join(tmpdir(), "patchledger-evidence-"));
  const testLog = join(directory, "test.log");
  try {
    await writeFile(testLog, content, "utf8");
    return await readTestEvidence(testLog);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("readTestEvidence excludes explicit failing statuses", async () => {
  const evidence = await evidenceFrom([
    "not ok 1 - suite failed",
    "FAIL tests/feature.test.ts",
    "Tests: 1 failed, 2 passed, 3 total",
    "npm test failed",
    "npm test exited with code 1",
    "pnpm test exit code: 2",
    "node --test returned exit status 9",
    "npm test: 1 failure, 8 passed",
  ].join("\n"));

  assert.deepEqual(evidence, []);
});

test("readTestEvidence does not treat command names alone as passing", async () => {
  const evidence = await evidenceFrom([
    "npm test",
    "pnpm test running",
    "node --test started",
  ].join("\n"));

  assert.deepEqual(evidence, []);
});

test("readTestEvidence rejects passing substrings and missing-test statements", async () => {
  const evidence = await evidenceFrom([
    "hook initialized",
    "book generated",
    "successor process started",
    "hook initialized but no tests were run",
    "Tests: 0 total",
    "No test files found, exiting with code 0",
  ].join("\n"));

  assert.deepEqual(evidence, []);
});

test("readTestEvidence accepts passing TAP and summary formats", async () => {
  const evidence = await evidenceFrom([
    "ok 1 - reports when a test failed",
    "PASS tests/feature.test.ts",
    "Tests: 5 passed, 0 failed, 5 total",
    "Test Suites: 2 passed, 2 total",
    "12 passing (245ms)",
    "smoke test passed",
    "validation successful",
  ].join("\n"));

  assert.deepEqual(evidence, [
    "ok 1 - reports when a test failed",
    "PASS tests/feature.test.ts",
    "Tests: 5 passed, 0 failed, 5 total",
    "Test Suites: 2 passed, 2 total",
    "12 passing (245ms)",
    "smoke test passed",
    "validation successful",
  ]);
});
