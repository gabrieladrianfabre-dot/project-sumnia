import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { fetchItems, fetchRepos } from '../api.js'
import { branchColor } from '../branding.js'
import MathText from '../components/MathText.jsx'
import Mascot from '../components/Mascot.jsx'
import LoadingScreen from '../components/LoadingScreen.jsx'
import { useSettings } from '../settings.jsx'

function FilterRow({ label, options, active, counts, onPick, colorFor }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <button
        type="button"
        className="glass-pill px-3.5 py-1 text-sm"
        data-active={active === null}
        onClick={() => onPick(null)}
      >
        All
      </button>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className="glass-pill px-3.5 py-1 text-sm"
          data-active={active === opt}
          style={{ '--pill-glow': colorFor(opt) }}
          onClick={() => onPick(active === opt ? null : opt)}
        >
          {opt}
          <span className="ml-1.5 font-mono text-[11px] opacity-60">{counts[opt] ?? 0}</span>
        </button>
      ))}
    </div>
  )
}

function ItemCard({ item, showPreview }) {
  const color = branchColor(item.branch)
  return (
    <Link
      to={`/item/${item.id}`}
      className="glass card-lift flex flex-col gap-3 p-5"
      style={{ '--pill-glow': color }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium"
          style={{
            color,
            background: `color-mix(in srgb, ${color} 14%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
          }}
        >
          {item.branch}
        </span>
        <span className="rounded-full border border-white/12 bg-white/5 px-2.5 py-0.5 font-mono text-[11px] text-muted">
          {item.topic}
        </span>
        {item.year && (
          <span className="ml-auto font-mono text-[11px] text-muted">{item.year}</span>
        )}
      </div>
      <h3 className="font-display text-lg font-semibold leading-snug">{item.title}</h3>
      {showPreview && (
        <div className="preview-clamp text-sm text-frost/75">
          <MathText text={item.problem} />
        </div>
      )}
      <span className="mt-auto truncate font-mono text-[11px] text-muted">{item.source}</span>
    </Link>
  )
}

function VaultHeader() {
  return (
    <section className="pt-4 text-center">
      <Mascot size={104} className="mascot-float mx-auto" />
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
        The Olympiad Vault
      </h1>
      <p className="mx-auto mt-3 flex items-center justify-center gap-2">
        <span className="glass-pill px-3 py-1 font-mono text-[11px] text-chem" data-active="true" style={{ '--pill-glow': '#4ade9c' }}>
          ✓ curator-verified sources
        </span>
      </p>
      <p className="mx-auto mt-3 max-w-xl text-muted">
        The official repository — every problem reviewed by the curator, with
        verified sources. Filter by branch and topic, then open a problem to study.
      </p>
    </section>
  )
}

function CommunityHeader({ repo }) {
  return (
    <section className="pt-4 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
        Community repository{repo.createdBy?.name ? ` · by ${repo.createdBy.name}` : ''}
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
        {repo.name}
      </h1>
      {repo.description && <p className="mx-auto mt-3 max-w-xl text-muted">{repo.description}</p>}
      <p className="mx-auto mt-2 max-w-xl text-[13px] text-muted/80">
        Contributed by the community — not reviewed by the Sumnia curator.
      </p>
      <Link to={`/r/${repo.id}/contribute`} className="glass-pill mt-4 inline-block px-5 py-2 font-medium">
        Add a problem
      </Link>
    </section>
  )
}

export default function Repository({ repoId }) {
  const params = useParams()
  const id = repoId ?? params.repoId
  const isVault = id === 'vault'

  const [data, setData] = useState(null)
  const [repo, setRepo] = useState(null)
  const [error, setError] = useState(null)
  const { settings } = useSettings()
  const [searchParams, setSearchParams] = useSearchParams()
  const branch = searchParams.get('branch')
  const topic = searchParams.get('topic')

  useEffect(() => {
    setData(null)
    setRepo(null)
    setError(null)
    Promise.all([fetchItems(id), fetchRepos()])
      .then(([itemData, { repos }]) => {
        const found = repos.find((r) => r.id === id)
        if (!found) {
          setError('This repository does not exist — it may have been removed.')
          return
        }
        setRepo(found)
        setData(itemData)
      })
      .catch((e) => setError(e.message))
  }, [id])

  const setFilter = (key) => (value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { replace: true })
  }

  const filtered = useMemo(() => {
    if (!data) return []
    return data.items.filter(
      (it) => (!branch || it.branch === branch) && (!topic || it.topic === topic)
    )
  }, [data, branch, topic])

  // Counts reflect the *other* axis's current selection, so each pill shows
  // how many items you would get by clicking it.
  const counts = useMemo(() => {
    if (!data) return { branches: {}, topics: {} }
    const branches = {}
    const topics = {}
    for (const it of data.items) {
      if (!topic || it.topic === topic) branches[it.branch] = (branches[it.branch] ?? 0) + 1
      if (!branch || it.branch === branch) topics[it.topic] = (topics[it.topic] ?? 0) + 1
    }
    return { branches, topics }
  }, [data, branch, topic])

  if (error) {
    return (
      <div className="glass mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
        <Mascot size={96} />
        <p className="text-frost/85">{error}</p>
        <Link to={isVault ? '/' : '/community'} className="glass-pill px-4 py-1.5 text-sm">
          {isVault ? 'Go home' : 'Back to community'}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {repo && (isVault ? <VaultHeader /> : <CommunityHeader repo={repo} />)}

      {!data && !error && <LoadingScreen label="Summa is opening the vault…" />}

      {data && (
        <section className="glass sticky top-24 z-10 flex flex-col gap-3 p-4" aria-label="Filters">
          <FilterRow
            label="Branch"
            options={data.branches}
            active={branch}
            counts={counts.branches}
            onPick={setFilter('branch')}
            colorFor={branchColor}
          />
          <FilterRow
            label="Topic"
            options={data.topics}
            active={topic}
            counts={counts.topics}
            onPick={setFilter('topic')}
            colorFor={() => 'rgba(233,237,248,0.9)'}
          />
        </section>
      )}

      {data && (
        <section aria-live="polite">
          <p className="mb-4 font-mono text-[12px] uppercase tracking-[0.18em] text-muted">
            {filtered.length} {filtered.length === 1 ? 'problem' : 'problems'}
            {branch && ` · ${branch}`}
            {topic && ` · ${topic}`}
          </p>
          {filtered.length === 0 ? (
            <div className="glass flex flex-col items-center gap-3 p-10 text-center text-muted">
              <Mascot size={96} />
              <p>
                {data.items.length === 0 && !isVault
                  ? 'This repository is empty — add its first problem!'
                  : 'No problems match this Branch × Topic combination yet.'}
              </p>
              {data.items.length === 0 && !isVault && (
                <Link to={`/r/${id}/contribute`} className="glass-pill px-4 py-1.5 text-sm">
                  Add a problem
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <ItemCard key={item.id} item={item} showPreview={settings.showPreviews} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
