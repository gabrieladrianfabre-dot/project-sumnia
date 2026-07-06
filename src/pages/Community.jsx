import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchRepos, createRepo } from '../api.js'
import { useAuth } from '../auth.jsx'
import Mascot from '../components/Mascot.jsx'
import LoadingScreen from '../components/LoadingScreen.jsx'

function SignInPrompt() {
  return (
    <div className="glass flex flex-col items-center gap-3 p-8 text-center">
      <h2 className="font-display text-xl font-semibold">Start your own repository</h2>
      <p className="max-w-md text-sm text-muted">
        Sign in first so your repository carries your name — no curator password
        needed, just an account.
      </p>
      <Link
        to="/login"
        state={{ from: '/community' }}
        className="glass-pill px-5 py-2 font-medium"
      >
        Sign in or create an account
      </Link>
    </div>
  )
}

function CreateRepoForm() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const repo = await createRepo({ name, description })
      navigate(`/r/${repo.id}`)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="glass flex flex-col gap-4 p-6">
      <h2 className="font-display text-xl font-semibold">Start your own repository</h2>
      <p className="-mt-2 text-sm text-muted">
        No password needed — name it, describe it, and start adding problems.
      </p>
      <label className="flex flex-col gap-1 text-sm text-muted">
        Repository name
        <input
          className="field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. JILCF Grade 10 Practice Set"
          maxLength={80}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-muted">
        Description <span className="text-[11px]">(optional)</span>
        <input
          className="field"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What belongs in this repository?"
          maxLength={300}
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" className="glass-pill w-fit px-5 py-2 font-medium" disabled={busy}>
        {busy ? 'Creating…' : 'Create repository'}
      </button>
    </form>
  )
}

export default function Community() {
  const { user } = useAuth()
  const [repos, setRepos] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRepos()
      .then(({ repos }) => setRepos(repos.filter((r) => !r.official)))
      .catch((e) => setError(e.message))
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <section className="pt-4 text-center">
        <Mascot size={120} className="mascot-float mx-auto" />
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Community repositories
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Anyone can create a repository and add problems — no password needed.
          For curator-verified material, head to{' '}
          <Link to="/repository" className="text-math hover:underline">
            The Olympiad Vault
          </Link>
          .
        </p>
      </section>

      {user ? <CreateRepoForm /> : <SignInPrompt />}

      {error && (
        <div className="glass p-8 text-center text-frost/85">
          Couldn't load repositories: {error}
        </div>
      )}

      {!repos && !error && <LoadingScreen label="Summa is gathering the circles…" />}

      {repos && (
        <section className="flex flex-col gap-3">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.18em] text-muted">
            {repos.length} {repos.length === 1 ? 'repository' : 'repositories'}
          </h2>
          {repos.length === 0 ? (
            <div className="glass flex flex-col items-center gap-3 p-10 text-center text-muted">
              <Mascot size={96} />
              <p>No community repositories yet — yours could be the first.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {repos.map((repo) => (
                <Link key={repo.id} to={`/r/${repo.id}`} className="glass card-lift flex flex-col gap-2 p-6">
                  <h3 className="font-display text-lg font-semibold">{repo.name}</h3>
                  {repo.description && (
                    <p className="text-sm text-muted">{repo.description}</p>
                  )}
                  <p className="mt-auto font-mono text-[12px] text-muted">
                    {repo.itemCount} {repo.itemCount === 1 ? 'problem' : 'problems'}
                    {repo.createdBy?.name && ` · by ${repo.createdBy.name}`}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
