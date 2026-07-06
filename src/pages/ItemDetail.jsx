import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchItem, deleteItem } from '../api.js'
import { branchColor } from '../branding.js'
import MathText from '../components/MathText.jsx'
import LoadingScreen from '../components/LoadingScreen.jsx'
import { useSettings } from '../settings.jsx'

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { settings } = useSettings()
  const [item, setItem] = useState(null)
  const [error, setError] = useState(null)
  const [showSolution, setShowSolution] = useState(settings.autoReveal)

  useEffect(() => {
    setItem(null)
    setShowSolution(settings.autoReveal)
    fetchItem(id).then(setItem).catch((e) => setError(e.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (error) {
    return (
      <div className="glass mx-auto max-w-md p-8 text-center">
        <p className="text-frost/85">{error}</p>
        <Link to="/repository" className="glass-pill mt-4 inline-block px-4 py-1.5 text-sm">
          Back to the vault
        </Link>
      </div>
    )
  }

  if (!item) return <LoadingScreen label="Summa is fetching the problem…" />

  const color = branchColor(item.branch)
  const isVault = item.repo?.official ?? true
  const backTo = isVault ? '/repository' : `/r/${item.repoId}`
  const backLabel = isVault ? '← The Olympiad Vault' : `← ${item.repo?.name ?? 'Repository'}`

  async function remove() {
    if (!window.confirm(`Delete “${item.title}”? This can't be undone.`)) return
    try {
      await deleteItem(item.id)
      navigate(backTo)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link to={backTo} className="font-mono text-[12px] text-muted hover:text-frost">
          {backLabel}
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-3 py-1 font-mono text-[12px] font-medium"
            style={{
              color,
              background: `color-mix(in srgb, ${color} 14%, transparent)`,
              border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
            }}
          >
            {item.branch}
          </span>
          <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 font-mono text-[12px] text-muted">
            {item.topic}
          </span>
          {item.year && <span className="font-mono text-[12px] text-muted">{item.year}</span>}
          {isVault ? (
            <span
              className="rounded-full px-3 py-1 font-mono text-[12px] font-medium text-chem"
              style={{
                background: 'color-mix(in srgb, #4ade9c 12%, transparent)',
                border: '1px solid color-mix(in srgb, #4ade9c 40%, transparent)',
              }}
            >
              ✓ Vault · verified
            </span>
          ) : (
            <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 font-mono text-[12px] text-muted">
              {item.repo?.name ?? 'Community'} · community
            </span>
          )}
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {item.title}
        </h1>
        {item.source && (
          <p className="mt-2 font-mono text-[12px] text-muted">Source: {item.source}</p>
        )}
        {!isVault && (
          <div className="mt-3 flex gap-2">
            <Link
              to={`/r/${item.repoId}/contribute?item=${item.id}`}
              className="glass-pill px-4 py-1.5 text-sm"
            >
              Edit
            </Link>
            <button
              type="button"
              className="glass-pill px-4 py-1.5 text-sm text-red-300"
              onClick={remove}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <section className="glass p-6 sm:p-8">
        <h2 className="mb-3 font-mono text-[12px] uppercase tracking-[0.18em] text-muted">
          Problem
        </h2>
        <MathText text={item.problem} />
      </section>

      <section className="glass p-6 sm:p-8" style={{ '--pill-glow': color }}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.18em] text-muted">
            Solution
          </h2>
          <button
            type="button"
            className="glass-pill px-4 py-1.5 text-sm"
            data-active={showSolution}
            onClick={() => setShowSolution((s) => !s)}
          >
            {showSolution ? 'Hide solution' : 'Reveal solution'}
          </button>
        </div>
        {showSolution ? (
          <div className="mt-4">
            <MathText text={item.solution} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">
            Try the problem first — then reveal the worked solution.
          </p>
        )}
      </section>
    </article>
  )
}
