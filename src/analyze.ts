import { assertGitRange, changedFiles, listCommitFiles, listCommits, resolveRepoRoot } from "./git.js";
import { commitMentionsTests, readTestEvidence } from "./evidence.js";
import { evaluatePolicy, isConventionalCommit } from "./policy.js";
import { fileRiskHints, inferMixedConcern } from "./risk.js";
import type { AnalyzeOptions, CommitEvidence, PatchLedger } from "./types.js";

export async function analyzePatch(options: AnalyzeOptions): Promise<PatchLedger> {
  await assertGitRange(options.repo, options.base, options.head);

  const [repoRoot, commits, changedFileList, globalTestEvidence] = await Promise.all([
    resolveRepoRoot(options.repo),
    listCommits(options.repo, options.base, options.head),
    changedFiles(options.repo, options.base, options.head),
    readTestEvidence(options.testLog),
  ]);

  const entries: CommitEvidence[] = [];
  for (const commit of commits) {
    const files = await listCommitFiles(options.repo, commit.hash);
    const totalAdditions = files.reduce((sum, file) => sum + file.additions, 0);
    const totalDeletions = files.reduce((sum, file) => sum + file.deletions, 0);
    entries.push({
      commit,
      files,
      totalAdditions,
      totalDeletions,
      riskHints: fileRiskHints(files),
      testEvidence: commitMentionsTests(commit.subject, commit.body),
      conventional: isConventionalCommit(commit.subject),
      mixedConcern: inferMixedConcern(files),
    });
  }

  const allRiskHints = [...new Set(entries.flatMap((entry) => entry.riskHints))].sort();
  const totalAdditions = entries.reduce((sum, entry) => sum + entry.totalAdditions, 0);
  const totalDeletions = entries.reduce((sum, entry) => sum + entry.totalDeletions, 0);

  const issues = evaluatePolicy(entries, {
    maxFilesPerCommit: options.maxFilesPerCommit,
    maxLinesPerCommit: options.maxLinesPerCommit,
    allowMissingTests: options.allowMissingTests,
    hasGlobalTestEvidence: globalTestEvidence.length > 0,
  });

  return {
    schemaVersion: 1,
    summary: {
      base: options.base,
      head: options.head,
      generatedAt: new Date().toISOString(),
      repoRoot,
      commitCount: entries.length,
      changedFileCount: changedFileList.length,
      totalAdditions,
      totalDeletions,
      riskHints: allRiskHints,
      verificationEvidence: globalTestEvidence,
    },
    commits: entries,
    issues,
  };
}
