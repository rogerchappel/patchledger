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
- The release dry-run workflow proves tag parsing, exact-version detection, registry metadata verification, and single-artifact packaging without publishing.
- A `v<version>` tag must exactly match `package.json`. The release workflow packs once, publishes that tarball to npm with provenance only when the exact version is absent, verifies its registry integrity and CLI, and attaches the same tarball to the GitHub release.
- Releases are idempotent: an existing npm version is verified rather than republished, while an existing GitHub release has its notes and artifact repaired. A registry error other than an authoritative not-found response stops the workflow so it can be rerun safely.

## Human Review Gates

- Confirm release notes are accurate.
- Confirm README and security posture are acceptable for the intended audience.
- Confirm the package version and release tag are ready for an immutable npm publication.
