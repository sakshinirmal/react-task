import DateTimeWidget from './components/DateTimeWidget'
import './index.css'

function App() {
  return (
    <div>
    {/* <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-800 px-4 py-12"> */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25)_0%,_transparent_55%)]" />
      <div className="pointer-events-none absolute -top-32 right-10 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-400/30 via-teal-400/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-gradient-to-tr from-purple-500/20 via-transparent to-transparent blur-3xl" />
      <div className="flex">
        <DateTimeWidget />
      </div>
    </div>
  )
}

export default App
