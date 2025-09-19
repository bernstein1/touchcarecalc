# TouchCare Benefits Calculator

A marketing-ready web experience for TouchCare clients and prospects to explore HSA/FSA, commuter, life insurance, and retirement benefits. The project pairs a React + Vite front-end with an Express/Drizzle API so sales, member support, and end users can model savings dynamically and export polished PDF summaries.

## Features

- 2025 IRS limits baked into every calculator with centralized constants.
- Guided UX with TouchCare branding, education tooltips, and PDF exports per scenario.
- Comparison tool to evaluate multiple benefit strategies side-by-side.
- Server-side session endpoints (Express + Drizzle ORM) ready for persistence or analytics.
- Fully typed TypeScript codebase shared between client and server.

## Getting Started

```bash
# install dependencies
npm install

# run the development server (client + api)
npm run dev

# type-check the project
npm run check

# lint and format checks
npm run lint
npm run format

# execute unit tests
npm run test
```

The app expects a `.env` file derived from `.env.example` for any secrets (database URLs, API keys, etc.). Vite will automatically reload the client at `http://localhost:5173`, while the Express server listens on `PORT` (defaults to 5000).

## Repository Structure

```
client/             # React front-end (Vite, Tailwind, shadcn)
server/             # Express API + session storage
shared/             # Types and schemas reused on both sides
client/src/lib/     # Calculator logic, PDF utilities, brand tokens
client/tests/       # Vitest unit tests
.github/workflows/  # CI pipelines (lint + test)
docs/               # Architecture notes and future ADRs
```

## Environment Variables

Create a `.env` file using [.env.example](./.env.example) as a template. Sensitive values (database URLs, auth secrets) must never be committed; CI/CD relies on the presence of these keys.

## Quality Tooling

- **TypeScript** for end-to-end typing.
- **ESLint + Prettier** for consistent style (`npm run lint`, `npm run format`).
- **Vitest** for unit tests (`npm run test`).
- **Git hooks** ready via Husky or lint-staged (add as needed).

## Continuous Integration

GitHub Actions automatically run linting and tests on every push/PR (`.github/workflows/ci.yml`). Dependabot keeps dependencies fresh (`.github/dependabot.yml`).

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for branching strategy, commit guidance, and review standards. All contributors must follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Security

See [SECURITY.md](./SECURITY.md) for responsible disclosure guidelines.

## License

Distributed under the MIT License. See [LICENSE](./LICENSE) for details.

---

> _A healthier understanding of healthcare._
