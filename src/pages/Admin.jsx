import { useEffect, useState } from 'react'
import {
  fetchItems,
  login,
  createItem,
  updateItem,
  deleteItem,
  getToken,
  setToken,
  clearToken,
  ApiError,
} from '../api.js'
import { branchColor } from '../branding.js'
import Mascot from '../components/Mascot.jsx'
import LoadingScreen from '../components/LoadingScreen.jsx'
import ItemForm, { EMPTY_FORM } from '../components/ItemForm.jsx'

function Login({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const { token } = await login(password)
      setToken(token)
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="glass mx-auto mt-10 flex max-w-sm flex-col gap-4 p-8">
      <Mascot size={104} className="mascot-float mx-auto" />
      <h1 className="text-center font-display text-2xl font-bold">Curator access</h1>
      <p className="text-center text-sm text-muted">
        Summa guards the vault — enter the curator password to manage it.
      </p>
      <input
        type="password"
        className="field"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" className="glass-pill px-4 py-2 font-medium" disabled={busy}>
        {busy ? 'Checking…' : 'Sign in'}
      </button>
    </form>
  )
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => Boolean(getToken()))
  const [data, setData] = useState(null)
  const [editing, setEditing] = useState(null) // null = create mode
  const [notice, setNotice] = useState(null)

  // The admin curates the vault only; community repos manage themselves.
  const reload = () => fetchItems('vault').then(setData)

  useEffect(() => {
    if (authed) reload()
  }, [authed])

  function handleExpiredSession(err) {
    if (err instanceof ApiError && err.status === 401) {
      clearToken()
      setAuthed(false)
      throw new ApiError('Session expired — sign in again', 401)
    }
    throw err
  }

  async function save(form) {
    try {
      if (editing) {
        await updateItem(editing.id, form)
        setNotice(`Saved changes to “${form.title}”`)
      } else {
        await createItem({ ...form, repoId: 'vault' })
        setNotice(`Added “${form.title}” to the vault`)
      }
    } catch (err) {
      handleExpiredSession(err)
    }
    setEditing(null)
    await reload()
  }

  async function remove(item) {
    if (!window.confirm(`Delete “${item.title}”? This can't be undone.`)) return
    try {
      await deleteItem(item.id)
    } catch (err) {
      try {
        handleExpiredSession(err)
      } catch (e) {
        setNotice(e.message)
        return
      }
    }
    setNotice(`Deleted “${item.title}”`)
    if (editing?.id === item.id) setEditing(null)
    await reload()
  }

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Curator</h1>
          <p className="mt-1 text-sm text-muted">Managing The Olympiad Vault</p>
        </div>
        <button
          type="button"
          className="glass-pill px-4 py-1.5 text-sm text-muted"
          onClick={() => {
            clearToken()
            setAuthed(false)
          }}
        >
          Sign out
        </button>
      </div>

      {notice && (
        <p className="glass px-4 py-3 text-sm text-frost/85" role="status">
          {notice}
        </p>
      )}

      {!data && <LoadingScreen label="Summa is unlocking the vault…" />}

      {data && (
        <ItemForm
          key={editing?.id ?? 'new'}
          initial={editing ?? EMPTY_FORM}
          taxonomies={data}
          onSave={save}
          onCancel={editing ? () => setEditing(null) : null}
        />
      )}

      <section className="flex flex-col gap-2">
        <h2 className="font-mono text-[12px] uppercase tracking-[0.18em] text-muted">
          {data ? `${data.items.length} problems in the vault` : 'Loading…'}
        </h2>
        {data?.items.map((item) => (
          <div key={item.id} className="glass flex items-center gap-3 px-4 py-3">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: branchColor(item.branch) }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.title}</p>
              <p className="truncate font-mono text-[11px] text-muted">
                {item.branch} · {item.topic}
                {item.year ? ` · ${item.year}` : ''}
              </p>
            </div>
            <button
              type="button"
              className="glass-pill px-3 py-1 text-sm"
              onClick={() => {
                setEditing(item)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="glass-pill px-3 py-1 text-sm text-red-300"
              onClick={() => remove(item)}
            >
              Delete
            </button>
          </div>
        ))}
      </section>
    </div>
  )
}
