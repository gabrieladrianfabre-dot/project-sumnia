import express from 'express'
import crypto from 'node:crypto'
import { VAULT_ID } from './store.js'

const REQUIRED_FIELDS = ['title', 'branch', 'topic', 'problem', 'solution']
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

const hashPassword = (password, salt) => crypto.scryptSync(password, salt, 32).toString('hex')

// Never send password material to the client.
const publicUser = ({ id, name, email }) => ({ id, name, email })

// Express 4 doesn't catch rejected promises from async handlers.
const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next)

export function createApp(store, { adminPassword }) {
  const app = express()
  app.use(express.json({ limit: '1mb' }))

  // Sessions live in the store, so logins survive server restarts.
  const bearer = (req) => (req.headers.authorization ?? '').replace(/^Bearer /, '')

  async function sessionFor(req, kind) {
    const token = bearer(req)
    if (!token) return null
    const session = await store.getSession(token)
    return session?.kind === kind ? session : null
  }

  const isAuthed = async (req) => Boolean(await sessionFor(req, 'curator'))

  async function currentUser(req) {
    const session = await sessionFor(req, 'user')
    return session ? store.getUser(session.userId) : null
  }

  async function openSession(kind, userId = null) {
    const token = crypto.randomUUID()
    await store.createSession({ token, kind, userId, ttlMs: SESSION_TTL_MS })
    return token
  }

  function validateItem(body) {
    const missing = REQUIRED_FIELDS.filter(
      (f) => typeof body[f] !== 'string' || body[f].trim() === ''
    )
    if (missing.length) return { error: `Missing required fields: ${missing.join(', ')}` }
    const year = body.year === '' || body.year == null ? null : Number(body.year)
    if (year !== null && !Number.isInteger(year)) return { error: 'Year must be an integer' }
    return {
      fields: {
        title: body.title.trim(),
        branch: body.branch.trim(),
        topic: body.topic.trim(),
        year,
        problem: body.problem,
        solution: body.solution,
        source: typeof body.source === 'string' ? body.source.trim() : '',
      },
    }
  }

  app.post('/api/login', h(async (req, res) => {
    if (req.body?.password !== adminPassword) {
      return res.status(401).json({ error: 'Wrong password' })
    }
    res.json({ token: await openSession('curator') })
  }))

  // ---- User accounts (repo creators; separate from the curator) ----

  app.post('/api/signup', h(async (req, res) => {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : ''
    const password = typeof req.body?.password === 'string' ? req.body.password : ''
    if (!name || name.length > 60) {
      return res.status(400).json({ error: 'Name is required (60 characters max)' })
    }
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 120) {
      return res.status(400).json({ error: 'Enter a valid email address' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }
    if (await store.getUserByEmail(email)) {
      return res.status(409).json({ error: 'An account with this email already exists — sign in instead' })
    }
    const salt = crypto.randomBytes(16).toString('hex')
    const user = await store.createUser({
      name,
      email,
      passwordHash: hashPassword(password, salt),
      salt,
    })
    res.status(201).json({ token: await openSession('user', user.id), user: publicUser(user) })
  }))

  app.post('/api/auth/login', h(async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : ''
    const password = typeof req.body?.password === 'string' ? req.body.password : ''
    const user = email ? await store.getUserByEmail(email) : null
    const ok =
      user &&
      crypto.timingSafeEqual(
        Buffer.from(user.passwordHash, 'hex'),
        Buffer.from(hashPassword(password, user.salt), 'hex')
      )
    if (!ok) return res.status(401).json({ error: 'Wrong email or password' })
    res.json({ token: await openSession('user', user.id), user: publicUser(user) })
  }))

  // ---- Repositories ----

  app.get('/api/repos', h(async (_req, res) => {
    res.json({ repos: await store.listRepos() })
  }))

  // Creating a repository needs a signed-in user (or the curator), so every
  // community repo is attributed to its creator. No curator password involved.
  app.post('/api/repos', h(async (req, res) => {
    const user = await currentUser(req)
    const creator = user
      ? { id: user.id, name: user.name }
      : (await isAuthed(req))
        ? { id: 'curator', name: 'The Curator' }
        : null
    if (!creator) {
      return res.status(401).json({ error: 'Sign in to create a repository' })
    }
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
    const description =
      typeof req.body?.description === 'string' ? req.body.description.trim() : ''
    if (!name) return res.status(400).json({ error: 'Repository name is required' })
    if (name.length > 80) return res.status(400).json({ error: 'Name must be 80 characters or fewer' })
    if (description.length > 300) {
      return res.status(400).json({ error: 'Description must be 300 characters or fewer' })
    }
    res.status(201).json(await store.createRepo({ name, description, createdBy: creator }))
  }))

  app.get('/api/items', h(async (req, res) => {
    const { branch, topic, repo } = req.query
    res.json({
      ...(await store.taxonomies()),
      items: await store.listItems({ branch, topic, repo }),
    })
  }))

  app.get('/api/items/:id', h(async (req, res) => {
    const item = await store.getItem(req.params.id)
    if (!item) return res.status(404).json({ error: 'Item not found' })
    const repo = await store.getRepo(item.repoId)
    res.json({
      ...item,
      repo: repo ? { id: repo.id, name: repo.name, official: repo.official } : null,
    })
  }))

  // Writes to the vault need the curator token; community repos are open.
  const guardRepo = async (repo, req, res) => {
    if (repo.official && !(await isAuthed(req))) {
      res.status(401).json({ error: 'The vault is curator-only — sign in to edit it' })
      return false
    }
    return true
  }

  app.post('/api/items', h(async (req, res) => {
    const body = req.body ?? {}
    const repoId = typeof body.repoId === 'string' && body.repoId ? body.repoId : VAULT_ID
    const repo = await store.getRepo(repoId)
    if (!repo) return res.status(400).json({ error: 'Unknown repository' })
    if (!(await guardRepo(repo, req, res))) return
    const { error, fields } = validateItem(body)
    if (error) return res.status(400).json({ error })
    res.status(201).json(await store.createItem({ ...fields, repoId }))
  }))

  app.put('/api/items/:id', h(async (req, res) => {
    const existing = await store.getItem(req.params.id)
    if (!existing) return res.status(404).json({ error: 'Item not found' })
    const repo = await store.getRepo(existing.repoId)
    if (!(await guardRepo(repo, req, res))) return
    const { error, fields } = validateItem(req.body ?? {})
    if (error) return res.status(400).json({ error })
    res.json(await store.updateItem(req.params.id, fields))
  }))

  app.delete('/api/items/:id', h(async (req, res) => {
    const existing = await store.getItem(req.params.id)
    if (!existing) return res.status(404).json({ error: 'Item not found' })
    const repo = await store.getRepo(existing.repoId)
    if (!(await guardRepo(repo, req, res))) return
    await store.deleteItem(req.params.id)
    res.status(204).end()
  }))

  // eslint-disable-next-line no-unused-vars
  app.use('/api', (err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  })

  return app
}
