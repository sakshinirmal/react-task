import { useEffect, useMemo, useRef, useState } from 'react'

// Calendar header labels keep the grid readable without hard-coded markup.
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const startOfDay = (value) => {
  const copy = new Date(value)
  copy.setHours(0, 0, 0, 0)
  return copy
}

const startOfMonth = (value) => {
  const copy = startOfDay(value)
  copy.setDate(1)
  return copy
}

// Generates a padded grid (always full weeks) so layout never shifts.
const getMonthCells = (monthDate) => {
  const firstDay = startOfMonth(monthDate)
  const startOffset = firstDay.getDay()
  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
  const totalCells = Math.ceil((startOffset + lastDay) / 7) * 7

  return Array.from({ length: totalCells }, (_, index) => {
    const cellDate = new Date(firstDay)
    cellDate.setDate(cellDate.getDate() + index - startOffset)
    const normalized = startOfDay(cellDate)
    return {
      key: normalized.toISOString(),
      date: normalized,
      inCurrentMonth: normalized.getMonth() === monthDate.getMonth(),
      label: normalized.getDate(),
    }
  })
}

const to12Hour = (date) => {
  let hours = date.getHours()
  const period = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return {
    hour: hours,
    minute: date.getMinutes(),
    period,
  }
}

const pad = (value) => value.toString().padStart(2, '0')

const mergeDateTime = (dateOnly, hour, minute, period) => {
  const next = new Date(dateOnly)
  let derivedHour = hour % 12
  if (period === 'PM') {
    derivedHour += 12
  }
  next.setHours(period === 'AM' && hour === 12 ? 0 : derivedHour, minute, 0, 0)
  return next
}

const DateTimeWidget = ({ onApply }) => {
  const containerRef = useRef(null)
  const today = useMemo(() => startOfDay(new Date()), [])
  const [isOpen, setIsOpen] = useState(false)

  const [appliedDateTime, setAppliedDateTime] = useState(() => {
    const initial = new Date()
    if (initial < today) {
      return today
    }
    return initial
  })

  const initialParts = to12Hour(appliedDateTime)
  const [selectedDate, setSelectedDate] = useState(startOfDay(appliedDateTime))
  const [displayHour, setDisplayHour] = useState(initialParts.hour)
  const [displayMinute, setDisplayMinute] = useState(initialParts.minute)
  const [period, setPeriod] = useState(initialParts.period)
  const [panelMonth, setPanelMonth] = useState(startOfMonth(appliedDateTime))

  const syncFromDate = (date) => {
    const normalized = startOfDay(date)
    const parts = to12Hour(date)
    setSelectedDate(normalized)
    setDisplayHour(parts.hour)
    setDisplayMinute(parts.minute)
    setPeriod(parts.period)
    setPanelMonth(startOfMonth(date))
  }

  useEffect(() => {
    const handleClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const monthCells = useMemo(
    () => getMonthCells(panelMonth),
    [panelMonth],
  )

  const handlePrevMonth = () => {
    const prev = new Date(panelMonth)
    prev.setMonth(prev.getMonth() - 1)
    setPanelMonth(prev)
  }

  const handleNextMonth = () => {
    const next = new Date(panelMonth)
    next.setMonth(next.getMonth() + 1)
    setPanelMonth(next)
  }

  const handleDateSelect = (cell) => {
    setSelectedDate(cell.date)
  }

  const adjustHour = (delta) => {
    setDisplayHour((prev) => {
      const next = prev + delta
      if (next > 12) return 1
      if (next < 1) return 12
      return next
    })
  }

  const adjustMinute = (delta) => {
    setDisplayMinute((prev) => {
      let next = prev + delta
      if (next >= 60) next = 0
      if (next < 0) next = 59
      return next
    })
  }

  const applySelection = () => {
    const combined = mergeDateTime(selectedDate, displayHour, displayMinute, period)
    setAppliedDateTime(combined)
    onApply?.(combined)
  }

  const cancelSelection = () => {
    syncFromDate(appliedDateTime)
    setIsOpen(false)
  }

  const formattedInput = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(appliedDateTime)
  }, [appliedDateTime])

  const isSelected = (cellDate) =>
    cellDate.getTime() === selectedDate.getTime()

  const ArrowIcon = ({ direction }) => (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === 'up' ? (
        <path d="M6 15l6-6 6 6" />
      ) : (
        <path d="M6 9l6 6 6-6" />
      )}
    </svg>
  )

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-slate-800/30 px-5 py-3 text-left text-base text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300/60"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="font-medium tracking-wide">{formattedInput}</span>
        <svg
          className={`h-4 w-4 text-slate-300 transition ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-1/2 z-20 mt-4 flex h-[24rem] w-[24rem] -translate-x-1/2 flex-col rounded-[36px] border border-white/8 bg-gradient-to-b from-slate-900/95 via-slate-900/85 to-slate-900/70 p-5 text-white shadow-[0_25px_60px_rgba(6,15,30,0.6)] backdrop-blur-2xl">
          <div className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded-full border border-white/5 p-2 text-slate-300 transition hover:border-white/30 hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="text-center text-lg font-semibold tracking-wide text-slate-100">
              {panelMonth.toLocaleString('en-US', { month: 'short', year: 'numeric' })}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded-full border border-white/5 p-2 text-slate-300 transition hover:border-white/30 hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 text-center text-[0.6rem] uppercase tracking-[0.4em] text-slate-400">
            {DAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="mt-2 grid flex-1 grid-cols-7 gap-y-1 text-center text-sm">
            {monthCells.map((cell) => {
              const selected = isSelected(cell.date)
              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => handleDateSelect(cell)}
                  disabled={cell.disabled}
                  className={[
                    'mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs transition',
                    cell.inCurrentMonth ? 'text-slate-100' : 'text-slate-500',
                    selected
                      ? 'bg-gradient-to-br from-cyan-300 to-teal-400 text-slate-900 font-semibold shadow-lg shadow-teal-500/40'
                      : 'hover:bg-white/5',
                  ].join(' ')}
                >
                  {cell.label}
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex flex-col items-center gap-3">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustHour(1)}
                  className="rounded-full bg-transparent p-1 text-slate-300 transition hover:text-white"
                >
                  <ArrowIcon direction="up" />
                </button>
                <div className="rounded-2xl bg-white px-4 py-1 text-3xl font-semibold text-[#0f0a26] shadow-inner shadow-slate-900/20">
                  {pad(displayHour)}
                </div>
                <button
                  type="button"
                  onClick={() => adjustHour(-1)}
                  className="rounded-full bg-transparent p-1 text-slate-300 transition hover:text-white"
                >
                  <ArrowIcon direction="down" />
                </button>
              </div>

              <span className="pb-3 text-3xl font-semibold text-slate-300">:</span>

              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustMinute(1)}
                  className="rounded-full bg-transparent p-1 text-slate-300 transition hover:text-white"
                >
                  <ArrowIcon direction="up" />
                </button>
                <div className="rounded-2xl bg-white px-4 py-1 text-3xl font-semibold text-[#0f0a26] shadow-inner shadow-slate-900/20">
                  {pad(displayMinute)}
                </div>
                <button
                  type="button"
                  onClick={() => adjustMinute(-1)}
                  className="rounded-full bg-transparent p-1 text-slate-300 transition hover:text-white"
                >
                  <ArrowIcon direction="down" />
                </button>
              </div>

              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPeriod((prev) => (prev === 'AM' ? 'PM' : 'AM'))}
                  className="rounded-full bg-transparent p-1 text-slate-300 transition hover:text-white"
                >
                  <ArrowIcon direction="up" />
                </button>
                <button
                  type="button"
                  className="rounded-2xl border border-white/30 px-4 py-1 text-2xl font-semibold text-white shadow-inner shadow-white/10 transition hover:border-white/60"
                  onClick={() => setPeriod((prev) => (prev === 'AM' ? 'PM' : 'AM'))}
                >
                  {period}
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod((prev) => (prev === 'AM' ? 'PM' : 'AM'))}
                  className="rounded-full bg-transparent p-1 text-slate-300 transition hover:text-white"
                >
                  <ArrowIcon direction="down" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-end gap-4 pt-3 text-sm font-semibold">
            <button
              type="button"
              onClick={cancelSelection}
              className="rounded-full border border-white/20 px-5 py-2 text-slate-300 transition hover:border-white/60 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applySelection}
              className="rounded-full bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 px-6 py-2 text-slate-900 shadow-lg shadow-teal-500/30 transition hover:brightness-105"
            >
              Set
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateTimeWidget

