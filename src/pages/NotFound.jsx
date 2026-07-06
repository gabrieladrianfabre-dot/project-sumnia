import { Link } from 'react-router-dom'
import Mascot from '../components/Mascot.jsx'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 pt-10 text-center">
      <Mascot size={140} />
      <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-muted">404</p>
      <h1 className="font-display text-3xl font-bold">This page isn't in the syllabus</h1>
      <p className="max-w-md text-muted">
        Summa checked the whole vault — nothing lives at this address.
      </p>
      <div className="mt-2 flex gap-2">
        <Link to="/" className="glass-pill px-5 py-2 font-medium">
          Go home
        </Link>
        <Link to="/repository" className="glass-pill px-5 py-2 text-muted">
          Browse problems
        </Link>
      </div>
    </div>
  )
}
