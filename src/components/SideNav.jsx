import { NavLink } from 'react-router-dom'
import { HomeIcon, BookIcon, UsersIcon, QuillIcon, GearIcon } from './icons.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: HomeIcon, end: true },
  { to: '/repository', label: 'The Olympiad Vault', icon: BookIcon },
  { to: '/community', label: 'Community', icon: UsersIcon },
  { to: '/admin', label: 'Curator', icon: QuillIcon },
]

function NavDot({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      title={label}
      className={({ isActive }) => `nav-dot ${isActive ? 'active' : ''}`}
    >
      <Icon />
    </NavLink>
  )
}

// Desktop: floating glass rail on the left. Mobile: glass dock at the bottom.
export default function SideNav({ onOpenSettings }) {
  const links = NAV_ITEMS.map((item) => <NavDot key={item.to} {...item} />)
  const gear = (
    <button type="button" className="nav-dot" aria-label="Settings" title="Settings" onClick={onOpenSettings}>
      <GearIcon />
    </button>
  )

  return (
    <>
      <nav
        className="glass fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-1.5 rounded-full p-2 lg:flex"
        aria-label="Main navigation"
      >
        {links}
        <div className="my-1 h-px w-6 bg-white/15" />
        {gear}
      </nav>

      <nav
        className="glass fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full p-2 lg:hidden"
        aria-label="Main navigation"
      >
        {links}
        <div className="mx-1 h-6 w-px bg-white/15" />
        {gear}
      </nav>
    </>
  )
}
