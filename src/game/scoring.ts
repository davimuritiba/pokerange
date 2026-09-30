export const MAX_POINTS = 1000
export const ROUNDS_PER_GAME = 5

/**
 * Pontuação por rodada: decai exponencialmente com a distância.
 * O decaimento escala com a raiz do tamanho do intervalo jogado: filtros
 * menores (ex.: só Gen 1) exigem mais precisão, sem ficarem punitivos demais.
 * Pokédex completa (1025): 0 → 1000 · 5 → 920 · 20 → 717 · 50 → 435 · 100 → 189
 * Gen 1 (151):             0 → 1000 · 5 → 805 · 10 → 648 · 20 → 420 · 50 → 114
 */
const FULL_DEX_SIZE = 1025
const FULL_DEX_DECAY = 60

export function scoreForDistance(distance: number, rangeSize: number): number {
  const decay = FULL_DEX_DECAY * Math.sqrt(rangeSize / FULL_DEX_SIZE)
  return Math.round(MAX_POINTS * Math.exp(-distance / decay))
}

/** Baseado nos pontos, para valer igual em qualquer tamanho de intervalo. */
export function verdictFor(distance: number, points: number): string {
  if (distance === 0) return 'Na mosca!'
  if (points >= 800) return 'Quase perfeito!'
  if (points >= 500) return 'Muito perto!'
  if (points >= 200) return 'Nada mal!'
  if (points >= 50) return 'Passou longe...'
  return 'Muito longe!'
}
