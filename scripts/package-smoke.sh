#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
package_dir="$(mktemp -d "${TMPDIR:-/tmp}/patchledger-package-smoke.XXXXXX")"
trap 'rm -rf "$package_dir"' EXIT

pack_json="$package_dir/pack.json"
npm pack --json --pack-destination "$package_dir" --prefix "$repo_root" > "$pack_json"

tarball_name="$(node --input-type=module - "$pack_json" <<'NODE'
import { readFileSync } from 'node:fs';

const [{ filename, files }] = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const testArtifacts = files
  .map(({ path }) => path)
  .filter((path) =>
    path.startsWith('dist/tests/') ||
    path.startsWith('dist-test/') ||
    /(^|\/)tests?\//.test(path) ||
    /(^|\/)helpers?\//.test(path) ||
    /\.test\.(?:js|d\.ts|js\.map)$/.test(path),
  );

if (testArtifacts.length > 0) {
  console.error(`Packed package contains test artifacts:\n${testArtifacts.join('\n')}`);
  process.exit(1);
}

process.stdout.write(filename);
NODE
)"
consumer_dir="$package_dir/consumer"
mkdir "$consumer_dir"

cd "$consumer_dir"
npm init --yes >/dev/null
npm install --ignore-scripts --no-audit --no-fund "$package_dir/$tarball_name" >/dev/null

node --input-type=module --eval "await import('patchledger')"
"$consumer_dir/node_modules/.bin/patchledger" --help >/dev/null

printf 'Package smoke test passed: packed file list excludes tests; import and CLI entry points resolve from the exact tarball.\n'
