# Livva Agent

Livva Agent is a full-stack prototype pairing a FastAPI backend with a Next.js 16 front end. The frontend is driven by React 19, Tailwind 4, Clerk authentication, and Prisma for database interactions, while the backend exposes a simple FastAPI service that can be extended with new endpoints.

## Repository layout

- `backend/` – FastAPI application (`main.py`) packaged with `pyproject.toml` and `requirements.txt`. Use [`uvicorn`](https://www.uvicorn.org/) (or the `uv` CLI) to serve it.
- `frontend/` – Next.js 16 app created with `create-next-app`, plus Prisma schema, Clerk config, and Tailwind CSS 4 utilities.

## Prerequisites

- **Node.js** `20.x` or newer (Next 16 + React 19)
- **pnpm** (recommended to honor `pnpm-lock.yaml`, though `npm`/`yarn` also work)
- **Python** `3.13+`
- **Git** (for cloning and managing the repo)

## Backend setup

1. `cd backend`
2. Create and activate a virtual environment (`python -m venv .venv && source .venv/bin/activate`)
3. Install dependencies: `pip install -r requirements.txt` or `pip install .`
4. Start the server: `uvicorn main:app --reload --port 8000` (or `uv run --reload main:app`)

The root path (`GET /`) currently returns `{"Hello": "World"}` and serves as a placeholder for future APIs.

## Frontend setup

1. `cd frontend`
2. Copy `env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `DATABASE_URL` (used by Prisma)
3. Install node modules: `pnpm install`
4. Prisma will run `prisma generate` automatically via `postinstall`, but you can also seed data with `pnpm db:seed`
5. Start the dev server: `pnpm dev` and visit [http://localhost:3000](http://localhost:3000)

### Useful scripts (frontend)

- `pnpm dev` – development server at `:3000`
- `pnpm build` – production build
- `pnpm start` – serve the production build
- `pnpm lint` – run ESLint
- `pnpm generate:properties` – run `tsx scripts/generate-properties.ts`
- `pnpm db:seed` – apply Prisma seed logic

## Connecting frontend ↔ backend

Both servers run independently (frontend on `:3000`, backend on `:8000` by default). During development you can point the frontend API calls to the backend using full URLs or configure a proxy (e.g., via Next.js rewrites or a reverse proxy).

## Next steps

- Expand the FastAPI backend with real business logic or additional routes.
- wire the frontend to backend APIs and Clerk-authenticated flows.
- Add tests (Pytest for backend, Jest/Playwright for frontend) as features stabilize.
