export type OutputFormat = "markdown" | "json";

export type CommandName = "write" | "verify";

export interface CliOptions {
  command: CommandName;
  repo: string;
  base: string;
  head: string;
  out?: string;
  format: OutputFormat;
  testLog?: string;
  maxFilesPerCommit: number;
  maxLinesPerCommit: number;
  allowMissingTests: boolean;
  json: boolean;
}

export interface GitCommit {
  hash: string;
  shortHash: string;
  subject: string;
  body: string;
  authorName: string;
  authorEmail: string;
  authorDate: string;
}

export interface FileChange {
  path: string;
  additions: number;
  deletions: number;
  status: string;
}

export interface CommitEvidence {
  commit: GitCommit;
  files: FileChange[];
  totalAdditions: number;
  totalDeletions: number;
  riskHints: string[];
  testEvidence: string[];
  conventional: boolean;
  mixedConcern: boolean;
}

export interface LedgerSummary {
  base: string;
  head: string;
  generatedAt: string;
  repoRoot: string;
  commitCount: number;
  changedFileCount: number;
  totalAdditions: number;
  totalDeletions: number;
  riskHints: string[];
  verificationEvidence: string[];
}

export interface PolicyIssue {
  level: "error" | "warning";
  code: string;
  message: string;
  commit?: string;
  path?: string;
}

export interface PatchLedger {
  schemaVersion: 1;
  summary: LedgerSummary;
  commits: CommitEvidence[];
  issues: PolicyIssue[];
}

export interface AnalyzeOptions {
  repo: string;
  base: string;
  head: string;
  testLog?: string;
  maxFilesPerCommit: number;
  maxLinesPerCommit: number;
  allowMissingTests: boolean;
}
