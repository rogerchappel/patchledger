# PRD: patchledger

Status: in-progress
Decision: build now
Factory run: 2026-05-17 PM

## Pitch

`patchledger` turns a branch's commits and diffs into an auditable patch ledger: intent, touched files, risk, tests claimed, and review gaps. It is a changelog for reviewers who care about evidence. 📒

## Why It Matters

Agent-generated branches can have many commits. Reviewers need a compact, deterministic ledger that explains what changed, where risk lives, and whether verification evidence exists. This improves review without requiring a hosted service.

## Qualification

### Pub Test

"Run `patchledger write` before pushing and get a clean review packet with missing-test warnings."

### Source / Inspiration

Inspired by Git patch series cover letters, conventional commits, branch review summaries, and Roger's BranchBrief/OSS factory workflows. It is adjacent to branch summary tools but focused on a local evidence ledger and fixture-backed policy checks.

### V1 Scope

- TypeScript CLI package.
- Analyze git commits between base and HEAD, changed files, commit messages, diff stats, and optional test logs.
- Emit Markdown and JSON ledgers with per-commit intent, files, risk hints, and verification evidence.
- Check conventional commit format, oversized commits, mixed concerns, missing tests, and risky file classes.
- Support `patchledger verify` to fail on policy thresholds.
- Fixture-backed tests with synthetic git repos.

## Out of Scope

- AI summarization.
- Posting PR comments.
- Enforcing organization-wide policy beyond local config.
- Rewriting commits.

## CLI Sketch

```bash
patchledger write --base origin/main --out docs/PATCH_LEDGER.md
patchledger verify --base main --max-files-per-commit 3
patchledger write --test-log .logs/validate.txt --format json
```

## Verification

Run `npm test`, `npm run check`, `npm run build`, `npm run smoke`, `bash scripts/validate.sh`, and one smoke against a fixture git repo.

## Agent Prompt

Build `patchledger` as a deterministic local git review ledger CLI. Keep it useful for reviewers and strict enough to catch weak agent commit hygiene.

