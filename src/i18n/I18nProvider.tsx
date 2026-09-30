import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { I18nContext } from './context'
import { MESSAGES, type Lang } from './messages'

const STORAGE_KEY = 'pokerange:lang'

const DEFAULT_LANG: Lang = 'en'

/** Idioma escolhido antes pelo jogador; senão, inglês. */
function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'pt' || saved === 'en') return saved
  } catch {
    // sem acesso ao armazenamento: usa o padrão
  }
  return DEFAULT_LANG
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = MESSAGES[lang].locale
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignora falha de escrita
    }
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t: MESSAGES[lang] }), [lang])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
