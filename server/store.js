import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

export const VAULT_ID = 'vault'

const vaultRepo = () => ({
  id: VAULT_ID,
  name: 'The Olympiad Vault',
  description: 'The official repository — curated problems with verified sources.',
  official: true,
  createdAt: new Date().toISOString(),
})

// JSON-file persistence. Writes go through a temp-file rename so a crash
// mid-write can't corrupt the data file.
export class Store {
  constructor(dataPath) {
    this.dataPath = dataPath
    if (!existsSync(dataPath)) {
      mkdirSync(path.dirname(dataPath), { recursive: true })
      this.#write({ branches: [], topics: [], repos: [vaultRepo()], users: [], items: [] })
    } else {
      this.#migrate()
    }
  }

  // Data files written before community repos / user accounts existed.
  #migrate() {
    const data = this.#read()
    let changed = false
    if (!data.repos) {
      data.repos = [vaultRepo()]
      for (const item of data.items) item.repoId ??= VAULT_ID
      changed = true
    }
    if (!data.users) {
      data.users = []
      changed = true
    }
    if (changed) this.#write(data)
  }

  #read() {
    return JSON.parse(readFileSync(this.dataPath, 'utf8'))
  }

  #write(data) {
    const tmp = this.dataPath + '.tmp'
    writeFileSync(tmp, JSON.stringify(data, null, 2))
    renameSync(tmp, this.dataPath)
  }

  taxonomies() {
    const { branches, topics } = this.#read()
    return { branches, topics }
  }

  listRepos() {
    const { repos, items } = this.#read()
    return repos.map((repo) => ({
      ...repo,
      itemCount: items.filter((it) => it.repoId === repo.id).length,
    }))
  }

  getRepo(id) {
    return this.#read().repos.find((r) => r.id === id) ?? null
  }

  createRepo({ name, description, createdBy }) {
    const data = this.#read()
    const repo = {
      id: crypto.randomUUID(),
      name,
      description,
      official: false,
      createdBy: createdBy ?? null, // { id, name } of the signed-in user
      createdAt: new Date().toISOString(),
    }
    data.repos.push(repo)
    this.#write(data)
    return repo
  }

  createUser({ name, email, passwordHash, salt }) {
    const data = this.#read()
    const user = { id: crypto.randomUUID(), name, email, passwordHash, salt }
    data.users.push(user)
    this.#write(data)
    return user
  }

  getUser(id) {
    return this.#read().users.find((u) => u.id === id) ?? null
  }

  getUserByEmail(email) {
    const needle = email.toLowerCase()
    return this.#read().users.find((u) => u.email.toLowerCase() === needle) ?? null
  }

  listItems({ branch, topic, repo } = {}) {
    const { items } = this.#read()
    return items.filter(
      (it) =>
        (!branch || it.branch === branch) &&
        (!topic || it.topic === topic) &&
        (!repo || it.repoId === repo)
    )
  }

  getItem(id) {
    return this.#read().items.find((it) => it.id === id) ?? null
  }

  createItem(fields) {
    const data = this.#read()
    const item = { id: crypto.randomUUID(), ...fields }
    data.items.push(item)
    this.#absorbTaxonomy(data, item)
    this.#write(data)
    return item
  }

  updateItem(id, fields) {
    const data = this.#read()
    const idx = data.items.findIndex((it) => it.id === id)
    if (idx === -1) return null
    // repoId is fixed at creation — items can't move between repositories.
    const item = { ...data.items[idx], ...fields, id, repoId: data.items[idx].repoId }
    data.items[idx] = item
    this.#absorbTaxonomy(data, item)
    this.#write(data)
    return item
  }

  deleteItem(id) {
    const data = this.#read()
    const before = data.items.length
    data.items = data.items.filter((it) => it.id !== id)
    if (data.items.length === before) return false
    this.#write(data)
    return true
  }

  // Branch/topic lists are extensible: any new value used by an item joins them.
  #absorbTaxonomy(data, item) {
    if (!data.branches.includes(item.branch)) data.branches.push(item.branch)
    if (!data.topics.includes(item.topic)) data.topics.push(item.topic)
  }

  // Sessions persist in the data file so logins survive server restarts.
  createSession({ token, kind, userId = null, ttlMs }) {
    const data = this.#read()
    data.sessions = (data.sessions ?? []).filter((s) => s.expiresAt > Date.now())
    data.sessions.push({ token, kind, userId, expiresAt: Date.now() + ttlMs })
    this.#write(data)
  }

  getSession(token) {
    const s = (this.#read().sessions ?? []).find((s) => s.token === token)
    return s && s.expiresAt > Date.now() ? { token: s.token, kind: s.kind, userId: s.userId } : null
  }
}
