# Fixtures

prepare-smoke-repo.sh creates fixtures/smoke-repo, a disposable nested git repository used by npm run smoke and manual CLI examples.

The generated repository has:

- main with a seed commit
- feature/review-ledger with two Conventional Commits
- test.log containing passing verification evidence

The generated nested repository is ignored by git so repeated smoke runs stay clean.
