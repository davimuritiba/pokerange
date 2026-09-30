import type { GameMode } from '../game/modes'
import { GENERATIONS, type CustomRangeIssue, type RangeLabel } from '../game/ranges'
import type { Verdict } from '../game/scoring'

export type Lang = 'pt' | 'en'

export const LANGS: { id: Lang; label: string; name: string }[] = [
  { id: 'en', label: 'EN', name: 'English' },
  { id: 'pt', label: 'PT', name: 'Português' },
]

const pt = {
  locale: 'pt-BR',

  // Geral
  tagline: 'Quão bem você conhece a Pokédex?',
  loadingPokedex: 'Carregando Pokédex…',
  loading: 'Carregando…',
  play: 'Jogar',
  dataFrom: 'Dados de',
  languageLabel: 'Idioma',
  errors: {
    pokedex: 'Não foi possível carregar a Pokédex. Verifique sua conexão.',
    round: 'Não foi possível carregar o Pokémon da rodada.',
  },

  // Modos
  modes: { classic: 'Clássico', inverted: 'Invertido' } satisfies Record<GameMode, string>,
  modeDescriptions: {
    classic: 'Um número aparece na tela. Chute o Pokémon com o número mais próximo possível.',
    inverted: 'Um Pokémon aparece na tela. Chute o número dele na Pokédex.',
  } satisfies Record<GameMode, string>,
  modeEyebrow: (mode: string) => `Modo ${mode.toLowerCase()}`,

  // Filtros
  choosePokemon: 'Escolha os Pokémon da partida',
  filterAria: 'Filtro de Pokémon',
  filterAll: 'Todas',
  filterGenerations: 'Geração',
  filterCustom: 'Personalizado',
  generation: (n: number) => `Gen ${n}`,
  selectAll: 'Marcar todas',
  clear: 'Limpar',
  pickOneGeneration: 'Escolha pelo menos uma geração.',
  from: 'De',
  to: 'Até',
  rangeStart: 'Início do intervalo',
  rangeEnd: 'Fim do intervalo',
  start: 'Começar',
  rangeLabel: (label: RangeLabel): string => {
    if (label.kind === 'all') return 'Todas'
    if (label.kind === 'custom') return 'Personalizado'
    if (label.numbers.length === 0) return '?'
    if (label.numbers.length === GENERATIONS.length) return 'Todas as gerações'
    return `Gen ${label.numbers.join(', ')}`
  },
  customRangeIssue: (issue: CustomRangeIssue): string => {
    switch (issue.code) {
      case 'empty':
        return 'Preencha os dois números.'
      case 'bounds':
        return `Use números entre 1 e ${issue.max}.`
      case 'order':
        return 'O início precisa ser menor que o fim.'
      case 'size':
        return `O intervalo precisa ter pelo menos ${issue.min} Pokémon.`
    }
  },

  // Jogadores
  playersTitle: 'Jogadores',
  playTypeAria: 'Tipo de partida',
  local: 'Local',
  localDetail: 'Todos no mesmo aparelho',
  online: 'Online',
  onlineDetail: 'Em breve · criar salas',
  playerCountAria: 'Quantidade de jogadores',
  fewerPlayers: 'Menos jogadores',
  morePlayers: 'Mais jogadores',
  playerCount: (n: number) => `${n} ${n === 1 ? 'jogador' : 'jogadores'}`,
  playersHint:
    'Cada jogador dá seu palpite na sua vez. As respostas só aparecem quando todos tiverem chutado.',
  defaultPlayer: (index: number) => `Jogador ${index + 1}`,
  playerNameAria: (index: number) => `Nome do jogador ${index + 1}`,

  // Rodada
  round: 'Rodada',
  of: 'de',
  points: 'Pontos',
  alreadyGuessed: 'já chutou',
  findClosest: 'Encontre o Pokémon mais próximo de',
  whichNumber: 'Qual é o número deste Pokémon?',
  turnOf: 'Vez de',
  searchPlaceholder: 'Digite o nome de um Pokémon...',
  searchAria: 'Nome do Pokémon',
  numberPlaceholder: 'Digite o número da Pokédex...',
  numberAria: 'Número da Pokédex',
  numberOutOfRange: (ranges: string) => `Chute um número dentro de ${ranges}.`,
  guess: 'Chutar',

  // Resultado
  verdicts: {
    perfect: 'Na mosca!',
    almost: 'Quase perfeito!',
    close: 'Muito perto!',
    notBad: 'Nada mal!',
    far: 'Passou longe...',
    veryFar: 'Muito longe!',
  } satisfies Record<Verdict, string>,
  exactHit: 'Você acertou o número exato',
  exact: 'exato!',
  distanceAway: (d: number) => `${d} de distância`,
  invertedRecap: (name: string, number: string, guess: string) =>
    `${name} é o ${number} · você chutou ${guess}`,
  guessedNumber: (number: string) => `Chutou ${number}`,
  yourGuess: 'Seu chute',
  answer: 'Resposta',
  nextRound: 'Próxima rodada',
  seeResults: 'Ver resultado',

  // Fim de jogo
  gameOver: 'Fim de jogo',
  number: 'Número',
  pokemon: 'Pokémon',
  distance: 'Distância',
  winner: (name: string) => `${name} venceu!`,
  tie: (names: string[]) => `Empate entre ${names.join(' e ')}!`,
  ordinal: (n: number) => `${n}º`,
  playAgain: 'Jogar novamente',
  changeFilter: 'Trocar filtro',
  mainMenu: 'Menu inicial',
}

export type Messages = typeof pt

const en: Messages = {
  locale: 'en-US',

  tagline: 'How well do you know the Pokédex?',
  loadingPokedex: 'Loading Pokédex…',
  loading: 'Loading…',
  play: 'Play',
  dataFrom: 'Data from',
  languageLabel: 'Language',
  errors: {
    pokedex: "Couldn't load the Pokédex. Check your connection.",
    round: "Couldn't load this round's Pokémon.",
  },

  modes: { classic: 'Classic', inverted: 'Inverted' },
  modeDescriptions: {
    classic: 'A number shows up on screen. Guess the Pokémon whose number is closest to it.',
    inverted: 'A Pokémon shows up on screen. Guess its Pokédex number.',
  },
  modeEyebrow: (mode: string) => `${mode} mode`,

  choosePokemon: 'Choose the Pokémon for this game',
  filterAria: 'Pokémon filter',
  filterAll: 'All',
  filterGenerations: 'Generation',
  filterCustom: 'Custom',
  generation: (n: number) => `Gen ${n}`,
  selectAll: 'Select all',
  clear: 'Clear',
  pickOneGeneration: 'Pick at least one generation.',
  from: 'From',
  to: 'To',
  rangeStart: 'Range start',
  rangeEnd: 'Range end',
  start: 'Start',
  rangeLabel: (label: RangeLabel): string => {
    if (label.kind === 'all') return 'All'
    if (label.kind === 'custom') return 'Custom'
    if (label.numbers.length === 0) return '?'
    if (label.numbers.length === GENERATIONS.length) return 'All generations'
    return `Gen ${label.numbers.join(', ')}`
  },
  customRangeIssue: (issue: CustomRangeIssue): string => {
    switch (issue.code) {
      case 'empty':
        return 'Fill in both numbers.'
      case 'bounds':
        return `Use numbers between 1 and ${issue.max}.`
      case 'order':
        return 'The start must be lower than the end.'
      case 'size':
        return `The range needs at least ${issue.min} Pokémon.`
    }
  },

  playersTitle: 'Players',
  playTypeAria: 'Game type',
  local: 'Local',
  localDetail: 'Everyone on the same device',
  online: 'Online',
  onlineDetail: 'Coming soon · create rooms',
  playerCountAria: 'Number of players',
  fewerPlayers: 'Fewer players',
  morePlayers: 'More players',
  playerCount: (n: number) => `${n} ${n === 1 ? 'player' : 'players'}`,
  playersHint:
    'Each player guesses on their turn. The answers only show up once everyone has guessed.',
  defaultPlayer: (index: number) => `Player ${index + 1}`,
  playerNameAria: (index: number) => `Player ${index + 1} name`,

  round: 'Round',
  of: 'of',
  points: 'Points',
  alreadyGuessed: 'already guessed',
  findClosest: 'Find the Pokémon closest to',
  whichNumber: "What is this Pokémon's number?",
  turnOf: 'Now guessing:',
  searchPlaceholder: "Type a Pokémon's name...",
  searchAria: 'Pokémon name',
  numberPlaceholder: 'Type the Pokédex number...',
  numberAria: 'Pokédex number',
  numberOutOfRange: (ranges: string) => `Guess a number within ${ranges}.`,
  guess: 'Guess',

  verdicts: {
    perfect: 'Bullseye!',
    almost: 'Almost perfect!',
    close: 'Very close!',
    notBad: 'Not bad!',
    far: 'Way off...',
    veryFar: 'Very far!',
  },
  exactHit: 'You hit the exact number',
  exact: 'exact!',
  distanceAway: (d: number) => `${d} away`,
  invertedRecap: (name: string, number: string, guess: string) =>
    `${name} is ${number} · you guessed ${guess}`,
  guessedNumber: (number: string) => `Guessed ${number}`,
  yourGuess: 'Your guess',
  answer: 'Answer',
  nextRound: 'Next round',
  seeResults: 'See results',

  gameOver: 'Game over',
  number: 'Number',
  pokemon: 'Pokémon',
  distance: 'Distance',
  winner: (name: string) => `${name} wins!`,
  tie: (names: string[]) => `Tie between ${names.join(' and ')}!`,
  ordinal: (n: number) => {
    const suffix =
      n % 100 >= 11 && n % 100 <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th')
    return `${n}${suffix}`
  },
  playAgain: 'Play again',
  changeFilter: 'Change filter',
  mainMenu: 'Main menu',
}

export const MESSAGES: Record<Lang, Messages> = { pt, en }
