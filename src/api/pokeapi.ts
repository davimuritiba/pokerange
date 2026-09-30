const BASE_URL = "https://pokeapi.co/api/v2";
const SPECIES_CACHE_KEY = "pokerange:species:v1";

export interface PokemonEntry {
  id: number;
  name: string;
}

export interface Pokemon extends PokemonEntry {
  image: string | null;
}

interface NamedResource {
  name: string;
  url: string;
}

function idFromUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : NaN;
}

/** "mr-mime" -> "Mr Mime" */
export function formatName(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatNumber(id: number): string {
  return `#${String(id).padStart(4, "0")}`;
}

/** Lista completa da Pokédex nacional (nome + número), cacheada no navegador. */
export async function fetchPokedex(): Promise<PokemonEntry[]> {
  try {
    const cached = localStorage.getItem(SPECIES_CACHE_KEY);
    if (cached) return JSON.parse(cached) as PokemonEntry[];
  } catch {
    // cache indisponível: segue para a API
  }

  const res = await fetch(`${BASE_URL}/pokemon-species?limit=2000`);
  if (!res.ok) throw new Error(`PokeAPI respondeu ${res.status}`);
  const data: { results: NamedResource[] } = await res.json();

  const entries = data.results
    .map((r) => ({ id: idFromUrl(r.url), name: r.name }))
    .filter((e) => Number.isFinite(e.id))
    .sort((a, b) => a.id - b.id);

  try {
    localStorage.setItem(SPECIES_CACHE_KEY, JSON.stringify(entries));
  } catch {
    // ignora falha de escrita
  }
  return entries;
}

const pokemonCache = new Map<number, Promise<Pokemon>>();

/** Detalhes de um Pokémon pelo número da Pokédex: nome, número e imagem. */
export function fetchPokemon(id: number): Promise<Pokemon> {
  const cached = pokemonCache.get(id);
  if (cached) return cached;

  const request = fetch(`${BASE_URL}/pokemon/${id}`)
    .then((res) => {
      if (!res.ok) throw new Error(`PokeAPI respondeu ${res.status}`);
      return res.json();
    })
    .then((data) => ({
      id: data.id as number,
      name: data.species?.name ?? data.name,
      image:
        data.sprites?.other?.["official-artwork"]?.front_default ??
        data.sprites?.front_default ??
        null,
    }))
    .catch((err) => {
      pokemonCache.delete(id);
      throw err;
    });

  pokemonCache.set(id, request);
  return request;
}
