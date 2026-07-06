import Mascot from './Mascot.jsx'

export default function LoadingScreen({ label = 'Summa is fetching…' }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16" role="status">
      <Mascot size={110} className="mascot-loading" />
      <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-muted">{label}</p>
    </div>
  )
}
