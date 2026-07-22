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
  ].join("\n"));

  assert.deepEqual(evidence, []);
});

test("readTestEvidence accepts passing TAP and summary formats", async () => {
  const evidence = await evidenceFrom([
    "ok 1 - reports when a test failed",
    "PASS tests/feature.test.ts",
    "Tests: 5 passed, 0 failed, 5 total",
    "validation successful",
  ].join("\n"));

  assert.deepEqual(evidence, [
    "ok 1 - reports when a test failed",
    "PASS tests/feature.test.ts",
    "Tests: 5 passed, 0 failed, 5 total",
    "validation successful",
  ]);
});
