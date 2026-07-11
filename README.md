# Sumnia (v1)

A STEM & Math Olympiad problem repository. Students browse and filter
problems with worked solutions by **Branch × Topic**; a single curator adds
material through a password-gated admin view.

## Run it

```bash
npm install
npm run dev        # API on :3001 + Vite dev server on :5173
```

Open http://localhost:5173.

**Production mode** (one process serves everything):

```bash
npm run build
npm start          # http://localhost:3001
```

## Curator access

Open **Curator** in the nav. The curator password is read from the
`ADMIN_PASSWORD` environment variable — set it locally (e.g. an `.env` in your
shell) or in your host's dashboard. If it's unset, the app falls back to an
insecure `changeme` default and prints a warning, so always set a real one
before going public.

## Deploy (Render)

This is a full-stack app (React frontend + Express backend), so it needs a
Node host — static hosting like GitHub Pages can't run the API.

1. Push this repo to GitHub.
2. On [render.com](https://render.com): **New → Blueprint**, connect the repo.
   Render reads [`render.yaml`](render.yaml) — build `npm install && npm run
   build`, start `npm start`.
3. Set **`ADMIN_PASSWORD`** when prompted. Deploy.

## Database (durable accounts, repos, and sessions)

Without a database, data lives in a JSON file — fine locally, but on hosts
with ephemeral disks (like Render's free tier) accounts and community repos
reset on every restart. Point Sumnia at any Postgres to make everything
durable, including login sessions:

1. Create a free Postgres — e.g. [Supabase](https://supabase.com) (New
   project) or [Neon](https://neon.tech). Copy the **connection string**
   (Supabase: Connect → Session pooler URI, with your database password
   substituted in).
2. Set it as the **`DATABASE_URL`** environment variable (Render: service →
   Environment). The schema is created automatically on first boot, and the
   10 seed problems load into the vault if it's empty.

With `DATABASE_URL` unset the app falls back to the JSON-file store, so local
dev needs no setup. The Postgres store is covered by the same test suite via
PGlite (an in-process Postgres), so `npm test` exercises both backends.

## User accounts

Creating a community repository requires signing in (`/login`) with a name,
email, and password so repositories carry their creator's name. This is
separate from curator access. The Google/Facebook buttons are placeholders
for now. Browsing, and adding problems to existing community repositories,
needs no account.

In the form, write LaTeX inline as `$...$` or as display blocks with
`$$...$$` (rendered with KaTeX). Use `**bold**` for emphasis. "Preview math"
shows the rendered result before saving. Typing a new Branch or Topic value
adds it to the filter taxonomy automatically.

## Data

Everything lives in `server/data/items.json` — delete it to re-seed with the
10 starter problems on next start. Back it up by copying the file.

## Tests

```bash
npm test           # API tests: filtering, CRUD, auth
```

## Two tiers of repositories

- **The Olympiad Vault** — the official repository. Curator-verified sources,
  and every write requires the curator password.
- **Community repositories** — any signed-in user can create one (attributed
  to them); anyone can add, edit, or delete problems in it. Labeled as
  community content everywhere.

## App structure

- `/` — main menu: mascot hero, vault + community tiles, branch quick links
- `/repository` — The Olympiad Vault, with two-axis Branch × Topic filters
- `/community` — list community repositories or create your own
- `/r/:repoId` — browse a community repository (same two-axis filters)
- `/r/:repoId/contribute` — add or edit a community problem
- `/item/:id` — problem detail with reveal-able solution and provenance chip
- `/admin` — curator login and vault CRUD

Navigation lives in a side rail (desktop) or bottom dock (mobile). The gear
opens Settings: reduce motion, show solutions immediately, and problem
previews on cards — persisted in the browser.

## v1 scope

Repository (two-axis Branch × Topic filtering only — deliberately no third
axis), item detail with problem/solution, and the single-curator admin.
Forum, AI hints, user accounts, difficulty tags, and gamification are
explicitly out of scope for this version.
