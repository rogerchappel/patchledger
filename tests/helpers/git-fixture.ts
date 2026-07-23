import { execFile } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface FixtureRepo {
  repo: string;
  testLog: string;
}

export interface RenameFixtureRepo extends FixtureRepo {
  renameCommit: string;
}

export async function createFixtureRepo(): Promise<FixtureRepo> {
  const repo = await mkdtemp(join(tmpdir(), "patchledger-fixture-"));
  await git(repo, ["init", "-b", "main"]);
  await git(repo, ["config", "user.name", "Patch Ledger Test"]);
  await git(repo, ["config", "user.email", "patchledger@example.invalid"]);

  await write(repo, "README.md", "# Fixture\n");
  await git(repo, ["add", "."]);
  await git(repo, ["commit", "-m", "chore: seed fixture repo"]);

  await git(repo, ["checkout", "-b", "feature/review-ledger"]);
  await write(repo, "src/feature.ts", "export const enabled = true;\n");
  await git(repo, ["add", "."]);
  await git(repo, ["commit", "-m", "feat: add review ledger feature", "-m", "Verified with npm test."]);

  await mkdir(join(repo, "tests"), { recursive: true });
  await write(repo, "tests/feature.test.ts", "import '../src/feature';\n");
  await git(repo, ["add", "."]);
  await git(repo, ["commit", "-m", "test: cover review ledger feature"]);

  const testLog = join(repo, "test.log");
  await writeFile(testLog, "PASS node --test tests/feature.test.ts\n", "utf8");

  return { repo, testLog };
}

export async function createPolicyFailureRepo(): Promise<FixtureRepo> {
  const fixture = await createFixtureRepo();
  await write(fixture.repo, "oops.txt", "missing convention\n");
  await git(fixture.repo, ["add", "."]);
  await git(fixture.repo, ["commit", "-m", "oops"]);
  return fixture;
}

export async function createRenameFixtureRepo(): Promise<RenameFixtureRepo> {
  const repo = await mkdtemp(join(tmpdir(), "patchledger-rename-fixture-"));
  await git(repo, ["init", "-b", "main"]);
  await git(repo, ["config", "user.name", "Patch Ledger Test"]);
  await git(repo, ["config", "user.email", "patchledger@example.invalid"]);

  await write(repo, "src/old/file name.txt", "first line\nsecond line\n");
  await write(repo, "old name.txt", "unchanged\n");
  await git(repo, ["add", "."]);
  await git(repo, ["commit", "-m", "chore: seed rename fixture"]);

  await git(repo, ["checkout", "-b", "feature/rename-files"]);
  await mkdir(join(repo, "src/new"), { recursive: true });
  await git(repo, ["mv", "src/old/file name.txt", "src/new/file name.txt"]);
  await write(repo, "src/new/file name.txt", "first line\nsecond line\nthird line\n");
  await git(repo, ["mv", "old name.txt", "new name.txt"]);
  await git(repo, ["commit", "-am", "refactor: rename fixture files"]);
  const { stdout } = await execFileAsync("git", ["-C", repo, "rev-parse", "HEAD"]);

  const testLog = join(repo, "test.log");
  await writeFile(testLog, "PASS rename fixture\n", "utf8");
  return { repo, testLog, renameCommit: stdout.trim() };
}

async function write(repo: string, path: string, content: string): Promise<void> {
  const target = join(repo, path);
  await mkdir(join(target, ".."), { recursive: true });
  await writeFile(target, content, "utf8");
}

async function git(repo: string, args: string[]): Promise<void> {
  await execFileAsync("git", ["-C", repo, ...args]);
}
