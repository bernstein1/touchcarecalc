# Architecture Overview

## Front-end

- **Framework**: React 18 with Vite for bundling and Hot Module Replacement.
- **UI System**: Tailwind CSS + shadcn/ui components themed to TouchCare guidelines.
- **State/Data**: React Query for async data fetching, React Hook Form for forms.
- **PDF Export**: `@react-pdf/renderer` templates in `client/src/lib/pdf`.

## API Layer

- **Serverless**: Vercel functions under `api/` expose `/api/calculations` endpoints backed by the shared Drizzle schema.
- **Legacy Local Server**: `server/index.ts` runs the same routes via Express for local development or self-hosted deployments.
- **Storage**: `MemStorage` keeps sessions in memory; swap for Postgres/Neon via Drizzle when persistence is required.

## Shared Modules

- `shared/schema.ts` houses TypeScript interfaces and Drizzle schemas reused across client/server.
- `client/src/lib/calculations.ts` centralizes the benefit math; unit tests target these functions.

## Cross-cutting Concerns

- **Styling tokens** in `client/src/index.css` store the brand palette and typography.
- **Testing** uses Vitest (`client/tests`) for calculator logic.
- **CI** (`.github/workflows/ci.yml`) runs linting, type checks, and tests on every push/PR.

## Future Enhancements

- Persist calculator sessions via Drizzle/Postgres.
- Expand e2e coverage (Playwright) for interactive smoke tests.
- Build Storybook docs for reusable components.
