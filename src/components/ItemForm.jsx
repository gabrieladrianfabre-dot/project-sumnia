import { useState } from 'react'
import MathText from './MathText.jsx'

export const EMPTY_FORM = {
  title: '',
  branch: '',
  topic: '',
  year: '',
  problem: '',
  solution: '',
  source: '',
}

// Shared add/edit form: the curator uses it in the admin view, and community
// contributors use it on their own repositories.
export default function ItemForm({ initial, taxonomies, onSave, onCancel }) {
  const [form, setForm] = useState(initial)
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const editing = Boolean(initial.id)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await onSave(form)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="glass flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">
          {editing ? `Edit: ${initial.title}` : 'Add a problem'}
        </h2>
        <button
          type="button"
          className="glass-pill px-3 py-1 text-sm"
          data-active={preview}
          onClick={() => setPreview((p) => !p)}
        >
          {preview ? 'Hide preview' : 'Preview math'}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-muted sm:col-span-2">
          Title
          <input className="field" value={form.title} onChange={set('title')} required />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          Branch <span className="text-[11px]">(pick one or type a new branch)</span>
          <input
            className="field"
            value={form.branch}
            onChange={set('branch')}
            list="branch-options"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          Topic <span className="text-[11px]">(pick one or type a new topic)</span>
          <input
            className="field"
            value={form.topic}
            onChange={set('topic')}
            list="topic-options"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          Year <span className="text-[11px]">(optional)</span>
          <input
            className="field"
            type="number"
            value={form.year ?? ''}
            onChange={set('year')}
            placeholder="e.g. 2019"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          Source / attribution
          <input
            className="field"
            value={form.source}
            onChange={set('source')}
            placeholder="e.g. IMO 1959, Problem 1"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted sm:col-span-2">
          Problem statement <span className="text-[11px]">(use $…$ or $$…$$ for LaTeX)</span>
          <textarea
            className="field min-h-28 font-mono text-sm"
            value={form.problem}
            onChange={set('problem')}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted sm:col-span-2">
          Solution <span className="text-[11px]">(use $…$ or $$…$$ for LaTeX)</span>
          <textarea
            className="field min-h-36 font-mono text-sm"
            value={form.solution}
            onChange={set('solution')}
            required
          />
        </label>
      </div>

      <datalist id="branch-options">
        {taxonomies.branches.map((b) => (
          <option key={b} value={b} />
        ))}
      </datalist>
      <datalist id="topic-options">
        {taxonomies.topics.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>

      {preview && (
        <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/20 p-4">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              Problem preview
            </p>
            <MathText text={form.problem} />
          </div>
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              Solution preview
            </p>
            <MathText text={form.solution} />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" className="glass-pill px-5 py-2 font-medium" disabled={busy}>
          {busy ? 'Saving…' : editing ? 'Save changes' : 'Add problem'}
        </button>
        {onCancel && (
          <button type="button" className="glass-pill px-5 py-2 text-muted" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
