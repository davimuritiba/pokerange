import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { formatName, type PokemonEntry } from '../api/pokeapi'
import { useI18n } from '../i18n/context'

interface Props {
  pokedex: PokemonEntry[]
  onSubmit: (entry: PokemonEntry) => void
  disabled?: boolean
}

const MAX_SUGGESTIONS = 8

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\s.'’:-]+/g, '')
}

export function PokemonSearch({ pokedex, onSubmit, disabled }: Props) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<PokemonEntry | null>(null)
  const [highlight, setHighlight] = useState(0)
  const [open, setOpen] = useState(false)

  const suggestions = useMemo(() => {
    const q = normalize(query)
    if (!q) return []
    const exact: PokemonEntry[] = []
    const starts: PokemonEntry[] = []
    const contains: PokemonEntry[] = []
    for (const entry of pokedex) {
      const name = normalize(entry.name)
      if (name === q) exact.push(entry)
      else if (name.startsWith(q)) starts.push(entry)
      else if (name.includes(q)) contains.push(entry)
    }
    return [...exact, ...starts, ...contains].slice(0, MAX_SUGGESTIONS)
  }, [query, pokedex])

  function choose(entry: PokemonEntry) {
    setSelected(entry)
    setQuery(formatName(entry.name))
    setOpen(false)
  }

  function submit() {
    const entry =
      selected ??
      pokedex.find((e) => normalize(e.name) === normalize(query)) ??
      (suggestions.length === 1 ? suggestions[0] : null)
    if (!entry) return
    onSubmit(entry)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' && suggestions.length) {
      e.preventDefault()
      setOpen(true)
      setHighlight((h) => (h + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp' && suggestions.length) {
      e.preventDefault()
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (open && suggestions[highlight] && !selected) choose(suggestions[highlight])
      else submit()
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const canSubmit =
    !disabled && (selected !== null || pokedex.some((e) => normalize(e.name) === normalize(query)))

  return (
    <form
      className="search"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <div className="search-field">
        <input
          type="text"
          value={query}
          placeholder={t.searchPlaceholder}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          aria-label={t.searchAria}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelected(null)
            setHighlight(0)
            setOpen(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
        />
        <AnimatePresence>
          {open && suggestions.length > 0 && !selected && (
            <motion.ul
              className="suggestions"
              role="listbox"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {suggestions.map((entry, i) => (
                <li
                  key={entry.id}
                  role="option"
                  aria-selected={i === highlight}
                  className={i === highlight ? 'active' : undefined}
                  onMouseEnter={() => setHighlight(i)}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    choose(entry)
                  }}
                >
                  {formatName(entry.name)}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
        {t.guess}
      </button>
    </form>
  )
}
