import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { SettingsProvider } from './settings.jsx'
import { AuthProvider, useAuth } from './auth.jsx'
import SideNav from './components/SideNav.jsx'
import SettingsDrawer from './components/SettingsDrawer.jsx'
import Home from './pages/Home.jsx'
import Repository from './pages/Repository.jsx'
import Community from './pages/Community.jsx'
import Contribute from './pages/Contribute.jsx'
import ItemDetail from './pages/ItemDetail.jsx'
import Login from './pages/Login.jsx'
import Admin from './pages/Admin.jsx'
import NotFound from './pages/NotFound.jsx'

function Header() {
  const { user } = useAuth()
  return (
    <header className="sticky top-4 z-20 mx-auto mt-4 flex w-[min(72rem,calc(100%-2rem))] items-center justify-between glass px-5 py-3">
      <Link to="/" className="font-display text-xl font-bold tracking-tight">
        <span className="text-math">∑</span>umnia
      </Link>
      <Link to="/login" className="glass-pill px-4 py-1.5 text-sm" data-active={Boolean(user)}>
        {user ? user.name : 'Sign in'}
      </Link>
    </header>
  )
}

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <SettingsProvider>
      <AuthProvider>
      <div className="aurora" aria-hidden="true">
        <div className="aurora-blob math" />
        <div className="aurora-blob physics" />
        <div className="aurora-blob chem" />
      </div>

      <div className="lg:pl-24 lg:pr-6">
        <Header />
        <main className="mx-auto w-[min(72rem,calc(100%-2rem))] pb-32 pt-10 lg:pb-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/repository" element={<Repository repoId="vault" />} />
            <Route path="/community" element={<Community />} />
            <Route path="/r/:repoId" element={<Repository />} />
            <Route path="/r/:repoId/contribute" element={<Contribute />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      <SideNav onOpenSettings={() => setSettingsOpen(true)} />
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </AuthProvider>
    </SettingsProvider>
  )
}
