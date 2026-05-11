'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface SearchOption {
  id: string
  slug: string
  title: string
}

interface SearchSelectProps {
  label: string
  type: 'contacts' | 'companies'
  value: string
  valueName: string
  onChange: (id: string, name: string) => void
  placeholder?: string
}

export default function SearchSelect({ label, type, value, valueName, onChange, placeholder }: SearchSelectProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchOption[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/search-options?type=${type}&q=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json() as { results: SearchOption[] }
        setResults(data.results)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [type])

  const handleInputChange = useCallback((val: string) => {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      search(val)
    }, 300)
  }, [search])

  // Load initial results when dropdown opens
  const handleFocus = useCallback(() => {
    setIsOpen(true)
    if (results.length === 0) {
      search(query)
    }
  }, [results.length, search, query])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = useCallback((option: SearchOption) => {
    onChange(option.id, option.title)
    setQuery('')
    setIsOpen(false)
  }, [onChange])

  const handleClear = useCallback(() => {
    onChange('', '')
    setQuery('')
    setResults([])
  }, [onChange])

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      {value ? (
        <div className="flex items-center gap-2 w-full bg-slate-800/50 border border-brand-border rounded-lg px-3 py-2.5 text-sm">
          <span className="text-white flex-1 truncate">{valueName}</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          placeholder={placeholder || `Search ${label.toLowerCase()}...`}
          className="w-full bg-slate-800/50 border border-brand-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand-accent/50 transition-colors"
        />
      )}

      {isOpen && !value && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-brand-card border border-brand-border rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <svg className="animate-spin w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-3 text-xs text-slate-500 text-center">
              {query ? 'No results found' : 'Type to search...'}
            </div>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelect(r)}
                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {r.title}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
