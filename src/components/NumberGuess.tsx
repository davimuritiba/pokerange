import { useState } from 'react'
import { describeRange, inRange, type DexRange } from '../game/ranges'
import { useI18n } from '../i18n/context'

interface Props {
  range: DexRange
  onSubmit: (number: number) => void
  disabled?: boolean
}

/** Campo para chutar o número da Pokédex (modo invertido). */
export function NumberGuess({ range, onSubmit, disabled }: Props) {
  const { t } = useI18n()
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
          placeholder={t.numberPlaceholder}
          autoFocus
          aria-label={t.numberAria}
          aria-invalid={showError}
          onChange={(e) => setValue(e.target.value)}
        />
        {showError && (
          <p className="hint search-hint">{t.numberOutOfRange(describeRange(range))}</p>
        )}
      </div>
      <button type="submit" className="btn btn-primary" disabled={!valid || disabled}>
        {t.guess}
      </button>
    </form>
  )
}
