import crypto from 'node:crypto'
import { VAULT_ID } from './store.js'

// Same interface as the JSON Store, backed by Postgres. `db` is anything with
// query(sql, params) → { rows } — a pg.Pool in production, PGlite in tests.

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS repos (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL DEFAULT '',
    official boolean NOT NULL DEFAULT false,
    created_by jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS items (
    id text PRIMARY KEY,
    seq bigserial,
    repo_id text NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
    title text NOT NULL,
    branch text NOT NULL,
    topic text NOT NULL,
    year integer,
    problem text NOT NULL,
    solution text NOT NULL,
    source text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id text PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    salt text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower ON users (lower(email))`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token text PRIMARY KEY,
    kind text NOT NULL,
    user_id text REFERENCES users(id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS taxonomies (
    kind text NOT NULL,
    value text NOT NULL,
    position bigint NOT NULL,
    PRIMARY KEY (kind, value)
  )`,
]

const repoRow = (r) => ({
  id: r.id,
  name: r.name,
  description: r.description,
  official: r.official,
  createdBy: r.created_by,
  createdAt: r.created_at,
  ...(r.item_count !== undefined && { itemCount: Number(r.item_count) }),
})

const itemRow = (r) => ({
  id: r.id,
  repoId: r.repo_id,
  title: r.title,
  branch: r.branch,
  topic: r.topic,
  year: r.year,
  problem: r.problem,
  solution: r.solution,
  source: r.source,
})

const userRow = (r) =>
  r && { id: r.id, name: r.name, email: r.email, passwordHash: r.password_hash, salt: r.salt }

export class PgStore {
  constructor(db) {
    this.db = db
  }

  async init() {
    for (const stmt of SCHEMA) await this.db.query(stmt)
    await this.db.query(
      `INSERT INTO repos (id, name, description, official)
       VALUES ($1, $2, $3, true) ON CONFLICT (id) DO NOTHING`,
      [
        VAULT_ID,
        'The Olympiad Vault',
        'The official repository — curated problems with verified sources.',
      ]
    )
    return this
  }

  async #absorbTaxonomy(item) {
    for (const [kind, value] of [
      ['branch', item.branch],
      ['topic', item.topic],
    ]) {
      await this.db.query(
        `INSERT INTO taxonomies (kind, value, position)
         SELECT $1, $2, COALESCE(MAX(position), 0) + 1 FROM taxonomies
         ON CONFLICT (kind, value) DO NOTHING`,
        [kind, value]
      )
    }
  }

  async taxonomies() {
    const { rows } = await this.db.query(
      'SELECT kind, value FROM taxonomies ORDER BY position'
    )
    return {
      branches: rows.filter((r) => r.kind === 'branch').map((r) => r.value),
      topics: rows.filter((r) => r.kind === 'topic').map((r) => r.value),
    }
  }

  async listRepos() {
    const { rows } = await this.db.query(
      `SELECT r.*, COUNT(i.id) AS item_count
       FROM repos r LEFT JOIN items i ON i.repo_id = r.id
       GROUP BY r.id ORDER BY r.created_at`
    )
    return rows.map(repoRow)
  }

  async getRepo(id) {
    const { rows } = await this.db.query('SELECT * FROM repos WHERE id = $1', [id])
    return rows[0] ? repoRow(rows[0]) : null
  }

  async createRepo({ name, description, createdBy }) {
    const { rows } = await this.db.query(
      `INSERT INTO repos (id, name, description, official, created_by)
       VALUES ($1, $2, $3, false, $4) RETURNING *`,
      [crypto.randomUUID(), name, description, createdBy ?? null]
    )
    return repoRow(rows[0])
  }

  async listItems({ branch, topic, repo } = {}) {
    const { rows } = await this.db.query(
      `SELECT * FROM items
       WHERE ($1::text IS NULL OR branch = $1)
         AND ($2::text IS NULL OR topic = $2)
         AND ($3::text IS NULL OR repo_id = $3)
       ORDER BY seq`,
      [branch ?? null, topic ?? null, repo ?? null]
    )
    return rows.map(itemRow)
  }

  async getItem(id) {
    const { rows } = await this.db.query('SELECT * FROM items WHERE id = $1', [id])
    return rows[0] ? itemRow(rows[0]) : null
  }

  async createItem(fields) {
    const { rows } = await this.db.query(
      `INSERT INTO items (id, repo_id, title, branch, topic, year, problem, solution, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        crypto.randomUUID(),
        fields.repoId,
        fields.title,
        fields.branch,
        fields.topic,
        fields.year ?? null,
        fields.problem,
        fields.solution,
        fields.source ?? '',
      ]
    )
    await this.#absorbTaxonomy(fields)
    return itemRow(rows[0])
  }

  // repo_id is fixed at creation — items can't move between repositories.
  async updateItem(id, fields) {
    const { rows } = await this.db.query(
      `UPDATE items SET title = $2, branch = $3, topic = $4, year = $5,
         problem = $6, solution = $7, source = $8
       WHERE id = $1 RETURNING *`,
      [
        id,
        fields.title,
        fields.branch,
        fields.topic,
        fields.year ?? null,
        fields.problem,
        fields.solution,
        fields.source ?? '',
      ]
    )
    if (!rows[0]) return null
    await this.#absorbTaxonomy(fields)
    return itemRow(rows[0])
  }

  async deleteItem(id) {
    const { rows } = await this.db.query('DELETE FROM items WHERE id = $1 RETURNING id', [id])
    return rows.length > 0
  }

  async createUser({ name, email, passwordHash, salt }) {
    const { rows } = await this.db.query(
      `INSERT INTO users (id, name, email, password_hash, salt)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [crypto.randomUUID(), name, email, passwordHash, salt]
    )
    return userRow(rows[0])
  }

  async getUser(id) {
    const { rows } = await this.db.query('SELECT * FROM users WHERE id = $1', [id])
    return userRow(rows[0]) ?? null
  }

  async getUserByEmail(email) {
    const { rows } = await this.db.query(
      'SELECT * FROM users WHERE lower(email) = lower($1)',
      [email]
    )
    return userRow(rows[0]) ?? null
  }

  async createSession({ token, kind, userId = null, ttlMs }) {
    await this.db.query('DELETE FROM sessions WHERE expires_at <= now()')
    await this.db.query(
      `INSERT INTO sessions (token, kind, user_id, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [token, kind, userId, new Date(Date.now() + ttlMs)]
    )
  }

  async getSession(token) {
    const { rows } = await this.db.query(
      'SELECT * FROM sessions WHERE token = $1 AND expires_at > now()',
      [token]
    )
    const s = rows[0]
    return s ? { token: s.token, kind: s.kind, userId: s.user_id } : null
  }
}

// Production entry point: connect to a real Postgres (Supabase, Neon, …).
export async function createPgStore(databaseUrl) {
  const { default: pg } = await import('pg')
  const local = /localhost|127\.0\.0\.1/.test(databaseUrl)
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: local ? undefined : { rejectUnauthorized: false },
    max: 5,
  })
  return new PgStore(pool).init()
}
