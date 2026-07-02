
export type PublishStep =
  | "P1_GRAVAR_ANUNCIO"
  | "P2A_URLS_ASSINADAS"
  | "P2B_UPLOAD_DIRECTO"
  | "P2C_UPLOAD_SERVIDOR"
  | "P3_LIGAR_FOTOS";

const STEP_LABELS: Record<PublishStep, string> = {
  P1_GRAVAR_ANUNCIO: "Passo 1 — Gravar anúncio na base",
  P2A_URLS_ASSINADAS: "Passo 2a — Pedir URLs assinadas (servidor)",
  P2B_UPLOAD_DIRECTO: "Passo 2b — Enviar fotos ao Storage (browser)",
  P2C_UPLOAD_SERVIDOR: "Passo 2c — Enviar fotos pelo servidor (fallback)",
  P3_LIGAR_FOTOS: "Passo 3 — Ligar URLs ao anúncio",
};

export function isPublishDebugEnabled(): boolean {
  if (typeof process === "undefined") return false;
  if (process.env.NODE_ENV !== "development") return false;
  if (process.env.PUBLISH_DEBUG === "0") return false;
  return true;
}

function nowClock(): string {
  return new Date().toISOString().slice(11, 23);
}

function safeData(data?: Record<string, unknown>): string {
  if (!data || Object.keys(data).length === 0) return "";
  try {
    return ` ${JSON.stringify(data)}`;
  } catch {
    return " [dados não serializáveis]";
  }
}

function errorText(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export function publishDebug(
  step: PublishStep,
  message: string,
  data?: Record<string, unknown>,
): void {
  if (!isPublishDebugEnabled()) return;
  console.log(
    `[Kumbu Publicar] ${nowClock()} ${step} | ${STEP_LABELS[step]} — ${message}${safeData(data)}`,
  );
}

export function publishDebugFail(
  step: PublishStep,
  message: string,
  err?: unknown,
  data?: Record<string, unknown>,
): void {
  if (!isPublishDebugEnabled()) return;
  console.warn(
    `[Kumbu Publicar] ${nowClock()} ${step} FALHOU | ${STEP_LABELS[step]} — ${message}${err != null ? ` | ${errorText(err)}` : ""}${safeData(data)}`,
  );
}

export function publishDebugTimer(step: PublishStep, startMessage: string) {
  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
  publishDebug(step, `início: ${startMessage}`);
  return {
    ok(detail?: Record<string, unknown>) {
      const ms = Math.round(
        (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0,
      );
      publishDebug(step, `concluído em ${ms}ms`, detail);
    },
    fail(message: string, err?: unknown, detail?: Record<string, unknown>) {
      const ms = Math.round(
        (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0,
      );
      publishDebugFail(step, message, err, { ...detail, ms });
    },
  };
}

export function summarizeFiles(files: File[]): Record<string, unknown> {
  return {
    count: files.length,
    totalBytes: files.reduce((n, f) => n + f.size, 0),
    names: files.map((f) => f.name),
    types: files.map((f) => f.type || "unknown"),
  };
}
