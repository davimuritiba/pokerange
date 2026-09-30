import { motion } from 'motion/react'
import { formatName, formatNumber, type Pokemon } from '../api/pokeapi'
import { bouncy, spring } from '../lib/motion'

interface Props {
  label: string
  pokemon: Pokemon | null
  highlight?: boolean
  /** Lado de onde o card entra. */
  from?: 'left' | 'right'
  delay?: number
}

export function PokemonCard({ label, pokemon, highlight, from = 'left', delay = 0 }: Props) {
  return (
    <motion.figure
      className={`poke-card${highlight ? ' poke-card--target' : ''}`}
      initial={{ opacity: 0, x: from === 'left' ? -30 : 30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ ...spring, delay }}
    >
      <span className="poke-card-label">{label}</span>
      <div className="poke-card-art">
        {pokemon?.image ? (
          <motion.img
            key={pokemon.id}
            src={pokemon.image}
            alt={formatName(pokemon.name)}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...bouncy, delay: delay + 0.1 }}
          />
        ) : (
          <div className="poke-card-placeholder">{pokemon ? '?' : '…'}</div>
        )}
      </div>
      <figcaption>
        <span className="poke-card-number">{pokemon ? formatNumber(pokemon.id) : '—'}</span>
        <span className="poke-card-name">{pokemon ? formatName(pokemon.name) : 'Carregando'}</span>
      </figcaption>
    </motion.figure>
  )
}
