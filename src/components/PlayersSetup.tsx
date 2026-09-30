import { AnimatePresence, motion } from 'motion/react'
import { MAX_PLAYERS, MIN_PLAYERS, PLAYER_COLORS, type PlayMode } from '../game/players'
import { useI18n } from '../i18n/context'
import { collapse } from '../lib/motion'

interface Props {
  playMode: PlayMode
  names: string[]
  onPlayModeChange: (mode: PlayMode) => void
  onNamesChange: (names: string[]) => void
}

/** Escolha de local/online, quantidade de jogadores e nomes. */
export function PlayersSetup({ playMode, names, onPlayModeChange, onNamesChange }: Props) {
  const { t } = useI18n()
  function setCount(count: number) {
    const next = names.slice(0, count)
    while (next.length < count) next.push('')
    onNamesChange(next)
  }

  function rename(index: number, name: string) {
    onNamesChange(names.map((n, i) => (i === index ? name : n)))
  }

  return (
    <div className="players-setup">
      <div className="filters" role="radiogroup" aria-label={t.playTypeAria}>
        <motion.button
          type="button"
          role="radio"
          aria-checked={playMode === 'local'}
          className={`filter${playMode === 'local' ? ' filter--active' : ''}`}
          whileTap={{ scale: 0.96 }}
          onClick={() => onPlayModeChange('local')}
        >
          <span className="filter-label">{t.local}</span>
          <span className="filter-range">{t.localDetail}</span>
        </motion.button>
        <button type="button" role="radio" aria-checked={false} className="filter" disabled>
          <span className="filter-label">{t.online}</span>
          <span className="filter-range">{t.onlineDetail}</span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {playMode === 'local' && (
          <motion.div
            key="local"
            className="setup-panel"
            variants={collapse}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="players-local">
              <div className="stepper" role="group" aria-label={t.playerCountAria}>
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => setCount(names.length - 1)}
                  disabled={names.length <= MIN_PLAYERS}
                  aria-label={t.fewerPlayers}
                >
                  −
                </button>
                <span className="stepper-value" aria-live="polite">
                  {t.playerCount(names.length)}
                </span>
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => setCount(names.length + 1)}
                  disabled={names.length >= MAX_PLAYERS}
                  aria-label={t.morePlayers}
                >
                  +
                </button>
              </div>

              {names.length > 1 && <p className="players-hint">{t.playersHint}</p>}

              <ul className="player-list">
                <AnimatePresence initial={false}>
                  {names.map((name, i) => (
                    <motion.li
                      key={i}
                      layout
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                    >
                      <span
                        className="player-dot"
                        style={{ background: PLAYER_COLORS[i % PLAYER_COLORS.length] }}
                      />
                      <input
                        type="text"
                        value={name}
                        maxLength={16}
                        placeholder={t.defaultPlayer(i)}
                        aria-label={t.playerNameAria(i)}
                        onChange={(e) => rename(i, e.target.value)}
                      />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
