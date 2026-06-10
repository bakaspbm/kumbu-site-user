import type { ApiError } from "@/lib/kumbu-api/client";

export type ApiValidationError = {
  message: string;
  code?: string;
  fields: Record<string, string>;
};

export function parseApiValidationError(err: unknown): ApiValidationError | null {
  if (!err || typeof err !== "object") return null;
  const apiErr = err as ApiError;
  const payload = apiErr.payload;
  if (!payload || typeof payload !== "object") return null;
  const row = payload as Record<string, unknown>;
  const fieldsRaw = row.fields;
  if (!fieldsRaw || typeof fieldsRaw !== "object") return null;
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(fieldsRaw as Record<string, unknown>)) {
    if (typeof value === "string" && value.trim()) fields[key] = value.trim();
  }
  if (Object.keys(fields).length === 0) return null;
  return {
    message: typeof row.message === "string" ? row.message : apiErr.message,
    code: typeof row.code === "string" ? row.code : undefined,
    fields,
  };
}

/** camelCase backend keys → snake_case form names where needed */
export function backendFieldToFormName(field: string): string {
  if (field.includes("_")) return field;
  return field.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

export function mapBackendFieldsToForm(
  fields: Record<string, string>,
): Record<string, string> {
  const mapped: Record<string, string> = {};
  for (const [key, message] of Object.entries(fields)) {
    mapped[backendFieldToFormName(key)] = message;
  }
  return mapped;
}

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string; fields?: Record<string, string> };

export function toActionResult(err: unknown): ActionResult {
  const validation = parseApiValidationError(err);
  if (validation) {
    return {
      ok: false,
      error: validation.message,
      fields: mapBackendFieldsToForm(validation.fields),
    };
  }
  if (err instanceof Error) {
    return { ok: false, error: err.message };
  }
  return { ok: false, error: "Ocorreu um erro. Tente novamente." };
}
