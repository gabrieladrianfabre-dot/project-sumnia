# Sumnia v1 — Design Spec (2026-07-02)

## Purpose

A fast, repository-only web app where students browse and filter STEM /
competition-math problems with solutions, and a single curator adds material
through a password-gated admin view. Local prototype with seed data.

## Decisions taken (user delegated or unstated)

1. **Filter axes are Branch × Topic.** The user's spec mentions
   "Competition + Topic" once in the section list, but the data model and the
   NAVIGATION PRINCIPLE both define the two axes as Branch × Topic. Competition
   provenance lives in the `source` field and is displayed, not filtered.
2. **Filter UI: pill/chip button groups** (one row per axis) rather than
   dropdowns — for a small initial content set this shows the whole
   classification space at a glance and takes one click per axis. Counts shown
   per pill; "All" pill per axis.
3. **Stack:** Vite + React frontend, Tailwind CSS v4, KaTeX for math,
   Express (Node) backend with a JSON-file store (`server/data/items.json`).
   Lightweight, zero database, easy for a solo curator to back up.
4. **Auth:** basic password gate only. `POST /api/login` with the curator
   password returns a session token (kept in memory server-side, sessionStorage
   client-side); all write endpoints require it. Password comes from
   `ADMIN_PASSWORD` env var, defaulting to `sumnia-admin` for the prototype.
5. **Extensible taxonomies:** branches and topics are stored as lists in the
   data file. The admin form lets the curator pick an existing value or type a
   new one, which is added to the taxonomy on save.
6. **Design language:** Apple-style liquid glass — translucent blurred panels,
   soft specular borders, dark futuristic base with an aurora accent palette.

## Explicitly out of scope (per user)

Forum, AI chat, social accounts, gamification, difficulty or any third filter
axis, multi-school support, research-paper features.

## Architecture

```
sumnia/
  server/            Express API + static hosting of built frontend
    index.js         app entry (port 3001)
    store.js         JSON-file persistence (read/write items.json atomically)
    data/items.json  { branches: [], topics: [], items: [] }
  src/               React app (Vite, port 5173 in dev, proxied /api)
    pages/Repository.jsx   browse + two-axis pill filters
    pages/ItemDetail.jsx   full problem + solution, KaTeX rendered
    pages/Admin.jsx        login gate + add/edit/delete form
    components/            Math renderer, item card, glass primitives
```

### API

- `GET  /api/items?branch=&topic=` — filtered list (also returns taxonomies)
- `GET  /api/items/:id` — single item
- `POST /api/login` — { password } → { token }
- `POST /api/items`, `PUT /api/items/:id`, `DELETE /api/items/:id` — token-gated

### Data model (item)

`{ id, title, branch, topic, year (nullable), problem, solution, source }`
Problem/solution are plain text with `$...$` / `$$...$$` LaTeX segments,
rendered client-side with KaTeX.

### Error handling

- API: 400 on missing required fields, 401 on bad/missing token, 404 on
  unknown id; JSON error bodies.
- Store: writes are serialized and written via temp-file rename to avoid
  corrupting items.json.
- Frontend: loading/error states on fetches; KaTeX renders with
  `throwOnError:false` so malformed LaTeX degrades to red source text instead
  of crashing.

### Testing

Node built-in test runner against the Express app on an ephemeral port:
filtering, CRUD, auth rejection paths. UI verified via live preview.

## Seed data

~10 items spanning Math/Algebra, Physics/Kinematics, Chemistry/Chemical
Equations, sourced from well-known competitions (AMC, IMO shortlist, IPhO,
ChO style) with LaTeX in both problems and solutions, so filtering and
rendering are testable end to end.
