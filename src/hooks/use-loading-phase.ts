"use client";

import { useEffect, useState } from "react";

export type LoadingPhase = "hidden" | "spinner" | "text" | "rotating" | "progress";

type Options = {
  /** Não mostrar nada antes disto (evita flash <1s). */
  delayMs?: number;
  /** A partir daqui: texto estático junto ao spinner. */
  textAfterMs?: number;
  /** A partir daqui: barra de progresso (em vez de spinner infinito). */
  progressAfterMs?: number;
  /** Intervalo para rodar mensagens secundárias. */
  rotateIntervalMs?: number;
};

const DEFAULTS: Required<Options> = {
  delayMs: 1000,
  textAfterMs: 5000,
  progressAfterMs: 10000,
  rotateIntervalMs: 2800,
};

export function useLoadingPhase(active: boolean, options?: Options) {
  const cfg = { ...DEFAULTS, ...options };
  const [elapsed, setElapsed] = useState(0);
  const [rotateIndex, setRotateIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setElapsed(0);
      setRotateIndex(0);
      return;
    }
    const start = Date.now();
    const id = window.setInterval(() => setElapsed(Date.now() - start), 200);
    return () => window.clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (!active || elapsed < cfg.textAfterMs) return;
    const id = window.setInterval(() => setRotateIndex((i) => i + 1), cfg.rotateIntervalMs);
    return () => window.clearInterval(id);
  }, [active, elapsed, cfg.textAfterMs, cfg.rotateIntervalMs]);

  let phase: LoadingPhase = "hidden";
  if (active && elapsed >= cfg.delayMs) {
    if (elapsed >= cfg.progressAfterMs) phase = "progress";
    else if (elapsed >= cfg.textAfterMs) phase = "rotating";
    else phase = "spinner";
  }

  return { phase, elapsed, rotateIndex, visible: phase !== "hidden" };
}
