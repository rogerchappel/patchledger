# Changelog

All notable changes to this project will be documented in this file.

This project follows the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
format and uses semantic versioning when versioned releases are published.

## [Unreleased]

### Added

- Initial project setup.

### Fixed

- Preserve complete destination paths and line counts for renamed files, including paths with spaces.
- Make `scripts/package-smoke.sh` self-contained: it builds the src-only artifact itself before packing, so standalone invocation from a clean checkout no longer fails with `ERR_MODULE_NOT_FOUND` or leaks stale test artifacts.

## Release Links

- Unreleased:
  `https://github.com/rogerchappel/patchledger/compare/...HEAD`
- Latest release:
  `https://github.com/rogerchappel/patchledger/releases/latest`

Replace placeholder links once the first release tag exists.
