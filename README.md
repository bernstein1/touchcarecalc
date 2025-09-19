# TouchCare Benefits Calculator

A marketing-ready web experience for TouchCare clients and prospects to explore HSA/FSA, commuter, life insurance, and retirement benefits. The project runs as a Vite-powered React SPA with optional serverless endpoints for persisting calculator sessions.

## Features

- 2025 IRS limits baked into every calculator with centralized constants.
- Guided UX with TouchCare branding, education tooltips, and PDF exports per scenario.
- Comparison tool to evaluate multiple benefit strategies side-by-side.
- Serverless API routes (`/api/calculations`) powered by the same Drizzle schemas, deployable on Vercel.
- Fully typed TypeScript codebase shared between client, shared logic, and API handlers.

## Getting Started

```bash
# install dependencies
npm install

# run the Vite dev server
npm run dev

# (optional) run the legacy Express server locally
npm run server:dev

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
api/                # Vercel serverless functions for calculations API
server/             # (Optional) Express server for local/legacy use
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
