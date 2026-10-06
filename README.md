# patchledger

Local-first git patch evidence ledger CLI for reviewable branches.

## Status

This is an early v0.1.0 CLI for writing and verifying patch ledgers from local git history and optional test logs.

## Install

```sh
npm install
npm run build
patchledger --help
```

After building, the declared `patchledger` executable is available from `node_modules/.bin`.
The help command should exit successfully and list the `write` and `verify`
commands plus their supported options; it does not inspect a repository.

## Use

Write a markdown ledger for a branch range:

```sh
patchledger write --repo . --base main --head HEAD --out patchledger.md
```

Verify a branch range against review-size and test-evidence policies:

```sh
patchledger verify --repo . --base main --head HEAD --test-log test.log
```

Test-log evidence accepts passing TAP lines (`ok 1 ...`) and explicit passing or
successful summaries such as `Tests: 5 passed, 0 failed`. A test command name
by itself is not proof of success. Test logs are evaluated as a whole: any
explicit failure, nonzero failed/error summary, or nonzero exit status
invalidates all passing lines in that log, so mixed results cannot be used as
global test evidence.

The `--max-files-per-commit` and `--max-lines-per-commit` values must be positive
base-10 integers made only of digits. Decimal values, signs, whitespace, numeric
suffixes, and non-finite values are rejected.

## Verify

```sh
npm run release:check
```

### Smoke fixture side effects

`npm run smoke` runs `fixtures/prepare-smoke-repo.sh`, which rebuilds and mutates
`fixtures/smoke-repo`. Run it from an isolated checkout, or review the fixture
state before and after the command; do not rely on uncommitted changes inside
that fixture being preserved.
## CLI Help Smoke

Confirm the packaged command starts and prints its help text before relying on a release tarball or downstream automation:

```bash
npm run build
node ./dist/src/cli.js --help
```

The command should exit successfully, print the available options, and avoid reading project files or contacting external services.

## Limitations

- Verification uses local git metadata and any test log supplied by the caller.
- Missing test evidence fails verification unless `--allow-missing-tests` is used.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations. Changes should be small, reviewable, and verified before review.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance.

## License

MIT
