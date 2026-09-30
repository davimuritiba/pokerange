export interface Player {
  id: number
  /** Nome digitado; vazio = nome padrão ("Jogador 2"), montado no idioma atual. */
  name: string
  color: string
}

export type PlayMode = 'local' | 'online'

export const MIN_PLAYERS = 1
export const MAX_PLAYERS = 6

/** Uma cor por jogador, para diferenciar placares e palpites. */
export const PLAYER_COLORS = ['#facc15', '#38bdf8', '#f472b6', '#34d399', '#fb923c', '#a78bfa']

/** Monta os jogadores a partir dos nomes digitados. */
export function buildPlayers(names: string[]): Player[] {
  return names.map((name, i) => ({
    id: i,
    name: name.trim(),
    color: PLAYER_COLORS[i % PLAYER_COLORS.length],
  }))
}
