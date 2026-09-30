import { useState } from 'react'
import { describeRange, inRange, type DexRange } from '../game/ranges'

interface Props {
  range: DexRange
  onSubmit: (number: number) => void
  disabled?: boolean
}

/** Campo para chutar o número da Pokédex (modo invertido). */
export function NumberGuess({ range, onSubmit, disabled }: Props) {
  const [value, setValue] = useState('')

  const number = value.trim() === '' ? NaN : Number(value)
  const valid = Number.isInteger(number) && inRange(number, range)
  const showError = value.trim() !== '' && !valid

  return (
    <form
      className="search"
      onSubmit={(e) => {
        e.preventDefault()
        if (valid && !disabled) onSubmit(number)
      }}
    >
      <div className="search-field">
        <input
          type="number"
          inputMode="numeric"
          value={value}
          placeholder="Digite o número da Pokédex..."
          autoFocus
          aria-label="Número da Pokédex"
          aria-invalid={showError}
          onChange={(e) => setValue(e.target.value)}
        />
        {showError && (
          <p className="hint search-hint">Chute um número dentro de {describeRange(range)}.</p>
        )}
      </div>
      <button type="submit" className="btn btn-primary" disabled={!valid || disabled}>
        Chutar
      </button>
    </form>
  )
}
