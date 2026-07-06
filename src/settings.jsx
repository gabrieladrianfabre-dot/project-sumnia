import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'sumnia-settings'

const DEFAULTS = {
  reduceMotion: false, // stop the aurora drift and mascot float
  autoReveal: false, // show solutions immediately instead of behind the reveal
  showPreviews: true, // problem previews on repository cards
}

const SettingsContext = createContext({ settings: DEFAULTS, update: () => {} })

function load() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }
  } catch {
    return DEFAULTS
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(load)

  const update = (key, value) => {
    setSettings((s) => {
      const next = { ...s, [key]: value }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion)
  }, [settings.reduceMotion])

  return (
    <SettingsContext.Provider value={{ settings, update }}>{children}</SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
