import path from 'node:path'
import { existsSync } from 'node:fs'
import express from 'express'
import { fileURLToPath } from 'node:url'
import { Store } from './store.js'
import { createApp } from './app.js'
import { seedIfEmpty } from './seed.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDev = process.argv.includes('--dev')
const store = new Store(path.join(__dirname, 'data', 'items.json'))
seedIfEmpty(store)

// Set ADMIN_PASSWORD in the environment (locally or on your host) to choose the
// curator password. The default below is only a placeholder for quick trials.
if (!process.env.ADMIN_PASSWORD) {
  console.warn('⚠  ADMIN_PASSWORD is not set — using an insecure default. Set it before going public.')
}
const app = createApp(store, {
  adminPassword: process.env.ADMIN_PASSWORD || 'changeme',
})

// In production, serve the built frontend from the same process.
const dist = path.join(__dirname, '..', 'dist')
if (existsSync(dist)) {
  app.use(express.static(dist))
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

// Dev runs the API on a fixed port that Vite proxies to; in production the host
// (e.g. Render) injects PORT and expects the app to bind it.
const port = isDev ? process.env.API_PORT || 3001 : process.env.PORT || 3001
app.listen(port, () => console.log(`Sumnia API on http://localhost:${port}`))
