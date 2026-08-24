"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getKumbuApiClient } from "@/lib/kumbu-api/client";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

export function SmartDatalistInput({
  categoryId,
  subcategoryId,
  fieldKey,
  value,
  onChange,
  placeholder,
  required,
  brand,
  model,
  initialSuggestions,
}: {
  categoryId: string;
  subcategoryId: string | null | undefined;
  fieldKey: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  required?: boolean;
  brand?: string;
  model?: string;
  initialSuggestions?: readonly string[];
}) {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(() => [...(initialSuggestions ?? [])]);
  const [loading, setLoading] = useState(false);

  const client = useMemo(() => getKumbuApiClient(), []);

  const datalistId = useMemo(() => {
    const safeKey = fieldKey.replace(/[^a-z0-9_-]/gi, "-");
    const safeCat = categoryId.replace(/[^a-z0-9_-]/gi, "-");
    const safeSub = (subcategoryId ?? "all").replace(/[^a-z0-9_-]/gi, "-");
    return `kumbu-suggest-${safeCat}-${safeSub}-${safeKey}`;
  }, [categoryId, subcategoryId, fieldKey]);

  const trimmedValue = value ?? "";
  const debouncedValue = useDebouncedValue(trimmedValue, 220);

  const cacheRef = useRef(new Map<string, string[]>());

  useEffect(() => {
    // keep immediate offline suggestions while user hasn't focused yet
    if (!focused && initialSuggestions?.length) {
      setSuggestions([...initialSuggestions]);
    }
  }, [focused, initialSuggestions]);

  useEffect(() => {
    if (!focused) return;
    if (!client) return;

    const category = categoryId?.trim();
    if (!category) return;

    const brandTrim = brand?.trim() || undefined;
    const modelTrim = model?.trim() || undefined;
    // When the user is selecting the same key (e.g. fieldKey="brand"), don't filter by it.
    const brandForQuery = fieldKey === "brand" ? undefined : brandTrim;
    const modelForQuery = fieldKey === "model" ? undefined : modelTrim;
    const q = debouncedValue.trim() ? debouncedValue.trim() : undefined;

    const cacheKey = JSON.stringify({
      categoryId: category,
      subcategoryId: subcategoryId ?? null,
      fieldKey,
      brand: brandForQuery ?? null,
      model: modelForQuery ?? null,
      q: q ?? null,
    });

    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setSuggestions(cached);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const values = await client.request<string[]>("/catalog/suggestions/values", {
          auth: false,
          query: {
            categoryId: categoryId,
            subcategoryId: subcategoryId ?? undefined,
            key: fieldKey,
            brand: brandForQuery,
            model: modelForQuery,
            q,
            limit: 20,
          },
        });
        if (cancelled) return;

        const next = (values ?? [])
          .map((s) => String(s ?? "").trim())
          .filter((s) => s.length > 0)
          .slice(0, 20);
        cacheRef.current.set(cacheKey, next);
        setSuggestions(next);
      } catch {
        // ignore errors; keep current suggestions
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [client, focused, categoryId, subcategoryId, fieldKey, debouncedValue, brand, model]);

  return (
    <div className="relative">
      <input
        type="text"
        value={trimmedValue}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="kumbu-input font-normal"
        placeholder={placeholder}
        required={required}
        list={suggestions.length > 0 ? datalistId : undefined}
        autoComplete="off"
      />
      {/* tiny hint while loading; avoids jumping layout */}
      {loading ? (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-kumbu-muted">
          …
        </span>
      ) : null}
      {suggestions.length > 0 ? (
        <datalist id={datalistId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      ) : null}
    </div>
  );
}

