#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fixture="$repo_root/fixtures/smoke-repo"

trash_existing() {
  if [ -d "$fixture" ]; then
    if command -v trash >/dev/null 2>&1; then
      trash "$fixture"
    else
      rm -rf "$fixture"
    fi
  fi
}

write_file() {
  local path="$1"
  local content="$2"
  mkdir -p "$(dirname "$fixture/$path")"
  printf '%s' "$content" > "$fixture/$path"
}

trash_existing
mkdir -p "$fixture"

git -C "$fixture" init -b main >/dev/null
git -C "$fixture" config user.name "PatchLedger Fixture"
git -C "$fixture" config user.email "patchledger@example.invalid"

write_file "README.md" "# Smoke fixture
"
git -C "$fixture" add .
git -C "$fixture" commit -m "chore: seed smoke fixture" >/dev/null

git -C "$fixture" checkout -b feature/review-ledger >/dev/null
write_file "src/ledger.ts" "export function ledgerName(): string {
  return 'patchledger';
}
"
git -C "$fixture" add .
git -C "$fixture" commit -m "feat: add ledger module" -m "Verified with npm test." >/dev/null

write_file "tests/ledger.test.ts" "import { ledgerName } from '../src/ledger';

if (ledgerName() !== 'patchledger') {
  throw new Error('unexpected ledger name');
}
"
git -C "$fixture" add .
git -C "$fixture" commit -m "test: cover ledger module" >/dev/null

printf 'PASS node --test tests/ledger.test.ts\n' > "$fixture/test.log"

printf 'Prepared smoke fixture at %s\n' "$fixture"
