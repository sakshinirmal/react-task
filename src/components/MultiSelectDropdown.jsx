import { useEffect, useMemo, useRef, useState } from 'react'

// Simulate async API call for dropdown options
const fetchOptions = async (searchQuery = '') => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Mock data - in real app, this would be an API call
  const allOptions = [
    { id: '1', label: 'Apple', category: 'Fruits' },
    { id: '2', label: 'Banana', category: 'Fruits' },
    { id: '3', label: 'Cherry', category: 'Fruits' },
    { id: '4', label: 'Date', category: 'Fruits' },
    { id: '5', label: 'Elderberry', category: 'Fruits' },
    { id: '6', label: 'Fig', category: 'Fruits' },
    { id: '7', label: 'Grape', category: 'Fruits' },
    { id: '8', label: 'Honeydew', category: 'Fruits' },
    { id: '9', label: 'Kiwi', category: 'Fruits' },
    { id: '10', label: 'Lemon', category: 'Fruits' },
    { id: '11', label: 'Mango', category: 'Fruits' },
    { id: '12', label: 'Orange', category: 'Fruits' },
    { id: '13', label: 'Papaya', category: 'Fruits' },
    { id: '14', label: 'Quince', category: 'Fruits' },
    { id: '15', label: 'Raspberry', category: 'Fruits' },
    { id: '16', label: 'Strawberry', category: 'Fruits' },
    { id: '17', label: 'Tomato', category: 'Vegetables' },
    { id: '18', label: 'Carrot', category: 'Vegetables' },
    { id: '19', label: 'Broccoli', category: 'Vegetables' },
    { id: '20', label: 'Spinach', category: 'Vegetables' },
  ]

  // Filter options based on search query
  if (searchQuery.trim() === '') {
    return allOptions
  }

  const query = searchQuery.toLowerCase()
  return allOptions.filter(
    (option) =>
      option.label.toLowerCase().includes(query) ||
      option.category.toLowerCase().includes(query),
  )
}

const MultiSelectDropdown = () => {
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState([])
  const [options, setOptions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  // Load options on mount and when search query changes
  useEffect(() => {
    let isCancelled = false

    const loadOptions = async () => {
      setIsLoading(true)
      try {
        const fetchedOptions = await fetchOptions(searchQuery)
        if (!isCancelled) {
          setOptions(fetchedOptions)
          setHighlightedIndex(-1)
        }
      } catch (error) {
        console.error('Error fetching options:', error)
        if (!isCancelled) {
          setOptions([])
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadOptions()

    return () => {
      isCancelled = true
    }
  }, [searchQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false)
        setSearchQuery('')
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter options that are not selected
  const availableOptions = useMemo(() => {
    const selectedIds = new Set(selectedItems.map((item) => item.id))
    return options.filter((option) => !selectedIds.has(option.id))
  }, [options, selectedItems])

  const handleToggleOption = (option) => {
    setSelectedItems((prev) => {
      const isSelected = prev.some((item) => item.id === option.id)
      if (isSelected) {
        return prev.filter((item) => item.id !== option.id)
      } else {
        return [...prev, option]
      }
    })
    setSearchQuery('')
    inputRef.current?.focus()
  }

  const handleRemoveItem = (itemId) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId))
    inputRef.current?.focus()
  }

  const handleClearAll = () => {
    setSelectedItems([])
    setSearchQuery('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (event) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setIsOpen(true)
        inputRef.current?.focus()
      }
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setHighlightedIndex((prev) =>
          prev < availableOptions.length - 1 ? prev + 1 : prev,
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        event.preventDefault()
        if (highlightedIndex >= 0 && availableOptions[highlightedIndex]) {
          handleToggleOption(availableOptions[highlightedIndex])
        }
        break
      case 'Escape':
        event.preventDefault()
        setIsOpen(false)
        setSearchQuery('')
        setHighlightedIndex(-1)
        break
      case 'Backspace':
        if (searchQuery === '' && selectedItems.length > 0) {
          event.preventDefault()
          handleRemoveItem(selectedItems[selectedItems.length - 1].id)
        }
        break
      default:
        break
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <h2 className="mb-4 text-center text-2xl font-semibold text-slate-100">
        Multi-Select Dropdown
      </h2>

      <div className="relative">
        {/* Input and selected chips container */}
        <div
          className="flex min-h-[3rem] w-full flex-wrap items-center gap-2 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-slate-800/30 px-4 py-2 text-base text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition focus-within:outline focus-within:outline-2 focus-within:outline-cyan-300/60"
          onClick={() => {
            setIsOpen(true)
            inputRef.current?.focus()
          }}
        >
          {/* Selected chips */}
          {selectedItems.map((item) => (
            <span
              key={item.id}
              className="group flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400/20 to-teal-400/20 px-3 py-1 text-sm font-medium text-slate-100 ring-1 ring-cyan-400/30 transition hover:from-cyan-400/30 hover:to-teal-400/30"
            >
              <span>{item.label}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveItem(item.id)
                }}
                className="ml-1 rounded-full p-0.5 text-slate-300 transition hover:bg-slate-700/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
                aria-label={`Remove ${item.label}`}
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))}

          {/* Search input */}
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setIsOpen(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={
              selectedItems.length === 0
                ? 'Search and select options...'
                : ''
            }
            className="flex-1 min-w-[8rem] bg-transparent text-slate-100 placeholder:text-slate-400 focus:outline-none"
            aria-label="Search options"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            role="combobox"
          />

          {/* Dropdown toggle icon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen((prev) => !prev)
              inputRef.current?.focus()
            }}
            className="flex-shrink-0 rounded-full p-1 text-slate-300 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
            aria-label="Toggle dropdown"
          >
            <svg
              className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Clear All button */}
        {selectedItems.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="mt-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm font-medium text-slate-200 transition hover:border-white/40 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
          >
            Clear All
          </button>
        )}

        {/* Dropdown menu */}
        <div
          ref={dropdownRef}
          className={`mt-2 w-full overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-b from-slate-900/95 via-slate-900/85 to-slate-900/70 shadow-[0_25px_60px_rgba(6,15,30,0.6)] backdrop-blur-2xl transition-all duration-300 ease-in-out ${
            isOpen
              ? 'max-h-64 opacity-100 overflow-y-auto'
              : 'max-h-0 opacity-0 border-transparent shadow-none'
          }`}
          role="listbox"
        >
            {isLoading ? (
              <div className="flex items-center justify-center px-4 py-8">
                <div className="flex items-center gap-2 text-slate-300">
                  <svg
                    className="h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Loading...</span>
                </div>
              </div>
            ) : availableOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400">
                {searchQuery.trim() === ''
                  ? 'No more options available'
                  : 'No options found'}
              </div>
            ) : (
              <ul className="py-2" role="listbox">
                {availableOptions.map((option, index) => (
                  <li
                    key={option.id}
                    role="option"
                    aria-selected={selectedItems.some(
                      (item) => item.id === option.id,
                    )}
                    className={`cursor-pointer px-4 py-2.5 transition ${
                      index === highlightedIndex
                        ? 'bg-cyan-400/20 text-cyan-200'
                        : 'text-slate-200 hover:bg-white/5'
                    }`}
                    onClick={() => handleToggleOption(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {option.category && (
                        <span className="text-xs text-slate-400">
                          {option.category}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>

      {/* Selected count display */}
      {selectedItems.length > 0 && (
        <div className="mt-3 text-center text-sm text-slate-400">
          {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}{' '}
          selected
        </div>
      )}
    </div>
  )
}

export default MultiSelectDropdown

