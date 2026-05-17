import type { CommitEvidence, PolicyIssue } from "./types.js";

const conventionalPattern = /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\([\w.-]+\))?!?: .+/;

export function isConventionalCommit(subject: string): boolean {
  return conventionalPattern.test(subject);
}

export function evaluatePolicy(
  commits: CommitEvidence[],
  options: {
    maxFilesPerCommit: number;
    maxLinesPerCommit: number;
    allowMissingTests: boolean;
    hasGlobalTestEvidence: boolean;
  },
): PolicyIssue[] {
  const issues: PolicyIssue[] = [];

  if (commits.length === 0) {
    issues.push({
      level: "warning",
      code: "empty-range",
      message: "No commits were found in the selected range.",
    });
  }

  for (const entry of commits) {
    const commit = entry.commit.shortHash;

    if (!entry.conventional) {
      issues.push({
        level: "error",
        code: "non-conventional-commit",
        commit,
        message: "Commit subject is not Conventional Commits formatted: " + entry.commit.subject,
      });
    }

    if (entry.files.length > options.maxFilesPerCommit) {
      issues.push({
        level: "error",
        code: "oversized-commit",
        commit,
        message:
          "Commit touches " +
          entry.files.length +
          " files, above --max-files-per-commit " +
          options.maxFilesPerCommit +
          ".",
      });
    }

    const changedLines = entry.totalAdditions + entry.totalDeletions;
    if (changedLines > options.maxLinesPerCommit) {
      issues.push({
        level: "warning",
        code: "large-commit",
        commit,
        message:
          "Commit changes " +
          changedLines +
          " lines, above --max-lines-per-commit " +
          options.maxLinesPerCommit +
          ".",
      });
    }

    if (entry.mixedConcern) {
      issues.push({
        level: "warning",
        code: "mixed-concern",
        commit,
        message: "Commit appears to mix more than three file concerns.",
      });
    }
  }

  const hasCommitEvidence = commits.some((entry) => entry.testEvidence.length > 0);
  if (!options.allowMissingTests && !options.hasGlobalTestEvidence && !hasCommitEvidence) {
    issues.push({
      level: "error",
      code: "missing-test-evidence",
      message: "No test evidence was found. Pass --test-log or mention verification in a commit message.",
    });
  }

  return issues;
}

export function hasErrors(issues: PolicyIssue[]): boolean {
  return issues.some((issue) => issue.level === "error");
}
