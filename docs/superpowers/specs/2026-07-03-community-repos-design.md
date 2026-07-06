# Sumnia — Community Repositories (2026-07-03)

## Purpose

Split the single repository into two tiers:

1. **The Olympiad Vault** — the official repository. Trusted, curated,
   sources verified. All writes require the curator password (unchanged).
2. **Community repositories** — anyone can create a repository and add,
   edit, or delete problems in it, with no password. Clearly labeled as
   community content, not curator-verified.

## Data model

- New `repos` collection: `{ id, name, description, official, createdAt }`.
  The vault is the built-in repo with `id: "vault"`, `official: true`.
- Items gain a `repoId`. Existing data files migrate automatically on load
  (missing `repos` → vault repo added, items assigned `repoId: "vault"`).
- Branch/Topic taxonomies stay **global** and extensible — the two-axis
  filter constraint applies inside every repository; the repository itself
  is a container, not a third filter axis.

## API

- `GET /api/repos` — all repos with item counts
- `POST /api/repos` — create community repo (no auth; name required)
- `GET /api/items?repo=<id>` — scope items to a repo
- Item writes: if the item's repo is official → curator token required;
  community repo → open. `repoId` defaults to `vault` on create and cannot
  be changed on update.

## Frontend

- `/repository` — The Olympiad Vault (verified badge, trust copy)
- `/community` — list community repos + create form
- `/r/:repoId` — browse a community repo (same two-axis filter UI),
  with an "Add a problem" action (no login)
- `/r/:repoId/contribute` — shared ItemForm (extracted from Admin) for
  community add/edit
- Item detail — provenance chip: "Vault · verified" (azure) or the
  community repo's name; community items get Edit/Delete actions inline
- Home — vault tile + community tile; side nav gains a Community entry

## Trust signaling

Vault items carry the verified chip everywhere; community pages carry a
one-line disclaimer that content is contributed and not curator-reviewed.
