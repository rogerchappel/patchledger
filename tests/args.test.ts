import assert from "node:assert/strict";
import test from "node:test";
import { parseArgs } from "../src/args.js";
import { PatchLedgerError } from "../src/errors.js";

test("parseArgs reads write options", () => {
  const options = parseArgs([
    "write",
    "--repo",
    "demo",
    "--base",
    "origin/main",
    "--head",
    "HEAD",
    "--format",
    "json",
    "--out",
    "ledger.json",
    "--max-files-per-commit",
    "3",
  ]);

  assert.equal(options.command, "write");
  assert.equal(options.repo, "demo");
  assert.equal(options.base, "origin/main");
  assert.equal(options.format, "json");
  assert.equal(options.out, "ledger.json");
  assert.equal(options.maxFilesPerCommit, 3);
});

test("parseArgs rejects unknown options", () => {
  assert.throws(() => parseArgs(["write", "--wat"]), PatchLedgerError);
});

test("parseArgs rejects malformed limit values", () => {
  const flags = ["--max-files-per-commit", "--max-lines-per-commit"];
  const malformedValues = ["8oops", "1.5", "Infinity", "NaN", " 8", "8 ", "0", "-1"];

  for (const flag of flags) {
    for (const value of malformedValues) {
      assert.throws(
        () => parseArgs(["verify", flag, value]),
        (error: unknown) =>
          error instanceof PatchLedgerError &&
          error.exitCode === 2 &&
          error.message === `${flag} must be a positive integer`,
        `${flag} should reject ${JSON.stringify(value)}`,
      );
    }
  }
});
