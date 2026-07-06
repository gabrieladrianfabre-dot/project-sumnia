import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import Mascot from '../components/Mascot.jsx'

// Placeholder providers — buttons are here so the layout is ready, but real
// OAuth comes later.
const SOCIAL_PROVIDERS = [
  { name: 'Google', mark: 'G', color: '#5cc8ff' },
  { name: 'Facebook', mark: 'f', color: '#a78bfa' },
]

export default function Login() {
  const { user, signup, login, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from ?? '/community'

  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (mode === 'signup') await signup(form)
      else await login({ email: form.email, password: form.password })
      navigate(from)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  if (user) {
    return (
      <div className="glass mx-auto mt-10 flex max-w-sm flex-col items-center gap-4 p-8 text-center">
        <Mascot size={104} />
        <h1 className="font-display text-2xl font-bold">Hi, {user.name}!</h1>
        <p className="text-sm text-muted">
          You're signed in as {user.email}. Repositories you create are credited to you.
        </p>
        <div className="flex gap-2">
          <Link to="/community" className="glass-pill px-4 py-2 text-sm font-medium">
            Go to community
          </Link>
          <button type="button" className="glass-pill px-4 py-2 text-sm text-muted" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="glass mx-auto mt-10 flex w-full max-w-sm flex-col gap-4 p-8">
      <Mascot size={104} className="mascot-float mx-auto" />
      <h1 className="text-center font-display text-2xl font-bold">
        {mode === 'signin' ? 'Welcome back' : 'Join Sumnia'}
      </h1>
      <p className="text-center text-sm text-muted">
        Sign in so the repositories you create carry your name.
      </p>

      <div className="mx-auto flex gap-1 rounded-full border border-white/10 bg-white/5 p-1">
        {['signin', 'signup'].map((m) => (
          <button
            key={m}
            type="button"
            className="glass-pill border-0 px-4 py-1 text-sm"
            data-active={mode === m}
            onClick={() => {
              setMode(m)
              setError(null)
            }}
          >
            {m === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        ))}
      </div>

      {mode === 'signup' && (
        <label className="flex flex-col gap-1 text-sm text-muted">
          Display name
          <input className="field" value={form.name} onChange={set('name')} maxLength={60} required />
        </label>
      )}
      <label className="flex flex-col gap-1 text-sm text-muted">
        Email
        <input type="email" className="field" value={form.email} onChange={set('email')} required />
      </label>
      <label className="flex flex-col gap-1 text-sm text-muted">
        Password {mode === 'signup' && <span className="text-[11px]">(6+ characters)</span>}
        <input
          type="password"
          className="field"
          value={form.password}
          onChange={set('password')}
          minLength={mode === 'signup' ? 6 : undefined}
          required
        />
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button type="submit" className="glass-pill px-4 py-2 font-medium" disabled={busy}>
        {busy ? 'One moment…' : mode === 'signin' ? 'Sign in' : 'Create account'}
      </button>

      <div className="flex items-center gap-3 text-muted">
        <span className="h-px flex-1 bg-white/10" />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em]">or continue with</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <div className="flex gap-2">
        {SOCIAL_PROVIDERS.map((p) => (
          <button
            key={p.name}
            type="button"
            className="glass-pill flex-1 px-3 py-2 text-sm"
            style={{ '--pill-glow': p.color }}
            onClick={() => setNotice(`${p.name} sign-in is coming soon — use email for now.`)}
            aria-label={`Continue with ${p.name} (coming soon)`}
          >
            <span className="font-display font-bold">{p.mark}</span>
            <span className="ml-1.5">{p.name}</span>
          </button>
        ))}
      </div>

      {notice && (
        <p className="text-center text-[13px] text-muted" role="status">
          {notice}
        </p>
      )}
    </form>
  )
}
