# patchledger

Local-first git patch evidence ledger CLI for reviewable branches.

## Status

This is an early v0.1.0 CLI for writing and verifying patch ledgers from local git history and optional test logs.

## Install

```sh
npm install
npm run build
```

## Use

Write a markdown ledger for a branch range:

```sh
node dist/src/cli.js write --repo . --base main --head HEAD --out patchledger.md
```

Verify a branch range against review-size and test-evidence policies:

```sh
node dist/src/cli.js verify --repo . --base main --head HEAD --test-log test.log
```

## Verify

```sh
npm run release:check
```
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
