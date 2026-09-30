import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useState } from "react";
import { fetchPokedex, type PokemonEntry } from "./api/pokeapi";
import { Game } from "./components/Game";
import { GameSetup } from "./components/GameSetup";
import { Home } from "./components/Home";
import { MODE_LABELS, type GameMode } from "./game/modes";
import { defaultPlayerName, type Player } from "./game/players";
import type { DexRange } from "./game/ranges";
import { page } from "./lib/motion";
import "./App.css";

function App() {
  const [mode, setMode] = useState<GameMode | null>(null);
  const [pokedex, setPokedex] = useState<PokemonEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<DexRange | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  // Nomes digitados na última configuração (reaproveitados ao trocar filtro).
  const [playerNames, setPlayerNames] = useState<string[]>([""]);

  function startGame(nextRange: DexRange, nextPlayers: Player[]) {
    setRange(nextRange);
    setPlayers(nextPlayers);
    // Nome padrão ("Jogador 2") volta a ser só a dica do campo.
    setPlayerNames(
      nextPlayers.map((p, i) =>
        p.name === defaultPlayerName(i) ? "" : p.name,
      ),
    );
  }

  function goHome() {
    setMode(null);
    setRange(null);
  }

  useEffect(() => {
    fetchPokedex()
      .then(setPokedex)
      .catch(() =>
        setError("Não foi possível carregar a Pokédex. Verifique sua conexão."),
      );
  }, []);

  // Cada tela tem uma chave própria para o AnimatePresence animar a troca.
  const screen = !mode ? "home" : !range ? `setup-${mode}` : `game-${mode}`;

  return (
    <MotionConfig reducedMotion="user">
      <div className="app">
        <AnimatePresence>
          {mode && (
            <motion.header
              className="topbar"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <button className="logo" onClick={goHome}>
                PokeRange
              </button>
              <span className="mode-badge">{MODE_LABELS[mode]}</span>
            </motion.header>
          )}
        </AnimatePresence>

        <main>
          {error && <p className="error">{error}</p>}
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              variants={page}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {!mode && <Home onSelect={setMode} ready={pokedex !== null} />}
              {mode && pokedex && !range && (
                <GameSetup
                  key={mode}
                  mode={mode}
                  dexSize={pokedex.length}
                  initialNames={playerNames}
                  onStart={startGame}
                />
              )}
              {mode && pokedex && range && (
                <Game
                  key={mode}
                  mode={mode}
                  pokedex={pokedex}
                  range={range}
                  players={players}
                  onChangeFilter={() => setRange(null)}
                  onExit={goHome}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="footer">
          Dados de{" "}
          <a href="https://pokeapi.co" target="_blank" rel="noreferrer">
            PokéAPI
          </a>
        </footer>
      </div>
    </MotionConfig>
  );
}

export default App;
