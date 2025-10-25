## TestingTool

A simple full-stack testing/demo application (Node/Express backend + React/Vite frontend) with Playwright tests. This repository contains a MySQL-backed backend that exposes REST endpoints, a Vite+React frontend, and Playwright-based component/API/e2e tests.

This README explains how to set up the project, run the backend and frontend, seed the database, and run the Playwright tests (including headful UI runs so you can watch the browser interactions).

---

## Contents

- `backend/` — Node + Express API server (MySQL via `mysql2`).
- `frontend/` — React app built with Vite.
- `tests/` — Playwright tests with configs for component, API and e2e tests.
- `SQL_schema_V1.sql` — SQL schema you can run to create the database/tables.
- `uploads/` — static uploads served by the backend.

## Prerequisites

- Node.js (>=18 recommended)
- npm (bundled with Node)
- MySQL server accessible to your machine
- (Optional) Git

Note: Playwright will download browser binaries when you run `npx playwright install` (see Tests section).

## Quick setup (summary)

1. Configure and start MySQL and create a database (example name: `testingtool`).
2. Configure backend environment variables in `backend/.env` (sample below).
3. Install dependencies in `backend/`, `frontend/`, and `tests/`.
4. Run the DB schema `SQL_schema_V1.sql` to create tables, then run the seed script.
5. Start backend and frontend servers.
6. Run Playwright tests (headed if you want to watch UI interactions).

## Backend — setup and run

1. Install dependencies and configure env (from project root):

```powershell
cd backend
npm install
```

2. Create a `.env` file in `backend/` (example):

```
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=testingtool
DB_PORT=3306
# Don't set NODE_ENV=production locally when running the seed script
```

3. Create the database schema:

- If you have a MySQL client, run the SQL file `SQL_schema_V1.sql` in your MySQL server to create required tables. Example using the MySQL CLI:

```powershell
# from repository root (PowerShell)
mysql -u root -p testingtool < SQL_schema_V1.sql
```

Replace `root` and `testingtool` with your DB user and DB name.

4. Seed example data (safe guard: script refuses to run when NODE_ENV=production):

```powershell
# from backend folder
node scripts/seed.js
```

5. Start the server:

```powershell
# run in backend folder
npm run dev    # uses nodemon for development
# or for production-like start
npm start
```

By default the API server listens on port 5000. You should see "Server running on port 5000" in the console.

Notes about the backend
- Static files in `uploads/` are served at `/uploads` (e.g. `http://localhost:5000/uploads/foo.png`).
- The DB connection uses environment variables: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and optionally `DB_PORT`.

## Frontend — setup and run

1. Install dependencies and run dev server:

```powershell
cd frontend
npm install
npm run dev
```

2. Environment and API URL

- The frontend is a Vite app. If the frontend needs to call the backend on a different origin during development, set a Vite env variable like `VITE_API_BASE_URL` in `frontend/.env` (Vite exposes variables prefixed with `VITE_`):

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Then in the frontend code you can access it with `import.meta.env.VITE_API_BASE_URL`.

By default, the backend allows CORS, so you can also use the full backend URL in your client requests (e.g. `http://localhost:5000/api/...`).

Default Vite dev server port is 5173 (you'll see exact URL in the terminal after running `npm run dev`).

## Tests (Playwright)

The repository includes Playwright tests in the `tests/` folder with several npm scripts to run component, API and e2e tests.

Install test dependencies (from repo root or inside `tests/`):

```powershell
cd tests
npm install
# Install Playwright browsers
npx playwright install
```

Running tests (examples):

- Component tests (CT):

```powershell
cd tests
npm run test:component
```

- API tests:

```powershell
cd tests
npm run test:api
```

- E2E tests (headed — shows browser UI so you can watch interactions):

```powershell
cd tests
npm run test:e2e:headed
```

The `--headed` flag tells Playwright to run browsers with a visible UI so you can watch the test run.

If you prefer to run a single spec, use the Playwright CLI directly (example):

```powershell
npx playwright test tests/e2e/some.spec.js --headed
```

Playwright report

After running tests, you can view an HTML report for a configured run (some scripts place reports under `playwright-report/`):

```powershell
npx playwright show-report tests/playwright-report
```

## Running a typical local development + test flow

1. Start and prepare DB:

```powershell
cd backend
npm install
# ensure DB exists and run SQL_schema_V1.sql
node scripts/seed.js
```

2. Start backend:

```powershell
npm run dev
```

3. Start frontend (new terminal):

```powershell
cd frontend
npm install
npm run dev
```

4. In another terminal, run Playwright headed e2e tests (watch the UI):

```powershell
cd tests
npm install
npx playwright install
npm run test:e2e:headed
```

## Troubleshooting and tips

- If tests can't connect to the API, verify the backend is running on `http://localhost:5000` and that `DB_*` environment variables are correct.
- If Playwright reports missing browsers, run `npx playwright install` inside `tests/`.
- If the seed script exits immediately with a message about production, ensure `NODE_ENV` is not set to `production` when running `node scripts/seed.js`.
- If the frontend can't reach the API, set `VITE_API_BASE_URL` in `frontend/.env` to `http://localhost:5000/api` and restart the dev server.

## Project structure (high level)

- backend/
  - `server.js` — express server (listens on port 5000)
  - `db/connection.js` — MySQL pool and env variable usage
  - `routes/`, `controllers/`, `services/`, `models/` — API implementation
  - `scripts/seed.js` — example seed data
- frontend/ — Vite + React app
- tests/ — Playwright configs and specs

## A note about security

This repository is a demo/test tool. Do not use the default seeded credentials or the seed script in production. Keep `.env` files out of version control and use secure secrets for any production deployments.


