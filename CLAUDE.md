@AGENTS.md

# Working on this repo

## Changes reach `main` only through a pull request

Every change to `main` must be traceable for tracking and audit, and `main`
deploys straight to production on Vercel.

- Never commit or push directly to `main`. Never merge a feature branch into
  `main` locally either: no `git merge`, fast-forward or rebase followed by a
  push to `main`.
- Do the work on a branch made from an up-to-date `main`, push that branch, and
  open a pull request into `main` with `gh pr create`. Its description says
  what changed, why, and how it was checked.
- Wait for CI on the pull request to pass. Merge only through the pull request
  (on GitHub or with `gh pr merge`), and only when the user says to ship it.
- This applies to every change, including small fixes and docs-only edits.
