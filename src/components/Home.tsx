import { motion } from "motion/react";
import type { GameMode } from "../game/modes";
import { bouncy, fadeUp, spring, stagger } from "../lib/motion";

interface Props {
  onSelect: (mode: GameMode) => void;
  ready: boolean;
}

export function Home({ onSelect, ready }: Props) {
  return (
    <section className="home">
      <motion.h1
        className="hero-title"
        initial={{ opacity: 0, y: -40, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={bouncy}
      >
        PokeRange
      </motion.h1>
      <motion.p
        className="tagline"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        Quão bem você conhece a Pokédex?
      </motion.p>
      <motion.div
        className="modes"
        variants={stagger(0.1, 0.3)}
        initial="initial"
        animate="animate"
      >
        <motion.button
          className="mode-card"
          variants={fadeUp}
          whileHover={ready ? { y: -4, transition: spring } : undefined}
          whileTap={ready ? { scale: 0.97 } : undefined}
          onClick={() => onSelect("classic")}
          disabled={!ready}
        >
          <span className="mode-title">Clássico</span>
          <span className="mode-desc">
            Um número aparece na tela. Chute o Pokémon com o número mais próximo
            possível.
          </span>
          <span className="mode-cta">
            {ready ? "Jogar" : "Carregando Pokédex…"}
          </span>
        </motion.button>
        <motion.button
          className="mode-card"
          variants={fadeUp}
          whileHover={ready ? { y: -4, transition: spring } : undefined}
          whileTap={ready ? { scale: 0.97 } : undefined}
          onClick={() => onSelect("inverted")}
          disabled={!ready}
        >
          <span className="mode-title">Invertido</span>
          <span className="mode-desc">
            Um Pokémon aparece na tela. Chute o número dele na Pokédex.
          </span>
          <span className="mode-cta">
            {ready ? "Jogar" : "Carregando Pokédex…"}
          </span>
        </motion.button>
      </motion.div>
    </section>
  );
}
