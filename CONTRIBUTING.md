# Contributing to TouchCare Benefits Calculator

Thank you for helping improve the TouchCare benefits experience! This guide outlines how to get set up and the conventions we follow.

## Development Setup

1. Fork the repo and clone your fork.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` and fill in any required secrets.
4. Run `npm run dev` for the full-stack development server.

## Branching & Commits

- Create feature branches off `main` using the pattern `feature/short-description` or `fix/short-description`.
- Write clear, imperative commit messages (e.g., `Add PDF export for commuter scenarios`).
- Reference GitHub issues in commits/PRs when applicable.

## Quality Checklist

Before opening a pull request:

- [ ] `npm run lint`
- [ ] `npm run format`
- [ ] `npm run test`
- [ ] `npm run check`
- [ ] Update docs/README when behavior changes.

## Pull Requests

- Fill out the PR template, summarizing the change, testing, and screenshots when UI changes occur.
- Request a review from at least one maintainer.
- CI must pass before merge.

## Releases

- We follow semantic versioning. Tag releases with `vMAJOR.MINOR.PATCH` and update `CHANGELOG.md`.

## Questions?

Open a discussion or ping the TouchCare engineering team at engineering@touchcare.com.
