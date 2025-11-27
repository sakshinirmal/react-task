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
const getMonthCells = (monthDate, today) => {
  const firstDay = startOfMonth(monthDate)
  const startOffset = firstDay.getDay()
  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
  const totalCells = Math.ceil((startOffset + lastDay) / 7) * 7

  return Array.from({ length: totalCells }, (_, index) => {
    const cellDate = new Date(firstDay)
    cellDate.setDate(cellDate.getDate() + index - startOffset)
    const normalized = startOfDay(cellDate)
    const isPast = normalized < today
    return {
      key: normalized.toISOString(),
      date: normalized,
      inCurrentMonth: normalized.getMonth() === monthDate.getMonth(),
      label: normalized.getDate(),
      disabled: isPast,
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

const DateTimeWidget = ({ onApply, dateOnly = false, initialDate }) => {
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)
  const today = useMemo(() => startOfDay(new Date()), [])
  const [isOpen, setIsOpen] = useState(false)

  // Load the last applied value (if any) so it persists on refresh.
  const [appliedDateTime, setAppliedDateTime] = useState(() => {
    // Use initialDate if provided
    if (initialDate) {
      const date = new Date(initialDate)
      date.setHours(0, 0, 0, 0)
      return date
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem('dateTimeWidget.applied')
        if (stored) {
          const parsed = new Date(stored)
          if (!Number.isNaN(parsed.getTime())) {
            // Never allow a saved value in the past relative to "today".
            if (parsed < today) return today
            return parsed
          }
        }
      } catch {
        // Ignore storage errors and fall back to "now/today".
      }
    }

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

  // Sync with initialDate prop changes
  useEffect(() => {
    if (initialDate) {
      const date = new Date(initialDate)
      date.setHours(0, 0, 0, 0)
      syncFromDate(date)
    }
  }, [initialDate])

  // Auto-scroll dropdown into view when it opens
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      // Small delay to ensure the dropdown is rendered
      setTimeout(() => {
        dropdownRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        })
      }, 100)
    }
  }, [isOpen])

  const monthCells = useMemo(
    () => getMonthCells(panelMonth, today),
    [panelMonth, today],
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
    // Prevent selection of past dates
    if (cell.disabled) return
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
    let finalDateTime
    if (dateOnly) {
      // For date-only mode, just use the selected date at midnight
      finalDateTime = startOfDay(selectedDate)
    } else {
      const combined = mergeDateTime(selectedDate, displayHour, displayMinute, period)
      // Ensure the combined datetime is not in the past
      const now = new Date()
      finalDateTime = combined < now ? now : combined
    }
    
    setAppliedDateTime(finalDateTime)

    // Persist to localStorage so the value survives page refresh (only if not dateOnly to avoid conflicts)
    if (!dateOnly && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('dateTimeWidget.applied', finalDateTime.toISOString())
      } catch {
        // If storage fails, we still update the UI; no crash.
      }
    }
    // SET button applies without closing the widget
    onApply?.(finalDateTime)
  }

  const cancelSelection = () => {
    syncFromDate(appliedDateTime)
    setIsOpen(false)
  }

  // Quick range options handlers
  const handleQuickRange = (range) => {
    const now = new Date()
    let targetDate = new Date()
    
    switch (range) {
      case 'today':
        targetDate = startOfDay(now)
        break
      case 'last7days':
        // Since we can't select past dates, "Last 7 Days" sets to today
        targetDate = today
        break
      case 'thisMonth':
        targetDate = startOfMonth(now)
        // If start of month is in the past, use today instead
        if (targetDate < today) {
          targetDate = today
        }
        break
      default:
        return
    }
    
    // Ensure we don't select a past date
    if (targetDate < today) {
      targetDate = today
    }
    
    syncFromDate(targetDate)
  }

  const formattedInput = useMemo(() => {
    if (dateOnly) {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(appliedDateTime)
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(appliedDateTime)
  }, [appliedDateTime, dateOnly])

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
      <h2 className="mb-4 text-center text-2xl font-semibold text-slate-100">Date Time Widget</h2>
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

      <div
        ref={dropdownRef}
        className={`mt-2 w-full overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? 'max-h-[32rem] opacity-100'
            : 'max-h-0 opacity-0 border-transparent'
        }`}
      >
        <div className={`mx-auto flex w-full max-w-[24rem] flex-col rounded-[36px] border border-white/8 bg-gradient-to-b from-slate-900/95 via-slate-900/85 to-slate-900/70 p-3 text-white shadow-[0_25px_60px_rgba(6,15,30,0.6)] backdrop-blur-2xl transition-all duration-300 ${
          isOpen ? 'overflow-y-auto' : 'overflow-hidden'
        }`}>
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

          {/* Quick range options */}
          <div className="mt-2 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickRange('today')}
              className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-white/40 hover:bg-white/10"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleQuickRange('last7days')}
              className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-white/40 hover:bg-white/10"
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => handleQuickRange('thisMonth')}
              className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-white/40 hover:bg-white/10"
            >
              This Month
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 text-center text-[0.6rem] uppercase tracking-[0.2em] text-slate-400">
            {DAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="mt-2 grid flex-1 grid-cols-7 text-center text-sm">
            {monthCells.map((cell) => {
              const selected = isSelected(cell.date)
              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => handleDateSelect(cell)}
                  disabled={cell.disabled}
                  className={[
                    'mx-auto flex h-6 w-6 items-center justify-center rounded-full text-xs transition',
                    cell.disabled
                      ? 'cursor-not-allowed opacity-30 text-slate-500'
                      : cell.inCurrentMonth
                        ? 'text-slate-100'
                        : 'text-slate-500',
                    selected && !cell.disabled
                      ? 'bg-gradient-to-br from-cyan-300 to-teal-400 text-slate-900 font-semibold shadow-lg shadow-teal-500/40'
                      : !cell.disabled && 'hover:bg-white/5',
                  ].join(' ')}
                >
                  {cell.label}
                </button>
              )
            })}
          </div>

          {!dateOnly && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => adjustHour(1)}
                    className="rounded-full bg-transparent text-slate-300 transition hover:text-white"
                  >
                    <ArrowIcon direction="up" />
                  </button>
                  <div className="rounded-2xl bg-white px-4 py-1 text-sm font-semibold text-[#0f0a26] shadow-inner shadow-slate-900/20">
                    {pad(displayHour)}
                  </div>
                  <button
                    type="button"
                    onClick={() => adjustHour(-1)}
                    className="rounded-full bg-transparent text-slate-300 transition hover:text-white"
                  >
                    <ArrowIcon direction="down" />
                  </button>
                </div>

                <span className="pb-3 text-3xl font-semibold text-slate-300">:</span>

                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => adjustMinute(1)}
                    className="rounded-full bg-transparent text-slate-300 transition hover:text-white"
                  >
                    <ArrowIcon direction="up" />
                  </button>
                  <div className="rounded-2xl bg-white px-4 py-1 text-sm font-semibold text-[#0f0a26] shadow-inner shadow-slate-900/20">
                    {pad(displayMinute)}
                  </div>
                  <button
                    type="button"
                    onClick={() => adjustMinute(-1)}
                    className="rounded-full bg-transparent text-slate-300 transition hover:text-white"
                  >
                    <ArrowIcon direction="down" />
                  </button>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPeriod((prev) => (prev === 'AM' ? 'PM' : 'AM'))}
                    className="rounded-full bg-transparent text-slate-300 transition hover:text-white"
                  >
                    <ArrowIcon direction="up" />
                  </button>
                  <button
                    type="button"
                    className="rounded-2xl border border-white/30 px-4 py-1 text-sm font-semibold text-white shadow-inner shadow-white/10 transition hover:border-white/60"
                    onClick={() => setPeriod((prev) => (prev === 'AM' ? 'PM' : 'AM'))}
                  >
                    {period}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod((prev) => (prev === 'AM' ? 'PM' : 'AM'))}
                    className="rounded-full bg-transparent text-slate-300 transition hover:text-white"
                  >
                    <ArrowIcon direction="down" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-auto flex items-center justify-center gap-4 pt-3 text-sm font-semibold">
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
      </div>
    </div>
  )
}

export default DateTimeWidget

