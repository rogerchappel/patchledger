#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
package_dir="$(mktemp -d "${TMPDIR:-/tmp}/patchledger-package-smoke.XXXXXX")"
trap 'rm -rf "$package_dir"' EXIT

# Self-contained smoke: build the exact src-only artifact this script guards.
# The script must pass when invoked directly from a clean checkout, so it can
# never depend on a stale or pre-built dist/ left behind by another command.
if ! (cd "$repo_root" && npm run build); then
  echo "Package smoke test failed: the src-only build (npm run build) did not complete." >&2
  echo "Inspect the build failure, then re-run: bash scripts/package-smoke.sh" >&2
  exit 2
fi

for entry in dist/src/index.js dist/src/cli.js; do
  if [ ! -f "$repo_root/$entry" ]; then
    echo "Package smoke test failed: $entry is missing after the src-only build." >&2
    exit 2
  fi
done

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

printf 'Package smoke test passed: src-only artifact built from scratch; packed file list excludes tests; import and CLI entry points resolve from the exact tarball.\n'
