import { createContext, useContext } from 'react'
import { MESSAGES, type Lang, type Messages } from './messages'

export interface I18n {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Messages
}

export const I18nContext = createContext<I18n>({
  lang: 'en',
  setLang: () => {},
  t: MESSAGES.en,
})

/** Idioma atual e textos traduzidos: `const { t } = useI18n()`. */
export function useI18n(): I18n {
  return useContext(I18nContext)
}
