import DateTimeWidget from './components/DateTimeWidget'
import MultiSelectDropdown from './components/MultiSelectDropdown'
import ChartWidget from './components/ChartWidget'
import MultiDocumentUpload from './components/MultiDocumentUpload'
import FirebaseNotifications from './components/FirebaseNotifications'
import './index.css'

function App() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-800 py-12">
      <div className="pointer-events-none absolute -top-32 right-10 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-400/30 via-teal-400/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-gradient-to-tr from-purple-500/20 via-transparent to-transparent blur-3xl" />
      
      <h1 className="relative z-10 text-4xl font-bold text-white">React task</h1>
      
      <div className="relative z-10 flex w-1/2 max-w-4xl flex-col items-center justify-center gap-8">
        <div className="w-full rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.9)] backdrop-blur-xl">
          <MultiSelectDropdown />
        </div>
        <div className="w-full rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.9)] backdrop-blur-xl">
          <DateTimeWidget />
        </div>
        <div className="w-full rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.9)] backdrop-blur-xl">
          <ChartWidget />
        </div>
        <div className="w-full rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.9)] backdrop-blur-xl">
          <MultiDocumentUpload />
        </div>
        <div className="w-full rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.9)] backdrop-blur-xl">
          <FirebaseNotifications />
        </div>
      </div>
    </div>
  )
}

export default App
