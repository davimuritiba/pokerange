import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect } from 'react'
import { useI18n } from '../i18n/context'

interface Props {
  value: number
  /** Duração da contagem em segundos. */
  duration?: number
  delay?: number
  prefix?: string
}

/** Número que "conta" até o valor, em vez de trocar de uma vez. */
export function AnimatedNumber({ value, duration = 0.8, delay = 0, prefix = '' }: Props) {
  const { t } = useI18n()
  const count = useMotionValue(0)
  const text = useTransform(count, (v) => prefix + Math.round(v).toLocaleString(t.locale))

  useEffect(() => {
    const controls = animate(count, value, { duration, delay, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [count, value, duration, delay])

  return <motion.span>{text}</motion.span>
}
