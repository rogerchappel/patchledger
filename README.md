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

The package exposes the `patchledger` executable after installation. From this
checkout, `node ./dist/src/cli.js` runs the same CLI without installing it.
`--help` lists the options for each command. The package is not yet published,
so the examples below use the built checkout.

## Write a ledger

From a Git repository, write a Markdown ledger for commits reachable from
`HEAD` but not `main` (choose a base ref that exists in the target repo):

```sh
node /path/to/patchledger/dist/src/cli.js write \
  --repo . --base main --head HEAD --out patchledger.md
```

Replace `/path/to/patchledger` with the checkout location. `--out` writes the
ledger to the requested path; omit it to print to standard output. Use
`--format json` to write JSON instead of Markdown.

## Verify a ledger range

```sh
node /path/to/patchledger/dist/src/cli.js verify \
  --repo . --base main --head HEAD --test-log test.log \
  --max-files-per-commit 4
```

Verification checks the selected commit range against review-size limits and
supplied test evidence; it does not execute tests. The defaults are 8 files and
600 added-plus-deleted lines per commit. For example, a test log can be passed
with `--test-log test.log`, and limits can be overridden with
`--max-files-per-commit 4` and `--max-lines-per-commit 300`. A test log must
contain passing TAP lines (`ok 1 ...`) or an explicit successful summary (for
example, `Tests: 5 passed, 0 failed`). A command name alone is not proof of
success. Any explicit failure, nonzero failure/error summary, or nonzero exit
status invalidates passing lines in that log. Missing test evidence fails
verification unless `--allow-missing-tests` is supplied. Use `--json` for JSON
output.

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
