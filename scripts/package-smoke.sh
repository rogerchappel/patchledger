#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
package_dir="$(mktemp -d "${TMPDIR:-/tmp}/patchledger-package-smoke.XXXXXX")"
trap 'rm -rf "$package_dir"' EXIT

tarball_name="$(npm pack --pack-destination "$package_dir" --silent --prefix "$repo_root")"
consumer_dir="$package_dir/consumer"
mkdir "$consumer_dir"

cd "$consumer_dir"
npm init --yes >/dev/null
npm install --ignore-scripts --no-audit --no-fund "$package_dir/$tarball_name" >/dev/null

node --input-type=module --eval "await import('patchledger')"
"$consumer_dir/node_modules/.bin/patchledger" --help >/dev/null

printf 'Package smoke test passed: import and CLI entry points resolve from the packed tarball.\n'
