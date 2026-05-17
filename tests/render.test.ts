import assert from "node:assert/strict";
import test from "node:test";
import { renderMarkdown } from "../src/render.js";
import type { PatchLedger } from "../src/types.js";

test("renderMarkdown includes review gaps and commit evidence", () => {
  const ledger: PatchLedger = {
    schemaVersion: 1,
    summary: {
      base: "main",
      head: "HEAD",
      generatedAt: "2026-05-17T00:00:00.000Z",
      repoRoot: "/tmp/repo",
      commitCount: 1,
      changedFileCount: 1,
      totalAdditions: 2,
      totalDeletions: 0,
      riskHints: ["package metadata or scripts changed"],
      verificationEvidence: ["PASS npm test"],
    },
    commits: [
      {
        commit: {
          hash: "abc",
          shortHash: "abc",
          subject: "feat: demo",
          body: "",
          authorName: "Test",
          authorEmail: "test@example.invalid",
          authorDate: "2026-05-17T00:00:00.000Z",
        },
        files: [{ path: "package.json", additions: 2, deletions: 0, status: "modified" }],
        totalAdditions: 2,
        totalDeletions: 0,
        riskHints: ["package metadata or scripts changed"],
        testEvidence: [],
        conventional: true,
        mixedConcern: false,
      },
    ],
    issues: [{ level: "warning", code: "large-commit", message: "Large.", commit: "abc" }],
  };

  const markdown = renderMarkdown(ledger);
  assert.match(markdown, /# Patch Ledger/);
  assert.match(markdown, /Review Gaps/);
  assert.match(markdown, /feat: demo/);
  assert.match(markdown, /PASS npm test/);
});
