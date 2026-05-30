# Orchestration

## Release Candidate Flow

`patchledger` uses reviewed release candidates before public release automation runs.

1. Create a release candidate branch from `main`.
2. Keep release-readiness changes small and auditable.
3. Run the local release gate in `docs/TASKS.md`.
4. Push the release candidate branch.
5. Open or update the release candidate pull request with verification results.
6. Merge only after maintainer review.

## Release Automation

- CI validates normal pushes and pull requests.
- The release dry-run workflow proves package metadata and generated artifacts before tagging.
- `releasebox.config.json` keeps the release mode reviewed, creates GitHub releases, and keeps npm publishing disabled until explicitly enabled.

## Human Review Gates

- Confirm release notes are accurate.
- Confirm README and security posture are acceptable for the intended audience.
- Confirm whether this build should ship as a GitHub-only release or continue incubating before a broader package publish.
