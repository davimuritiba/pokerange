import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useState } from "react";
import { fetchPokedex, type PokemonEntry } from "./api/pokeapi";
import { Game } from "./components/Game";
import { GameSetup } from "./components/GameSetup";
import { Home } from "./components/Home";
import { LanguageSwitch } from "./components/LanguageSwitch";
import type { GameMode } from "./game/modes";
import type { Player } from "./game/players";
import type { DexRange } from "./game/ranges";
import { useI18n } from "./i18n/context";
import { page } from "./lib/motion";
import "./App.css";

function App() {
  const { t } = useI18n();
  const [mode, setMode] = useState<GameMode | null>(null);
  const [pokedex, setPokedex] = useState<PokemonEntry[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [range, setRange] = useState<DexRange | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  // Nomes digitados na última configuração (reaproveitados ao trocar filtro).
  const [playerNames, setPlayerNames] = useState<string[]>([""]);

  function startGame(nextRange: DexRange, nextPlayers: Player[]) {
    setRange(nextRange);
    setPlayers(nextPlayers);
    setPlayerNames(nextPlayers.map((p) => p.name));
  }

  function goHome() {
    setMode(null);
    setRange(null);
  }

  useEffect(() => {
    fetchPokedex()
      .then(setPokedex)
      .catch(() => setLoadFailed(true));
  }, []);

  // Cada tela tem uma chave própria para o AnimatePresence animar a troca.
  const screen = !mode ? "home" : !range ? `setup-${mode}` : `game-${mode}`;

  return (
    <MotionConfig reducedMotion="user">
      <div className="app">
        <header className="topbar">
          <AnimatePresence>
            {mode && (
              <motion.button
                key="logo"
                className="logo"
                onClick={goHome}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                PokeRange
              </motion.button>
            )}
          </AnimatePresence>
          <div className="topbar-right">
            <AnimatePresence>
              {mode && (
                <motion.span
                  key="badge"
                  className="mode-badge"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {t.modes[mode]}
                </motion.span>
              )}
            </AnimatePresence>
            <LanguageSwitch />
          </div>
        </header>

        <main>
          {loadFailed && <p className="error">{t.errors.pokedex}</p>}
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
          {t.dataFrom}{" "}
          <a href="https://pokeapi.co" target="_blank" rel="noreferrer">
            PokéAPI
          </a>
        </footer>
      </div>
    </MotionConfig>
  );
}

export default App;
