import { motion } from "motion/react";
import type { GameMode } from "../game/modes";
import { useI18n } from "../i18n/context";
import { bouncy, fadeUp, spring, stagger } from "../lib/motion";

interface Props {
  onSelect: (mode: GameMode) => void;
  ready: boolean;
}

export function Home({ onSelect, ready }: Props) {
  const { t } = useI18n();
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
        {t.tagline}
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
          <span className="mode-title">{t.modes.classic}</span>
          <span className="mode-desc">{t.modeDescriptions.classic}</span>
          <span className="mode-cta">{ready ? t.play : t.loadingPokedex}</span>
        </motion.button>
        <motion.button
          className="mode-card"
          variants={fadeUp}
          whileHover={ready ? { y: -4, transition: spring } : undefined}
          whileTap={ready ? { scale: 0.97 } : undefined}
          onClick={() => onSelect("inverted")}
          disabled={!ready}
        >
          <span className="mode-title">{t.modes.inverted}</span>
          <span className="mode-desc">{t.modeDescriptions.inverted}</span>
          <span className="mode-cta">{ready ? t.play : t.loadingPokedex}</span>
        </motion.button>
      </motion.div>
    </section>
  );
}
