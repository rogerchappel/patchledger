import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { PatchLedgerError } from "./errors.js";
import type { FileChange, GitCommit } from "./types.js";

const execFileAsync = promisify(execFile);
const recordSeparator = "\u001e";
const fieldSeparator = "\u001f";

export async function resolveRepoRoot(repo: string): Promise<string> {
  return runGit(repo, ["rev-parse", "--show-toplevel"]).then((value) => value.trim());
}

export async function assertGitRange(repo: string, base: string, head: string): Promise<void> {
  await runGit(repo, ["rev-parse", "--verify", base]);
  await runGit(repo, ["rev-parse", "--verify", head]);
  await runGit(repo, ["merge-base", base, head]);
}

export async function listCommits(repo: string, base: string, head: string): Promise<GitCommit[]> {
  const pretty = [recordSeparator, "%H", "%h", "%s", "%b", "%an", "%ae", "%aI"].join(fieldSeparator);
  const output = await runGit(repo, ["log", "--reverse", "--pretty=format:" + pretty, base + ".." + head]);
  return output
    .split(recordSeparator)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const fields = entry.startsWith(fieldSeparator) ? entry.slice(fieldSeparator.length).split(fieldSeparator) : entry.split(fieldSeparator);
      const [hash, shortHash, subject, body, authorName, authorEmail, authorDate] = fields;
      return {
        hash,
        shortHash,
        subject: subject ?? "",
        body: body ?? "",
        authorName: authorName ?? "",
        authorEmail: authorEmail ?? "",
        authorDate: authorDate ?? "",
      };
    });
}

export async function listCommitFiles(repo: string, commit: string): Promise<FileChange[]> {
  const output = await runGit(repo, ["show", "--numstat", "--format=", "--find-renames", commit]);
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [additionsRaw, deletionsRaw, ...pathParts] = line.split(/\s+/);
      const path = pathParts.join(" ");
      return {
        path: normalizeRenamePath(path),
        additions: additionsRaw === "-" ? 0 : Number.parseInt(additionsRaw, 10),
        deletions: deletionsRaw === "-" ? 0 : Number.parseInt(deletionsRaw, 10),
        status: "modified",
      };
    });
}

export async function changedFiles(repo: string, base: string, head: string): Promise<string[]> {
  const output = await runGit(repo, ["diff", "--name-only", base + ".." + head]);
  return output.split("\n").map((line) => line.trim()).filter(Boolean);
}

async function runGit(repo: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", ["-C", repo, ...args], {
      maxBuffer: 1024 * 1024 * 20,
    });
    return stdout;
  } catch (error) {
    const maybe = error as { stderr?: string; message?: string };
    const detail = maybe.stderr?.trim() || maybe.message || "git command failed";
    throw new PatchLedgerError("git " + args.join(" ") + " failed: " + detail, 1);
  }
}

function normalizeRenamePath(path: string): string {
  const match = path.match(/^(.+) => (.+)$/);
  return match ? match[2] : path;
}
