# patchledger

Patchledger is a local-first CLI for writing and verifying Markdown evidence
ledgers from Git commit ranges. It can report commit-level change size and
optional test-log evidence; it does not run the recorded tests or establish
that their results are trustworthy.

## Requirements

- Node.js 20 or later
- Git available on `PATH` for commands that inspect a repository

## Install from source

```sh
npm ci
npm run build
node ./dist/src/cli.js --help
```

The package exposes the `patchledger` executable after installation. When
working in this checkout, use `node ./dist/src/cli.js` (or `npx patchledger`
after installing the package) to invoke it.

## Write a ledger

From a Git repository, write a ledger for the commits reachable from `HEAD`
but not `main`:

```sh
node /path/to/patchledger/dist/src/cli.js write \
  --repo . --base main --head HEAD --out patchledger.md
```

Replace `/path/to/patchledger` with the checkout or installation location. The
base and head are Git revisions; choose a base that exists in the target
repository. The output is written to the requested path.

## Verify a ledger range

```sh
node /path/to/patchledger/dist/src/cli.js verify \
  --repo . --base main --head HEAD --test-log test.log \
  --max-files-per-commit 4
```

Verification checks the selected commit range against configured review-size
limits and supplied test evidence. It does not execute tests. A test log must
contain passing TAP lines (`ok 1 ...`) or an explicit successful summary (for
example, `Tests: 5 passed, 0 failed`). A command name alone is not proof of
success. Any explicit failure, nonzero failure/error summary, or nonzero exit
status invalidates passing lines in that log. Missing test evidence fails
verification unless `--allow-missing-tests` is supplied.

`--max-files-per-commit` and `--max-lines-per-commit` accept positive
base-10 integers only. Use `--help` on the `write` or `verify` command for the
complete option list.

## Verify this checkout

```sh
npm ci
npm run release:check
```

`npm run smoke` rebuilds and mutates `fixtures/smoke-repo`; run it only in a
checkout where that fixture state may be changed.

## Security and limitations

Patchledger operates on local Git metadata and optional caller-provided test
logs. It does not run tests, contact external services for ledger generation,
or independently validate the provenance of evidence. See [SECURITY.md](SECURITY.md)
for vulnerability reporting guidance.

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md). Licensed under the MIT License; see
[LICENSE](LICENSE).
