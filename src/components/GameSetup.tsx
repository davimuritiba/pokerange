import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import { formatNumber } from '../api/pokeapi'
import {
  allRange,
  customRange,
  customRangeError,
  generationsLabel,
  generationsRange,
  GENERATIONS,
  MIN_RANGE_SIZE,
  type DexRange,
} from '../game/ranges'
import { MODE_LABELS, type GameMode } from '../game/modes'
import { buildPlayers, type Player, type PlayMode } from '../game/players'
import { collapse, fadeUp, stagger } from '../lib/motion'
import { PlayersSetup } from './PlayersSetup'

interface Props {
  mode: GameMode
  dexSize: number
  /** Nomes da última partida, para não precisar digitar de novo. */
  initialNames: string[]
  onStart: (range: DexRange, players: Player[]) => void
}

type FilterId = 'all' | 'generations' | 'custom'

function toInt(value: string): number {
  return value.trim() === '' ? NaN : Number(value)
}

export function GameSetup({ mode, dexSize, initialNames, onStart }: Props) {
  const [selected, setSelected] = useState<FilterId>('all')
  const [generations, setGenerations] = useState<number[]>([1])
  const [customStart, setCustomStart] = useState('1')
  const [customEnd, setCustomEnd] = useState(String(dexSize))
  const [playMode, setPlayMode] = useState<PlayMode>('local')
  const [names, setNames] = useState<string[]>(initialNames)

  const start = toInt(customStart)
  const end = toInt(customEnd)
  const customError = customRangeError(start, end, dexSize)
  const generationsError = generations.length === 0 ? 'Escolha pelo menos uma geração.' : null

  let range: DexRange | null = null
  if (selected === 'all') range = allRange(dexSize)
  else if (selected === 'generations' && !generationsError)
    range = generationsRange(generations, dexSize)
  else if (selected === 'custom' && !customError) range = customRange(start, end)

  function toggleGeneration(n: number) {
    setGenerations((prev) => (prev.includes(n) ? prev.filter((g) => g !== n) : [...prev, n]))
  }

  const filters: { id: FilterId; label: string; detail: string }[] = [
    { id: 'all', label: 'Todas', detail: `${formatNumber(1)}–${formatNumber(dexSize)}` },
    { id: 'generations', label: 'Geração', detail: generationsLabel(generations) },
    {
      id: 'custom',
      label: 'Personalizado',
      detail: customError ? '?' : `${formatNumber(start)}–${formatNumber(end)}`,
    },
  ]

  return (
    <section className="panel setup">
      <p className="eyebrow">Modo {MODE_LABELS[mode].toLowerCase()}</p>
      <h2 className="setup-title">Escolha os Pokémon da partida</h2>

      <motion.div
        className="filters"
        role="radiogroup"
        aria-label="Filtro de Pokémon"
        variants={stagger(0.06, 0.1)}
        initial="initial"
        animate="animate"
      >
        {filters.map((f) => (
          <motion.button
            key={f.id}
            variants={fadeUp}
            whileTap={{ scale: 0.96 }}
            type="button"
            role="radio"
            aria-checked={selected === f.id}
            className={`filter${selected === f.id ? ' filter--active' : ''}`}
            onClick={() => setSelected(f.id)}
          >
            <span className="filter-label">{f.label}</span>
            <span className="filter-range">{f.detail}</span>
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence initial={false}>
        {selected === 'generations' && (
          <motion.div
            key="generations"
            className="setup-panel"
            variants={collapse}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="generations">
              <div className="generation-grid">
                {GENERATIONS.filter((g) => g.start <= dexSize).map((g) => {
                  const active = generations.includes(g.number)
                  return (
                    <motion.button
                      key={g.number}
                      type="button"
                      whileTap={{ scale: 0.93 }}
                      aria-pressed={active}
                      className={`generation${active ? ' generation--active' : ''}`}
                      onClick={() => toggleGeneration(g.number)}
                    >
                      <span className="generation-label">Gen {g.number}</span>
                      <span className="generation-range">
                        {formatNumber(g.start)}–{formatNumber(Math.min(g.end, dexSize))}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
              <div className="generation-actions">
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setGenerations(GENERATIONS.map((g) => g.number))}
                >
                  Marcar todas
                </button>
                <button type="button" className="link-btn" onClick={() => setGenerations([])}>
                  Limpar
                </button>
              </div>
              {generationsError && <p className="hint">{generationsError}</p>}
            </div>
          </motion.div>
        )}

        {selected === 'custom' && (
          <motion.div
            key="custom"
            className="setup-panel"
            variants={collapse}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="custom-range">
              <DualRangeSlider
                min={1}
                max={dexSize}
                start={start}
                end={end}
                onChange={(a, b) => {
                  setCustomStart(String(a))
                  setCustomEnd(String(b))
                }}
              />
              <div className="custom-inputs">
                <NumberField
                  id="custom-start"
                  label="De"
                  value={customStart}
                  dexSize={dexSize}
                  onChange={setCustomStart}
                />
                <NumberField
                  id="custom-end"
                  label="Até"
                  value={customEnd}
                  dexSize={dexSize}
                  onChange={setCustomEnd}
                />
              </div>
              {customError && <p className="hint">{customError}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <h2 className="setup-title setup-title--section">Jogadores</h2>
      <PlayersSetup
        playMode={playMode}
        names={names}
        onPlayModeChange={setPlayMode}
        onNamesChange={setNames}
      />

      <button
        className="btn btn-primary setup-start"
        disabled={!range || playMode !== 'local'}
        onClick={() => range && onStart(range, buildPlayers(names))}
      >
        Começar
      </button>
    </section>
  )
}

interface DualRangeSliderProps {
  min: number
  max: number
  start: number
  end: number
  onChange: (start: number, end: number) => void
}

type Handle = 'start' | 'end'

/**
 * Uma única barra com dois pontos. O arraste é feito à mão (pointer events)
 * para funcionar mesmo quando os pontos estão colados: nesse caso, a direção
 * do movimento decide qual ponto anda. Clicar na barra puxa o ponto mais próximo.
 */
function DualRangeSlider({ min, max, start, end, onChange }: DualRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<Handle | 'undecided' | null>(null)

  const gap = MIN_RANGE_SIZE - 1
  const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi)
  const a = Number.isInteger(start) ? clamp(start, min, max - gap) : min
  const b = Number.isInteger(end) ? clamp(end, a + gap, max) : max
  const pct = (n: number) => ((n - min) / (max - min)) * 100

  function valueAt(clientX: number): number {
    const rect = trackRef.current!.getBoundingClientRect()
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
    return Math.round(min + ratio * (max - min))
  }

  function move(handle: Handle, value: number) {
    if (handle === 'start') onChange(clamp(value, min, b - gap), b)
    else onChange(a, clamp(value, a + gap, max))
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    const rect = trackRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const distA = Math.abs(x - (pct(a) / 100) * rect.width)
    const distB = Math.abs(x - (pct(b) / 100) * rect.width)
    const touching = distA < 14 && distB < 14
    if (touching) {
      dragging.current = 'undecided'
    } else {
      const handle = distA < distB ? 'start' : 'end'
      dragging.current = handle
      move(handle, valueAt(e.clientX))
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return
    const value = valueAt(e.clientX)
    if (dragging.current === 'undecided') {
      if (value < a) dragging.current = 'start'
      else if (value > b) dragging.current = 'end'
      else return
    }
    move(dragging.current, value)
  }

  function handleKeyDown(handle: Handle, e: React.KeyboardEvent<HTMLDivElement>) {
    const current = handle === 'start' ? a : b
    const steps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowDown: -1,
      ArrowRight: 1,
      ArrowUp: 1,
      PageDown: -10,
      PageUp: 10,
      Home: -Infinity,
      End: Infinity,
    }
    if (!(e.key in steps)) return
    e.preventDefault()
    move(handle, clamp(current + steps[e.key], min, max))
  }

  const stopDragging = () => {
    dragging.current = null
  }

  return (
    <div
      className="dual-slider"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
    >
      <div className="dual-slider-track" ref={trackRef}>
        <div
          className="dual-slider-fill"
          style={{ left: `${pct(a)}%`, width: `${pct(b) - pct(a)}%` }}
        />
        {(['start', 'end'] as const).map((handle) => {
          const value = handle === 'start' ? a : b
          return (
            <div
              key={handle}
              className="dual-slider-thumb"
              style={{ left: `${pct(value)}%` }}
              role="slider"
              tabIndex={0}
              aria-label={handle === 'start' ? 'Início do intervalo' : 'Fim do intervalo'}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={value}
              onKeyDown={(e) => handleKeyDown(handle, e)}
            />
          )
        })}
      </div>
    </div>
  )
}

interface NumberFieldProps {
  id: string
  label: string
  value: string
  dexSize: number
  onChange: (value: string) => void
}

function NumberField({ id, label, value, dexSize, onChange }: NumberFieldProps) {
  return (
    <div className="number-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={1}
        max={dexSize}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
