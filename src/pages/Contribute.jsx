import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { fetchItems, fetchItem, fetchRepos, createItem, updateItem } from '../api.js'
import LoadingScreen from '../components/LoadingScreen.jsx'
import ItemForm, { EMPTY_FORM } from '../components/ItemForm.jsx'

// Add or edit a problem in a community repository — no password needed.
// Edit mode: /r/:repoId/contribute?item=<id>
export default function Contribute() {
  const { repoId } = useParams()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('item')
  const navigate = useNavigate()

  const [repo, setRepo] = useState(null)
  const [taxonomies, setTaxonomies] = useState(null)
  const [initial, setInitial] = useState(editId ? null : EMPTY_FORM)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      fetchRepos(),
      fetchItems(),
      editId ? fetchItem(editId) : Promise.resolve(null),
    ])
      .then(([{ repos }, itemData, item]) => {
        const found = repos.find((r) => r.id === repoId)
        if (!found) return setError('This repository does not exist.')
        if (found.official) return setError('The vault is curator-only — community edits happen in community repositories.')
        if (item && item.repoId !== repoId) return setError('That problem belongs to a different repository.')
        setRepo(found)
        setTaxonomies({ branches: itemData.branches, topics: itemData.topics })
        if (item) setInitial(item)
      })
      .catch((e) => setError(e.message))
  }, [repoId, editId])

  async function save(form) {
    if (editId) {
      await updateItem(editId, form)
    } else {
      await createItem({ ...form, repoId })
    }
    navigate(`/r/${repoId}`)
  }

  if (error) {
    return (
      <div className="glass mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
        <p className="text-frost/85">{error}</p>
        <Link to="/community" className="glass-pill px-4 py-1.5 text-sm">
          Back to community
        </Link>
      </div>
    )
  }

  if (!repo || !taxonomies || !initial) {
    return <LoadingScreen label="Summa is fetching the repository…" />
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <Link to={`/r/${repoId}`} className="font-mono text-[12px] text-muted hover:text-frost">
          ← {repo.name}
        </Link>
        <p className="mt-2 text-sm text-muted">
          Contributing to a community repository — please credit your source so
          others can verify the problem.
        </p>
      </div>
      <ItemForm
        initial={initial}
        taxonomies={taxonomies}
        onSave={save}
        onCancel={() => navigate(`/r/${repoId}`)}
      />
    </div>
  )
}
