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
