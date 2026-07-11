import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../app.js'
import { seedIfEmpty } from '../seed.js'

// The full HTTP API suite, run against any store backend. `makeStore` returns
// { store, cleanup } — a JSON-file store or a Postgres store (PGlite in tests).
export function runApiSuite(name, makeStore) {
  describe(name, () => {
    let server, base, cleanup, store, token, userToken

    before(async () => {
      ;({ store, cleanup } = await makeStore())
      await seedIfEmpty(store)
      const app = createApp(store, { adminPassword: 'test-pw' })
      await new Promise((resolve) => {
        server = app.listen(0, resolve)
      })
      base = `http://localhost:${server.address().port}`
    })

    after(async () => {
      server.close()
      await cleanup?.()
    })

    const api = (p, opts) => fetch(base + p, opts)
    const json = (body, extra = {}) => ({
      method: 'POST',
      headers: { 'content-type': 'application/json', ...extra },
      body: JSON.stringify(body),
    })

    it('GET /api/items returns seed items and taxonomies', async () => {
      const res = await api('/api/items')
      assert.equal(res.status, 200)
      const data = await res.json()
      assert.equal(data.items.length, 10)
      assert.deepEqual(data.branches, ['Math', 'Physics', 'Chemistry'])
      assert.deepEqual(data.topics, ['Algebra', 'Kinematics', 'Chemical Equations'])
    })

    it('filtering by branch and topic is two-axis AND', async () => {
      const byBranch = await (await api('/api/items?branch=Physics')).json()
      assert.equal(byBranch.items.length, 3)
      assert.ok(byBranch.items.every((it) => it.branch === 'Physics'))

      const both = await (await api('/api/items?branch=Physics&topic=Kinematics')).json()
      assert.equal(both.items.length, 3)

      const empty = await (await api('/api/items?branch=Physics&topic=Algebra')).json()
      assert.equal(empty.items.length, 0)
    })

    it('GET single item and 404 for unknown id', async () => {
      const { items } = await (await api('/api/items')).json()
      const res = await api(`/api/items/${items[0].id}`)
      assert.equal(res.status, 200)
      assert.equal((await res.json()).title, items[0].title)

      assert.equal((await api('/api/items/nope')).status, 404)
    })

    it('login rejects wrong password, accepts right one', async () => {
      assert.equal((await api('/api/login', json({ password: 'wrong' }))).status, 401)
      const res = await api('/api/login', json({ password: 'test-pw' }))
      assert.equal(res.status, 200)
      token = (await res.json()).token
      assert.ok(token)
    })

    it('write endpoints reject missing/bad token', async () => {
      assert.equal((await api('/api/items', json({ title: 'x' }))).status, 401)
      assert.equal(
        (await api('/api/items', json({ title: 'x' }, { authorization: 'Bearer bogus' }))).status,
        401
      )
    })

    it('create, update, delete item round-trip (with new taxonomy value)', async () => {
      const auth = { authorization: `Bearer ${token}` }
      const fields = {
        title: 'Test Item',
        branch: 'Biology', // new branch — should join the taxonomy
        topic: 'Algebra',
        year: 2024,
        problem: 'What is $1+1$?',
        solution: 'It is $2$.',
        source: 'Test source',
      }
      const created = await (await api('/api/items', json(fields, auth))).json()
      assert.ok(created.id)
      assert.equal(created.branch, 'Biology')

      const { branches } = await (await api('/api/items')).json()
      assert.ok(branches.includes('Biology'))

      const updated = await (
        await api(`/api/items/${created.id}`, { ...json({ ...fields, title: 'Renamed' }, auth), method: 'PUT' })
      ).json()
      assert.equal(updated.title, 'Renamed')

      const del = await api(`/api/items/${created.id}`, { method: 'DELETE', headers: auth })
      assert.equal(del.status, 204)
      assert.equal((await api(`/api/items/${created.id}`)).status, 404)
    })

    it('signup creates an account; duplicate emails and bad input are rejected', async () => {
      assert.equal((await api('/api/signup', json({ name: 'A', email: 'not-an-email', password: 'secret1' }))).status, 400)
      assert.equal((await api('/api/signup', json({ name: 'A', email: 'a@b.co', password: 'shrt' }))).status, 400)

      const res = await api('/api/signup', json({ name: 'Zash', email: 'zash@example.com', password: 'secret1' }))
      assert.equal(res.status, 201)
      const body = await res.json()
      userToken = body.token
      assert.equal(body.user.name, 'Zash')
      assert.equal(body.user.passwordHash, undefined, 'no password material in responses')

      assert.equal(
        (await api('/api/signup', json({ name: 'Dup', email: 'ZASH@example.com', password: 'secret2' }))).status,
        409
      )
    })

    it('user login works and rejects wrong credentials', async () => {
      assert.equal((await api('/api/auth/login', json({ email: 'zash@example.com', password: 'wrong!' }))).status, 401)
      const res = await api('/api/auth/login', json({ email: 'zash@example.com', password: 'secret1' }))
      assert.equal(res.status, 200)
      assert.equal((await res.json()).user.email, 'zash@example.com')
    })

    it('repo creation needs a signed-in user and records the creator', async () => {
      assert.equal((await api('/api/repos', json({ name: 'No Auth' }))).status, 401)

      const auth = { authorization: `Bearer ${userToken}` }
      assert.equal((await api('/api/repos', json({ name: '   ' }, auth))).status, 400)

      const res = await api('/api/repos', json({ name: 'JILCF Grade 10', description: 'Our class problems' }, auth))
      assert.equal(res.status, 201)
      const repo = await res.json()
      assert.equal(repo.official, false)
      assert.equal(repo.createdBy.name, 'Zash')

      const { repos } = await (await api('/api/repos')).json()
      assert.ok(repos.some((r) => r.id === repo.id && r.createdBy.name === 'Zash'))
      assert.ok(repos.some((r) => r.id === 'vault' && r.official))
    })

    it('community repo items: full CRUD without any token; vault stays locked', async () => {
      const repo = await (
        await api('/api/repos', json({ name: 'Open Circle' }, { authorization: `Bearer ${userToken}` }))
      ).json()
      const fields = {
        title: 'Community Problem',
        branch: 'Math',
        topic: 'Algebra',
        problem: 'Is $2+2=4$?',
        solution: 'Yes: $2+2=4$.',
        repoId: repo.id,
      }

      // create / update / delete with NO authorization header
      const created = await (await api('/api/items', json(fields))).json()
      assert.equal(created.repoId, repo.id)

      const detail = await (await api(`/api/items/${created.id}`)).json()
      assert.equal(detail.repo.official, false)
      assert.equal(detail.repo.name, 'Open Circle')

      const updated = await (
        await api(`/api/items/${created.id}`, { ...json({ ...fields, title: 'Renamed', repoId: 'vault' }), method: 'PUT' })
      ).json()
      assert.equal(updated.title, 'Renamed')
      assert.equal(updated.repoId, repo.id, 'items cannot be moved into another repo')

      assert.equal(
        (await api(`/api/items/${created.id}`, { method: 'DELETE' })).status,
        204
      )

      // vault writes still refuse tokenless requests
      const vaultItem = (await (await api('/api/items?repo=vault')).json()).items[0]
      assert.equal((await api('/api/items', json({ ...fields, repoId: 'vault' }))).status, 401)
      assert.equal(
        (await api(`/api/items/${vaultItem.id}`, { ...json(fields), method: 'PUT' })).status,
        401
      )
      assert.equal((await api(`/api/items/${vaultItem.id}`, { method: 'DELETE' })).status, 401)
    })

    it('GET /api/items?repo= scopes results to one repository', async () => {
      const repo = await (
        await api('/api/repos', json({ name: 'Scope Test' }, { authorization: `Bearer ${userToken}` }))
      ).json()
      await api('/api/items', json({
        title: 'Scoped', branch: 'Math', topic: 'Algebra', problem: 'p', solution: 's', repoId: repo.id,
      }))
      const scoped = await (await api(`/api/items?repo=${repo.id}`)).json()
      assert.equal(scoped.items.length, 1)
      assert.equal(scoped.items[0].title, 'Scoped')
      const vault = await (await api('/api/items?repo=vault')).json()
      assert.ok(vault.items.every((it) => it.repoId === 'vault'))
    })

    it('create rejects missing required fields and bad year', async () => {
      const auth = { authorization: `Bearer ${token}` }
      const res = await api('/api/items', json({ title: 'Only title' }, auth))
      assert.equal(res.status, 400)
      const { error } = await res.json()
      assert.match(error, /branch/)

      const bad = await api(
        '/api/items',
        json(
          { title: 't', branch: 'b', topic: 'tp', problem: 'p', solution: 's', year: 'abc' },
          auth
        )
      )
      assert.equal(bad.status, 400)
    })

    it('sessions survive a server restart (fresh app instance, same store)', async () => {
      const app2 = createApp(store, { adminPassword: 'test-pw' })
      const server2 = await new Promise((resolve) => {
        const s = app2.listen(0, () => resolve(s))
      })
      try {
        const base2 = `http://localhost:${server2.address().port}`
        // Curator token issued by the FIRST instance must still authorize writes.
        const res = await fetch(`${base2}/api/items`, {
          ...json(
            { title: 'After restart', branch: 'Math', topic: 'Algebra', problem: 'p', solution: 's' },
            { authorization: `Bearer ${token}` }
          ),
        })
        assert.equal(res.status, 201)
        const created = await res.json()
        await fetch(`${base2}/api/items/${created.id}`, {
          method: 'DELETE',
          headers: { authorization: `Bearer ${token}` },
        })
      } finally {
        server2.close()
      }
    })
  })
}
