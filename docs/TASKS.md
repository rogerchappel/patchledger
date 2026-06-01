# Tasks

## Initial Public Build

Status: release candidate

### Completed

- TypeScript CLI package with `patchledger write` and `patchledger verify`.
- Git range analysis for commits, changed files, diff stats, risk hints, and review gaps.
- Markdown and JSON ledger rendering.
- Conventional Commit and patch hygiene policy checks.
- Optional test-log evidence extraction.
- Fixture-backed unit and smoke coverage.
- npm package dry-run coverage through `npm run release:check`.

### Release Gate

- Run `npm install` when dependencies are missing.
- Run `npm run release:check`.
- Run `releasebox check`.
- Run `releasebox notes`.
- Confirm `RELEASE_NOTES.md` exists and reflects the current release posture.
- Open or update the release candidate pull request for maintainer review.

### Follow-Up

- Replace generated README placeholder install/use examples with package-specific CLI examples.
- Replace generated security-policy placeholder text before a broad production announcement.
- Decide whether the first public tag should publish only a GitHub release or also publish to npm.
