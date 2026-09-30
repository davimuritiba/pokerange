import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import {
  fetchPokemon,
  formatName,
  formatNumber,
  type Pokemon,
  type PokemonEntry,
} from '../api/pokeapi'
import { MAX_POINTS, ROUNDS_PER_GAME, scoreForDistance, verdictFor } from '../game/scoring'
import { describeRange, drawTargets, inRange, rangeSize, type DexRange } from '../game/ranges'
import type { GameMode } from '../game/modes'
import type { Player } from '../game/players'
import { useI18n } from '../i18n/context'
import { bouncy, fadeUp, page, spring, stagger } from '../lib/motion'
import { AnimatedNumber } from './AnimatedNumber'
import { NumberGuess } from './NumberGuess'
import { PokemonCard } from './PokemonCard'
import { PokemonSearch } from './PokemonSearch'

interface Props {
  /**
   * classic: aparece um número, o jogador chuta um Pokémon.
   * inverted: aparece um Pokémon, o jogador chuta o número.
   */
  mode: GameMode
  pokedex: PokemonEntry[]
  range: DexRange
  /** Jogadores locais: cada um chuta na sua vez, no mesmo aparelho. */
  players: Player[]
  onChangeFilter: () => void
  onExit: () => void
}

interface Guess {
  playerId: number
  /** Pokémon do número chutado (no invertido, o que tem aquele número). */
  guess: PokemonEntry
  distance: number
  points: number
}

type Phase = 'guessing' | 'revealed' | 'finished'

/** Nome do jogador; quem não digitou nome vira "Jogador 2" / "Player 2". */
function usePlayerName() {
  const { t } = useI18n()
  return (p: Player) => p.name || t.defaultPlayer(p.id)
}

export function Game({ mode, pokedex, range, players, onChangeFilter, onExit }: Props) {
  const { t } = useI18n()
  const nameOf = usePlayerName()
  const [targets, setTargets] = useState(() => drawTargets(range, ROUNDS_PER_GAME))
  const [round, setRound] = useState(0)
  const [turn, setTurn] = useState(0)
  const [phase, setPhase] = useState<Phase>('guessing')
  /** Palpites de cada rodada: `results[rodada]` tem um palpite por jogador. */
  const [results, setResults] = useState<Guess[][]>([])
  const [targetPokemon, setTargetPokemon] = useState<Pokemon | null>(null)
  const [guessPokemon, setGuessPokemon] = useState<Pokemon | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)

  const solo = players.length === 1
  const target = targets[round]
  const roundGuesses = results[round] ?? []
  const answer = targetPokemon?.id === target ? targetPokemon : null
  const currentPlayer = players[turn]
  // Só dá para chutar Pokémon dentro do filtro escolhido.
  const guessable = useMemo(() => pokedex.filter((e) => inRange(e.id, range)), [pokedex, range])
  const targetName = (id: number) => pokedex.find((e) => e.id === id)?.name ?? `#${id}`

  // Enquanto a rodada está aberta, o placar só conta as rodadas já reveladas,
  // para ninguém descobrir pelos pontos o quão perto o jogador anterior chegou.
  const scoredRounds = phase === 'guessing' ? results.slice(0, round) : results
  const totals = players.map((p) =>
    scoredRounds.reduce((sum, r) => sum + (r.find((g) => g.playerId === p.id)?.points ?? 0), 0),
  )

  // Pré-carrega o Pokémon alvo enquanto os jogadores pensam.
  useEffect(() => {
    let cancelled = false
    fetchPokemon(target)
      .then((p) => !cancelled && setTargetPokemon(p))
      .catch(() => !cancelled && setLoadFailed(true))
    return () => {
      cancelled = true
    }
  }, [target])

  function handleNumberGuess(number: number) {
    handleGuess(pokedex.find((e) => e.id === number) ?? { id: number, name: `#${number}` })
  }

  function handleGuess(entry: PokemonEntry) {
    const distance = Math.abs(entry.id - target)
    const guess: Guess = {
      playerId: currentPlayer.id,
      guess: entry,
      distance,
      points: scoreForDistance(distance, rangeSize(range)),
    }
    setResults((prev) => {
      const next = [...prev]
      next[round] = [...(next[round] ?? []), guess]
      return next
    })

    // Ainda falta alguém chutar: passa a vez sem revelar nada.
    if (turn + 1 < players.length) {
      setTurn(turn + 1)
      return
    }

    setPhase('revealed')
    if (solo) {
      setGuessPokemon(null)
      fetchPokemon(entry.id)
        .then(setGuessPokemon)
        .catch(() => setGuessPokemon({ ...entry, image: null }))
    }
  }

  function nextRound() {
    if (round + 1 >= ROUNDS_PER_GAME) {
      setPhase('finished')
      return
    }
    setRound(round + 1)
    setTurn(0)
    setPhase('guessing')
    setLoadFailed(false)
  }

  function restart() {
    setTargets(drawTargets(range, ROUNDS_PER_GAME))
    setRound(0)
    setTurn(0)
    setResults([])
    setPhase('guessing')
    setLoadFailed(false)
  }

  if (phase === 'finished') {
    return solo ? (
      <SoloSummary
        mode={mode}
        range={range}
        results={results.map((r) => r[0])}
        targets={targets}
        total={totals[0]}
        targetName={targetName}
        onRestart={restart}
        onChangeFilter={onChangeFilter}
        onExit={onExit}
      />
    ) : (
      <PartySummary
        mode={mode}
        range={range}
        players={players}
        results={results}
        targets={targets}
        totals={totals}
        targetName={targetName}
        onRestart={restart}
        onChangeFilter={onChangeFilter}
        onExit={onExit}
      />
    )
  }

  const soloGuess = solo ? roundGuesses[0] : undefined
  const perfect = soloGuess?.distance === 0
  const guessKey = `${round}-${turn}`

  return (
    <motion.section className="panel game" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className="game-header">
        <span>
          {t.round} <strong>{round + 1}</strong> {t.of} {ROUNDS_PER_GAME}
        </span>
        <span className="range-tag">
          {t.rangeLabel(range.label)}
          {range.segments.length === 1 && ` · ${describeRange(range)}`}
        </span>
        {solo ? (
          <span>
            {t.points}{' '}
            <strong>
              <AnimatedNumber value={totals[0]} duration={0.6} />
            </strong>
          </span>
        ) : (
          <span>{t.playerCount(players.length)}</span>
        )}
      </header>

      {!solo && (
        <ul className="scoreboard">
          {players.map((p, i) => {
            const active = phase === 'guessing' && i === turn
            const done = phase === 'guessing' && i < turn
            return (
              <motion.li
                key={p.id}
                className={`score-chip${active ? ' score-chip--active' : ''}`}
                style={{ borderColor: active ? p.color : undefined }}
                animate={{ scale: active ? 1.06 : 1 }}
                transition={spring}
              >
                <span className="player-dot" style={{ background: p.color }} />
                <span className="score-chip-name">{nameOf(p)}</span>
                <strong>
                  <AnimatedNumber value={totals[i]} duration={0.6} />
                </strong>
                {done && (
                  <span className="score-chip-check" aria-label={t.alreadyGuessed}>
                    ✓
                  </span>
                )}
              </motion.li>
            )
          })}
        </ul>
      )}

      {mode === 'classic' && (
        <div className="target">
          <p className="eyebrow">{t.findClosest}</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={round}
              className="target-number"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1, transition: bouncy }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            >
              {formatNumber(target)}
            </motion.p>
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {phase === 'guessing' ? (
          <motion.div
            key={`guess-${round}`}
            variants={page}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {mode === 'inverted' && (
              <div className="target">
                <p className="eyebrow">{t.whichNumber}</p>
                <div className="target-pokemon">
                  {answer?.image ? (
                    <motion.img
                      key={answer.id}
                      src={answer.image}
                      alt={formatName(answer.name)}
                      initial={{ opacity: 0, scale: 0.6, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={bouncy}
                    />
                  ) : (
                    <div className="poke-card-placeholder">{answer ? '?' : '…'}</div>
                  )}
                </div>
                <p className="target-name">{answer ? formatName(answer.name) : t.loading}</p>
              </div>
            )}

            {/* Troca animada a cada jogador que passa a vez. */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={guessKey}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0, transition: spring }}
                exit={{ opacity: 0, x: -24, transition: { duration: 0.15 } }}
              >
                {!solo && (
                  <p className="turn-banner">
                    {t.turnOf}{' '}
                    <span style={{ color: currentPlayer.color }}>{nameOf(currentPlayer)}</span>
                  </p>
                )}
                {mode === 'classic' ? (
                  <PokemonSearch key={guessKey} pokedex={guessable} onSubmit={handleGuess} />
                ) : (
                  <NumberGuess
                    key={guessKey}
                    range={range}
                    onSubmit={handleNumberGuess}
                    disabled={!answer}
                  />
                )}
              </motion.div>
            </AnimatePresence>
            {loadFailed && <p className="error">{t.errors.round}</p>}
          </motion.div>
        ) : soloGuess ? (
          <motion.div
            key={`reveal-${round}`}
            className="reveal"
            variants={page}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="reveal-score">
              <motion.p
                className="verdict"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={
                  perfect
                    ? { opacity: 1, scale: [0.6, 1.25, 1], rotate: [0, -6, 6, 0] }
                    : { opacity: 1, scale: 1 }
                }
                transition={perfect ? { duration: 0.6 } : bouncy}
              >
                {t.verdicts[verdictFor(soloGuess.distance, soloGuess.points)]}
              </motion.p>
              <p className="points">
                <AnimatedNumber value={soloGuess.points} prefix="+" delay={0.15} />
              </p>
              <p className="distance">
                {soloGuess.distance === 0 ? t.exactHit : t.distanceAway(soloGuess.distance)}
              </p>
              {mode === 'inverted' && answer && (
                <p className="distance">
                  {t.invertedRecap(
                    formatName(answer.name),
                    formatNumber(answer.id),
                    formatNumber(soloGuess.guess.id),
                  )}
                </p>
              )}
            </div>
            <div className="reveal-cards">
              <PokemonCard label={t.yourGuess} pokemon={guessPokemon} from="left" />
              <PokemonCard label={t.answer} pokemon={answer} highlight from="right" delay={0.15} />
            </div>
            <NextButton last={round + 1 >= ROUNDS_PER_GAME} onClick={nextRound} />
          </motion.div>
        ) : (
          <motion.div
            key={`reveal-${round}`}
            className="reveal"
            variants={page}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="reveal-party">
              <PokemonCard label={t.answer} pokemon={answer} highlight from="left" />
              <RoundRanking mode={mode} players={players} guesses={roundGuesses} />
            </div>
            <NextButton last={round + 1 >= ROUNDS_PER_GAME} onClick={nextRound} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

function NextButton({ last, onClick }: { last: boolean; onClick: () => void }) {
  const { t } = useI18n()
  return (
    <motion.button
      className="btn btn-primary"
      onClick={onClick}
      autoFocus
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.35 }}
    >
      {last ? t.seeResults : t.nextRound}
    </motion.button>
  )
}

interface RoundRankingProps {
  mode: GameMode
  players: Player[]
  guesses: Guess[]
}

/** Palpites de todos na rodada, do mais perto ao mais longe. */
function RoundRanking({ mode, players, guesses }: RoundRankingProps) {
  const { t } = useI18n()
  const nameOf = usePlayerName()
  const sorted = [...guesses].sort((a, b) => b.points - a.points)
  return (
    <motion.ol
      className="round-ranking"
      variants={stagger(0.12, 0.2)}
      initial="initial"
      animate="animate"
    >
      {sorted.map((g) => {
        const player = players.find((p) => p.id === g.playerId)!
        return (
          <motion.li key={g.playerId} variants={fadeUp} style={{ borderLeftColor: player.color }}>
            <div className="round-ranking-info">
              <div className="round-ranking-player">
                <strong style={{ color: player.color }}>{nameOf(player)}</strong>
                <span className="round-ranking-verdict">
                  {t.verdicts[verdictFor(g.distance, g.points)]}
                </span>
              </div>
              <div className="round-ranking-guess">
                {mode === 'classic' ? (
                  <>
                    {formatName(g.guess.name)} <small>{formatNumber(g.guess.id)}</small>
                  </>
                ) : (
                  <>
                    {t.guessedNumber(formatNumber(g.guess.id))}{' '}
                    <small>({formatName(g.guess.name)})</small>
                  </>
                )}
                <small> · {g.distance === 0 ? t.exact : t.distanceAway(g.distance)}</small>
              </div>
            </div>
            <span className="round-ranking-points">
              <AnimatedNumber value={g.points} prefix="+" delay={0.3} />
            </span>
          </motion.li>
        )
      })}
    </motion.ol>
  )
}

interface SummaryActionsProps {
  onRestart: () => void
  onChangeFilter: () => void
  onExit: () => void
}

function SummaryActions({ onRestart, onChangeFilter, onExit }: SummaryActionsProps) {
  const { t } = useI18n()
  return (
    <motion.div className="actions" variants={fadeUp}>
      <button className="btn btn-primary" onClick={onRestart}>
        {t.playAgain}
      </button>
      <button className="btn btn-ghost" onClick={onChangeFilter}>
        {t.changeFilter}
      </button>
      <button className="btn btn-ghost" onClick={onExit}>
        {t.mainMenu}
      </button>
    </motion.div>
  )
}

interface SoloSummaryProps extends SummaryActionsProps {
  mode: GameMode
  range: DexRange
  results: Guess[]
  targets: number[]
  total: number
  targetName: (id: number) => string
}

function SoloSummary({
  mode,
  range,
  results,
  targets,
  total,
  targetName,
  ...actions
}: SoloSummaryProps) {
  const { t } = useI18n()
  const max = MAX_POINTS * ROUNDS_PER_GAME
  return (
    <motion.section
      className="panel summary"
      variants={stagger(0.08)}
      initial="initial"
      animate="animate"
    >
      <motion.p className="eyebrow" variants={fadeUp}>
        {t.gameOver} · {t.rangeLabel(range.label)}
      </motion.p>
      <motion.h2 className="summary-score" variants={fadeUp}>
        <AnimatedNumber value={total} duration={1.2} delay={0.2} />
        <span> / {max.toLocaleString(t.locale)}</span>
      </motion.h2>
      <motion.table className="summary-table" variants={fadeUp}>
        <thead>
          <tr>
            <th>{t.round}</th>
            <th>{mode === 'classic' ? t.number : t.pokemon}</th>
            <th>{t.yourGuess}</th>
            <th>{t.distance}</th>
            <th>{t.points}</th>
          </tr>
        </thead>
        <motion.tbody variants={stagger(0.08, 0.3)}>
          {results.map((r, i) => (
            <motion.tr key={i} variants={fadeUp}>
              <td>{i + 1}</td>
              {mode === 'classic' ? (
                <>
                  <td>{formatNumber(targets[i])}</td>
                  <td>
                    {formatName(r.guess.name)} <small>{formatNumber(r.guess.id)}</small>
                  </td>
                </>
              ) : (
                <>
                  <td>
                    {formatName(targetName(targets[i]))} <small>{formatNumber(targets[i])}</small>
                  </td>
                  <td>{formatNumber(r.guess.id)}</td>
                </>
              )}
              <td>{r.distance}</td>
              <td>{r.points}</td>
            </motion.tr>
          ))}
        </motion.tbody>
      </motion.table>
      <SummaryActions {...actions} />
    </motion.section>
  )
}

interface PartySummaryProps extends SummaryActionsProps {
  mode: GameMode
  range: DexRange
  players: Player[]
  results: Guess[][]
  targets: number[]
  totals: number[]
  targetName: (id: number) => string
}

function PartySummary({
  mode,
  range,
  players,
  results,
  targets,
  totals,
  targetName,
  ...actions
}: PartySummaryProps) {
  const { t } = useI18n()
  const nameOf = usePlayerName()
  const ranking = players
    .map((p, i) => ({ player: p, total: totals[i] }))
    .sort((a, b) => b.total - a.total)
  const best = ranking[0].total
  const winners = ranking.filter((r) => r.total === best).map((r) => nameOf(r.player))
  const title = winners.length === 1 ? t.winner(winners[0]) : t.tie(winners)

  return (
    <motion.section
      className="panel summary"
      variants={stagger(0.08)}
      initial="initial"
      animate="animate"
    >
      <motion.p className="eyebrow" variants={fadeUp}>
        {t.gameOver} · {t.rangeLabel(range.label)}
      </motion.p>
      <motion.h2
        className="summary-winner"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...bouncy, delay: 0.15 }}
      >
        {title}
      </motion.h2>

      <motion.ol className="final-ranking" variants={stagger(0.1, 0.3)}>
        {ranking.map((r) => (
          <motion.li
            key={r.player.id}
            variants={fadeUp}
            className={r.total === best ? 'final-ranking--winner' : undefined}
            style={{ borderLeftColor: r.player.color }}
          >
            <span className="final-ranking-position">
              {t.ordinal(ranking.findIndex((x) => x.total === r.total) + 1)}
            </span>
            <strong className="final-ranking-name" style={{ color: r.player.color }}>
              {nameOf(r.player)}
            </strong>
            <span className="final-ranking-total">
              <AnimatedNumber value={r.total} duration={1.2} delay={0.4} />
            </span>
          </motion.li>
        ))}
      </motion.ol>

      <motion.div className="table-scroll" variants={fadeUp}>
        <table className="summary-table">
          <thead>
            <tr>
              <th>{t.round}</th>
              <th>{mode === 'classic' ? t.number : t.pokemon}</th>
              {players.map((p) => (
                <th key={p.id} style={{ color: p.color }}>
                  {nameOf(p)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((guesses, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  {mode === 'classic' ? (
                    formatNumber(targets[i])
                  ) : (
                    <>
                      {formatName(targetName(targets[i]))} <small>{formatNumber(targets[i])}</small>
                    </>
                  )}
                </td>
                {players.map((p) => {
                  const g = guesses.find((x) => x.playerId === p.id)
                  return (
                    <td key={p.id}>
                      {g ? (
                        <>
                          {g.points}
                          <small className="cell-guess">
                            {mode === 'classic'
                              ? formatName(g.guess.name)
                              : formatNumber(g.guess.id)}
                          </small>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
      <SummaryActions {...actions} />
    </motion.section>
  )
}
