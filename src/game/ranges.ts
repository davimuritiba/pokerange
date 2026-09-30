import { formatNumber } from '../api/pokeapi'
import { ROUNDS_PER_GAME } from './scoring'

/** Trecho contínuo da Pokédex (inclusivo). */
export interface DexSegment {
  start: number
  end: number
}

/**
 * Pokémon permitidos na partida (de onde saem os números e os chutes).
 * Pode ter vários trechos, ex.: Gen 1 + Gen 3.
 */
export interface DexRange {
  segments: DexSegment[]
  label: RangeLabel
}

/** O que foi escolhido, para o texto ser montado no idioma atual. */
export type RangeLabel =
  { kind: 'all' } | { kind: 'custom' } | { kind: 'generations'; numbers: number[] }

/** Problema no intervalo personalizado (o texto vem da tradução). */
export type CustomRangeIssue =
  | { code: 'empty' }
  | { code: 'bounds'; max: number }
  | { code: 'order' }
  | { code: 'size'; min: number }

export interface Generation extends DexSegment {
  number: number
}

export const GENERATIONS: Generation[] = [
  { number: 1, start: 1, end: 151 },
  { number: 2, start: 152, end: 251 },
  { number: 3, start: 252, end: 386 },
  { number: 4, start: 387, end: 493 },
  { number: 5, start: 494, end: 649 },
  { number: 6, start: 650, end: 721 },
  { number: 7, start: 722, end: 809 },
  { number: 8, start: 810, end: 905 },
  { number: 9, start: 906, end: 1025 },
]

/** O intervalo precisa ter pelo menos um número distinto por rodada. */
export const MIN_RANGE_SIZE = ROUNDS_PER_GAME

export function allRange(dexSize: number): DexRange {
  return { segments: [{ start: 1, end: dexSize }], label: { kind: 'all' } }
}

export function customRange(start: number, end: number): DexRange {
  return { segments: [{ start, end }], label: { kind: 'custom' } }
}

/** Junta as gerações escolhidas; gerações vizinhas viram um trecho só. */
export function generationsRange(numbers: number[], dexSize: number): DexRange {
  const sorted = [...numbers].sort((a, b) => a - b)
  const segments: DexSegment[] = []
  for (const n of sorted) {
    const gen = GENERATIONS.find((g) => g.number === n)
    if (!gen || gen.start > dexSize) continue
    const end = Math.min(gen.end, dexSize)
    const last = segments[segments.length - 1]
    if (last && last.end + 1 === gen.start) last.end = end
    else segments.push({ start: gen.start, end })
  }
  return { segments, label: { kind: 'generations', numbers: sorted } }
}

/** Retorna o problema do intervalo personalizado, ou `null` se for válido. */
export function customRangeIssue(
  start: number,
  end: number,
  dexSize: number,
): CustomRangeIssue | null {
  if (!Number.isInteger(start) || !Number.isInteger(end)) return { code: 'empty' }
  if (start < 1 || end > dexSize) return { code: 'bounds', max: dexSize }
  if (start > end) return { code: 'order' }
  if (end - start + 1 < MIN_RANGE_SIZE) return { code: 'size', min: MIN_RANGE_SIZE }
  return null
}

export function rangeSize(range: DexRange): number {
  return range.segments.reduce((sum, s) => sum + s.end - s.start + 1, 0)
}

export function inRange(id: number, range: DexRange): boolean {
  return range.segments.some((s) => id >= s.start && id <= s.end)
}

/** "#0001–#0151, #0252–#0386" */
export function describeRange(range: DexRange): string {
  return range.segments.map((s) => `${formatNumber(s.start)}–${formatNumber(s.end)}`).join(', ')
}

/** Sorteia `count` números distintos dentro do intervalo, todos com a mesma chance. */
export function drawTargets(range: DexRange, count: number): number[] {
  const size = rangeSize(range)
  const picked = new Set<number>()
  while (picked.size < Math.min(count, size)) {
    let offset = Math.floor(Math.random() * size)
    for (const s of range.segments) {
      const length = s.end - s.start + 1
      if (offset < length) {
        picked.add(s.start + offset)
        break
      }
      offset -= length
    }
  }
  return [...picked]
}
