// Regression coverage for scripts/package-smoke.sh being self-contained:
// the smoke script must pass when invoked directly from a clean checkout
// (with no pre-built dist/), must rebuild before packing so stale test
// artifacts cannot leak into the tarball, and must fail fast with a clear
// message when the src-only build cannot run.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repoRoot = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
const nodeModulesPath = join(repoRoot, 'node_modules');
const RUN_TIMEOUT_MS = 180_000;

function makeCleanCopy() {
  const copy = mkdtempSync(join(tmpdir(), 'patchledger-package-smoke-test-'));
  cpSync(repoRoot, copy, {
    recursive: true,
    filter: (source) => {
      const relative = source.slice(repoRoot.length + 1);
      const top = relative.split(sep)[0];
      return top !== '.git' && top !== 'node_modules' && top !== 'dist' && top !== 'dist-test';
    },
  });
  symlinkSync(nodeModulesPath, join(copy, 'node_modules'), 'dir');
  return copy;
}

function runPackageSmoke(copy) {
  return spawnSync('bash', ['scripts/package-smoke.sh'], {
    cwd: copy,
    encoding: 'utf8',
    timeout: RUN_TIMEOUT_MS,
  });
}

function assertSmokePassed(run) {
  assert.equal(run.status, 0, `expected exit 0; stderr:\n${run.stderr}`);
  assert.match(run.stdout, /Package smoke test passed/);
  assert.doesNotMatch(run.stdout + run.stderr, /ERR_MODULE_NOT_FOUND/);
}

test('package-smoke passes standalone from a clean checkout with no dist/', () => {
  const copy = makeCleanCopy();
  try {
    assert.equal(existsSync(join(copy, 'dist')), false, 'work copy must start without dist/');
    assertSmokePassed(runPackageSmoke(copy));
  } finally {
    rmSync(copy, { recursive: true, force: true });
  }
});

test('package-smoke rebuilds before packing so stale test artifacts cannot leak', () => {
  const copy = makeCleanCopy();
  try {
    // Simulate a stale build created with the unfiltered tsconfig (which also
    // emits tests/) or by a previous manual tsc invocation.
    mkdirSync(join(copy, 'dist', 'tests'), { recursive: true });
    writeFileSync(join(copy, 'dist', 'tests', 'stale.test.js'), 'export const stale = true;\n');
    mkdirSync(join(copy, 'dist', 'src'), { recursive: true });
    writeFileSync(join(copy, 'dist', 'src', 'stale.js'), 'export const stale = true;\n');

    const run = runPackageSmoke(copy);
    assert.equal(run.status, 0, `expected exit 0; stderr:\n${run.stderr}`);
    assert.match(run.stdout, /Package smoke test passed/);
    assert.doesNotMatch(run.stdout + run.stderr, /test artifacts|ERR_MODULE_NOT_FOUND/);
  } finally {
    rmSync(copy, { recursive: true, force: true });
  }
});

test('package-smoke fails fast with a clear message when the src-only build cannot run', () => {
  const copy = makeCleanCopy();
  try {
    rmSync(join(copy, 'tsconfig.build.json'));

    const run = runPackageSmoke(copy);
    assert.notEqual(run.status, 0, 'expected a nonzero exit when the build is broken');
    assert.match(run.stderr, /src-only build \(npm run build\) did not complete/);
    assert.match(run.stderr, /bash scripts\/package-smoke\.sh/);
  } finally {
    rmSync(copy, { recursive: true, force: true });
  }
});
