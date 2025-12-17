import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;

  /** базовая задержка */
  delayMs?: number;

  /** шаг между элементами (stagger) */
  staggerMs?: number;

  /** индекс элемента (0,1,2...) */
  index?: number;

  durationMs?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
};

export function Reveal({
  children,
  delayMs = 0,
  staggerMs = 80,
  index = 0,
  durationMs = 520,
  y = 12,
  className,
  style,
}: Props) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      setReduceMotion(true);
      setShown(true);
      return;
    }

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    if (mq.matches) setShown(true);

    const onChange = () => {
      setReduceMotion(mq.matches);
      if (mq.matches) setShown(true);
    };

    // Safari compatibility
    // @ts-ignore
    mq.addEventListener
      ? mq.addEventListener("change", onChange)
      : mq.addListener(onChange);

    return () => {
      // @ts-ignore
      mq.removeEventListener
        ? mq.removeEventListener("change", onChange)
        : mq.removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    setShown(false);
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [reduceMotion]);

  const totalDelay = delayMs + index * staggerMs;

  const animStyle: CSSProperties = reduceMotion
    ? {}
    : {
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0px)" : `translateY(${y}px)`,

        transitionProperty: "opacity, transform",
        transitionDuration: `${durationMs}ms, ${durationMs + 180}ms`,
        transitionTimingFunction:
          "cubic-bezier(0.16, 1, 0.3, 1), cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: `${totalDelay}ms, ${totalDelay + 90}ms`,

        willChange: "opacity, transform",
      };

  return (
    <div className={className} style={{ ...animStyle, ...style }}>
      {children}
    </div>
  );
}
