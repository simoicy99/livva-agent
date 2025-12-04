# Repository Guidelines

## Project Structure & Module Organization
- `index.ts` is the main runnable script; keep it in the root so `bun run index.ts` remains accurate as work progresses.
- `prisma/` houses the schema, migrations, and `prisma.config.ts`; regenerate the client output in `generated/prisma/` whenever the schema changes (e.g., `npx prisma generate`).
- `data/` stores raw assets such as `apartments.com-room-data.csv`; load these directly when processing data and avoid committing derived copies.
- Documentation notes (e.g., `README.md`, `CLAUDE.md`) stay alongside the code; add AGENTS.md only for process guidance so content stays focused.

## Build, Test, and Development Commands
- `bun install`: installs runtime and dev dependencies via Bun’s package manager; rerun after editing `package.json`.
- `bun run index.ts`: executes the TypeScript entry point inside Bun; use it to validate data-processing changes quickly.
- `npx prisma generate`: refreshes the generated client in `generated/prisma/` after schema edits; this output is treated as build artifacts.
- `bun run --help` or `bun --version`: explore Bun-specific tooling when you need context before running longer jobs.

## Coding Style & Naming Conventions
- Use two-space indentation and TypeScript ES module imports to match the current files; keep statements concise and avoid unused imports.
- Prefer `camelCase` for variables/functions, `PascalCase` for exported types/classes, and descriptive short filenames (e.g., `prisma/schema.prisma`).
- Target clarity over cleverness: add inline comments sparingly when logic deserves explanation, and rely on Bun/TypeScript linting in future if tools are introduced.
- Document any formatting or lint rules you add later so contributors can keep files consistent (e.g., `bun lint` once a linter is configured).

## Testing Guidelines
- No automated tests exist yet; when adding suites, place them under `tests/` or beside the module with a `.test.ts` suffix for immediate discoverability.
- Name tests by behavior, such as `process-room-data.test.ts`, so reviewers know what’s covered.
- Keep test execution simple (`bun test` once configured) and document any fixtures or env vars (e.g., `DATABASE_URL`) needed for reproducible runs.

## Commit & Pull Request Guidelines
- Mirror the Git history by writing imperative commit messages (e.g., “Update .gitignore …”) and keep them focused, under ~72 characters.
- Mention related issues/tickets in the commit body and call out breaking changes (like data migrations) explicitly.
- For pull requests, include a concise description, verification steps (e.g., “run `bun run index.ts`”), and note config needs. Attach screenshots only if the change adds a UI surface.

## Configuration Notes
- Prisma expects a PostgreSQL `DATABASE_URL` even if migrations are empty; set it in `.env` or your shell before running `bun run index.ts` or `npx prisma generate`.
- Treat `generated/prisma/` as build output—do not hand-edit it, and regenerate it after schema updates.
- Work with copies of `data/apartments.com-room-data.csv` when performing experiments so the committed source file remains a stable reference.
