import { useEffect } from 'react'
import { useSettings } from '../settings.jsx'
import { CloseIcon } from './icons.jsx'
import Mascot from './Mascot.jsx'

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-frost">{label}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className="switch mt-1 shrink-0"
        onClick={() => onChange(!checked)}
      />
    </div>
  )
}

export default function SettingsDrawer({ open, onClose }) {
  const { settings, update } = useSettings()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-label="Settings"
        className={`glass fixed right-0 top-0 z-50 flex h-full w-[min(21rem,88vw)] flex-col rounded-none rounded-l-3xl p-6 transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Settings</h2>
          <button type="button" className="nav-dot" aria-label="Close settings" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="mt-4 flex flex-col divide-y divide-white/10">
          <Toggle
            label="Reduce motion"
            description="Pause the aurora drift and the mascot's float."
            checked={settings.reduceMotion}
            onChange={(v) => update('reduceMotion', v)}
          />
          <Toggle
            label="Show solutions immediately"
            description="Skip the reveal step on problem pages."
            checked={settings.autoReveal}
            onChange={(v) => update('autoReveal', v)}
          />
          <Toggle
            label="Problem previews on cards"
            description="Show the first lines of each problem in the repository grid."
            checked={settings.showPreviews}
            onChange={(v) => update('showPreviews', v)}
          />
        </div>

        <div className="mt-auto flex flex-col items-center gap-2 pt-6 text-center">
          <Mascot size={72} />
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            Sumnia v1 · Summa — the all-knowing
          </p>
        </div>
      </aside>
    </>
  )
}
