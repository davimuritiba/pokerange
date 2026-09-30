import { motion } from 'motion/react'
import { useI18n } from '../i18n/context'
import { LANGS } from '../i18n/messages'
import { spring } from '../lib/motion'

/** Alternador PT / EN. */
export function LanguageSwitch() {
  const { lang, setLang, t } = useI18n()
  return (
    <div className="lang-switch" role="radiogroup" aria-label={t.languageLabel}>
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          role="radio"
          aria-checked={lang === l.id}
          title={l.name}
          className={lang === l.id ? 'active' : undefined}
          onClick={() => setLang(l.id)}
        >
          {lang === l.id && (
            <motion.span layoutId="lang-pill" className="lang-pill" transition={spring} />
          )}
          <span className="lang-text">{l.label}</span>
        </button>
      ))}
    </div>
  )
}
