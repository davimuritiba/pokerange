import type { Transition, Variants } from 'motion/react'

/** Mola padrão: rápida e sem "quicar" demais. */
export const spring: Transition = { type: 'spring', stiffness: 380, damping: 30 }

/** Mola com um pouco de exagero, para elementos de destaque. */
export const bouncy: Transition = { type: 'spring', stiffness: 420, damping: 18 }

/** Troca de tela (home → filtros → jogo). */
export const page: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease: 'easeIn' } },
}

/** Pai que revela os filhos em sequência. */
export const stagger = (step = 0.07, delay = 0): Variants => ({
  initial: {},
  animate: { transition: { staggerChildren: step, delayChildren: delay } },
})

/** Filho de `stagger`: sobe e aparece. */
export const fadeUp: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: spring },
}

/** Painel que abre/fecha animando a altura. */
export const collapse: Variants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2, ease: 'easeIn' } },
}
