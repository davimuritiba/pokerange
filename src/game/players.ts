export interface Player {
  id: number
  name: string
  color: string
}

export type PlayMode = 'local' | 'online'

export const MIN_PLAYERS = 1
export const MAX_PLAYERS = 6

/** Uma cor por jogador, para diferenciar placares e palpites. */
export const PLAYER_COLORS = ['#facc15', '#38bdf8', '#f472b6', '#34d399', '#fb923c', '#a78bfa']

export function defaultPlayerName(index: number): string {
  return `Jogador ${index + 1}`
}

/** Monta os jogadores a partir dos nomes digitados (nome vazio vira o padrão). */
export function buildPlayers(names: string[]): Player[] {
  return names.map((name, i) => ({
    id: i,
    name: name.trim() || defaultPlayerName(i),
    color: PLAYER_COLORS[i % PLAYER_COLORS.length],
  }))
}
