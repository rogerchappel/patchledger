import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflowUrl = new URL('../.github/workflows/release-dry-run.yml', import.meta.url);

test('release dry run watches every release-check input', async () => {
  const workflow = await readFile(workflowUrl, 'utf8');
  const watchedPaths = new Set(
    workflow
      .split('\n')
      .map((line) => line.match(/^      - (.+)$/)?.[1])
      .filter(Boolean),
  );

  const requiredPaths = [
    'releasebox.config.json',
    'package.json',
    'package-lock.json',
    'tsconfig*.json',
    'src/**',
    'tests/**',
    'scripts/package-smoke.sh',
    'scripts/release-guard.mjs',
    'scripts/release-guard.test.mjs',
    'scripts/release-dry-run.test.mjs',
    '.github/workflows/release*.yml',
  ];

  for (const path of requiredPaths) {
    assert.ok(watchedPaths.has(path), `release dry run must watch ${path}`);
  }
});
