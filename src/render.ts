import type { PatchLedger, PolicyIssue } from "./types.js";

export function renderJson(ledger: PatchLedger): string {
  return JSON.stringify(ledger, null, 2) + "\n";
}

export function renderMarkdown(ledger: PatchLedger): string {
  const lines: string[] = [];
  const summary = ledger.summary;

  lines.push("# Patch Ledger");
  lines.push("");
  lines.push("| Field | Value |");
  lines.push("| --- | --- |");
  lines.push("| Base | " + escapePipe(summary.base) + " |");
  lines.push("| Head | " + escapePipe(summary.head) + " |");
  lines.push("| Commits | " + summary.commitCount + " |");
  lines.push("| Changed files | " + summary.changedFileCount + " |");
  lines.push("| Diff stat | +" + summary.totalAdditions + " / -" + summary.totalDeletions + " |");
  lines.push("| Generated | " + summary.generatedAt + " |");
  lines.push("");

  lines.push("## Review Gaps");
  lines.push("");
  if (ledger.issues.length === 0) {
    lines.push("- None found.");
  } else {
    for (const issue of ledger.issues) {
      lines.push("- " + formatIssue(issue));
    }
  }
  lines.push("");

  lines.push("## Risk Hints");
  lines.push("");
  if (summary.riskHints.length === 0) {
    lines.push("- No risky file classes detected.");
  } else {
    for (const hint of summary.riskHints) {
      lines.push("- " + hint);
    }
  }
  lines.push("");

  lines.push("## Verification Evidence");
  lines.push("");
  const commitEvidence = ledger.commits.flatMap((entry) => entry.testEvidence);
  const evidence = [...summary.verificationEvidence, ...commitEvidence];
  if (evidence.length === 0) {
    lines.push("- Missing. Bring receipts before asking for review.");
  } else {
    for (const item of evidence) {
      lines.push("- " + item);
    }
  }
  lines.push("");

  lines.push("## Commits");
  lines.push("");
  for (const entry of ledger.commits) {
    lines.push("### " + entry.commit.shortHash + " " + entry.commit.subject);
    lines.push("");
    lines.push("- Author: " + entry.commit.authorName + " <" + entry.commit.authorEmail + ">");
    lines.push("- Date: " + entry.commit.authorDate);
    lines.push("- Files: " + entry.files.length);
    lines.push("- Diff stat: +" + entry.totalAdditions + " / -" + entry.totalDeletions);
    lines.push("- Conventional commit: " + (entry.conventional ? "yes" : "no"));
    lines.push("- Mixed concern: " + (entry.mixedConcern ? "yes" : "no"));
    lines.push("");
    if (entry.riskHints.length > 0) {
      lines.push("Risk hints:");
      for (const hint of entry.riskHints) {
        lines.push("- " + hint);
      }
      lines.push("");
    }
    lines.push("Files:");
    for (const file of entry.files) {
      lines.push("- " + file.path + " +" + file.additions + " / -" + file.deletions);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function formatIssue(issue: PolicyIssue): string {
  const commit = issue.commit ? " [" + issue.commit + "]" : "";
  return "**" + issue.level.toUpperCase() + "** " + issue.code + commit + ": " + issue.message;
}

function escapePipe(value: string): string {
  return value.replace(/\|/g, "\\|");
}
