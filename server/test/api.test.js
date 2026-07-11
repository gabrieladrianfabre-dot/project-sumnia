import path from 'node:path'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { Store } from '../store.js'
import { PgStore } from '../pg-store.js'
import { runApiSuite } from './api-suite.js'

runApiSuite('API — JSON store', async () => {
  const tmpDir = mkdtempSync(path.join(tmpdir(), 'sumnia-test-'))
  return {
    store: new Store(path.join(tmpDir, 'items.json')),
    cleanup: () => rmSync(tmpDir, { recursive: true, force: true }),
  }
})

// PGlite is a real in-process Postgres, so this exercises the exact SQL the
// production store runs against Supabase/Neon — no server needed.
runApiSuite('API — Postgres store (PGlite)', async () => {
  const { PGlite } = await import('@electric-sql/pglite')
  const db = new PGlite()
  const store = await new PgStore(db).init()
  return { store, cleanup: () => db.close() }
})
