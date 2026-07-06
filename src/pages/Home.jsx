import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchItems, fetchRepos } from '../api.js'
import { branchColor } from '../branding.js'
import Mascot from '../components/Mascot.jsx'
import LoadingScreen from '../components/LoadingScreen.jsx'
import { BookIcon, UsersIcon, QuillIcon } from '../components/icons.jsx'

function Tile({ to, children, glow, className = '' }) {
  return (
    <Link
      to={to}
      className={`glass card-lift flex flex-col gap-2 p-6 ${className}`}
      style={glow ? { '--pill-glow': glow } : undefined}
    >
      {children}
    </Link>
  )
}

export default function Home() {
  const [data, setData] = useState(null)
  const [communityCount, setCommunityCount] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([fetchItems('vault'), fetchRepos()])
      .then(([vaultData, { repos }]) => {
        setData(vaultData)
        setCommunityCount(repos.filter((r) => !r.official).length)
      })
      .catch((e) => setError(e.message))
  }, [])

  const countFor = (branch) => data?.items.filter((it) => it.branch === branch).length ?? 0

  return (
    <div className="flex flex-col gap-10">
      <section className="pt-2 text-center">
        <Mascot size={180} className="mascot-float mx-auto" />
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          Summa — the all-knowing
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to Sumnia
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Olympiad problems with worked solutions — study the curator-verified
          vault, or build a repository with your own circle.
        </p>
      </section>

      {error && (
        <div className="glass mx-auto max-w-md p-8 text-center">
          <p className="text-frost/85">Couldn't reach the vault: {error}</p>
          <p className="mt-2 text-sm text-muted">Check that the API server is running, then reload.</p>
        </div>
      )}

      {!data && !error && <LoadingScreen label="Summa is opening the vault…" />}

      {data && (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Tile to="/repository" className="sm:col-span-2" glow="#4ade9c">
            <div className="flex items-center gap-3">
              <span className="nav-dot active shrink-0" aria-hidden="true">
                <BookIcon />
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold">The Olympiad Vault</h2>
                <p className="text-sm text-muted">
                  {data.items.length} curator-verified problems with trusted sources
                </p>
              </div>
              <span
                className="ml-auto hidden shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[11px] text-chem sm:block"
                style={{
                  background: 'color-mix(in srgb, #4ade9c 12%, transparent)',
                  border: '1px solid color-mix(in srgb, #4ade9c 40%, transparent)',
                }}
              >
                ✓ verified
              </span>
            </div>
          </Tile>

          <Tile to="/community">
            <div className="flex items-center gap-3">
              <span className="nav-dot shrink-0" aria-hidden="true">
                <UsersIcon />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold">Community</h2>
                <p className="text-sm text-muted">
                  {communityCount} open {communityCount === 1 ? 'repository' : 'repositories'}
                </p>
              </div>
            </div>
          </Tile>

          {data.branches.map((branch) => {
            const color = branchColor(branch)
            return (
              <Tile key={branch} to={`/repository?branch=${encodeURIComponent(branch)}`} glow={color}>
                <span
                  className="w-fit rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium"
                  style={{
                    color,
                    background: `color-mix(in srgb, ${color} 14%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
                  }}
                >
                  {branch}
                </span>
                <h2 className="font-display text-lg font-semibold">{branch} problems</h2>
                <p className="font-mono text-[12px] text-muted">
                  {countFor(branch)} in the vault
                </p>
              </Tile>
            )
          })}

          <Tile to="/admin" className="sm:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-3">
              <span className="nav-dot shrink-0" aria-hidden="true">
                <QuillIcon />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold">Curator</h2>
                <p className="text-sm text-muted">Manage the vault (password required)</p>
              </div>
            </div>
          </Tile>
        </section>
      )}
    </div>
  )
}
