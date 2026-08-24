"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getKumbuApiClient } from "@/lib/kumbu-api/client";

function uniqueValues(...lists: Array<readonly string[] | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of lists) {
    for (const raw of list ?? []) {
      const value = String(raw ?? "").trim();
      if (!value) continue;
      const key = value.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(value);
    }
  }
  return out;
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
  const [remoteSuggestions, setRemoteSuggestions] = useState<string[]>([]);
  const cacheRef = useRef(new Map<string, string[]>());
  const client = useMemo(() => getKumbuApiClient(), []);

  const brandForQuery = fieldKey === "brand" ? undefined : brand?.trim() || undefined;
  const modelForQuery = fieldKey === "model" ? undefined : model?.trim() || undefined;

  const cacheKey = JSON.stringify({
    categoryId: categoryId.trim(),
    subcategoryId: subcategoryId ?? null,
    fieldKey,
    brand: brandForQuery ?? null,
    model: modelForQuery ?? null,
  });

  const datalistId = useMemo(() => {
    const safeKey = fieldKey.replace(/[^a-z0-9_-]/gi, "-");
    const safeCat = categoryId.replace(/[^a-z0-9_-]/gi, "-");
    const safeSub = (subcategoryId ?? "all").replace(/[^a-z0-9_-]/gi, "-");
    return `kumbu-suggest-${safeCat}-${safeSub}-${safeKey}`;
  }, [categoryId, subcategoryId, fieldKey]);

  useEffect(() => {
    const category = categoryId.trim();
    if (!category || !client) return;

    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setRemoteSuggestions(cached);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const values = await client.request<string[]>("/catalog/suggestions/values", {
          auth: false,
          query: {
            categoryId: category,
            subcategoryId: subcategoryId || undefined,
            key: fieldKey,
            brand: brandForQuery,
            model: modelForQuery,
            limit: 50,
          },
        });
        if (cancelled) return;
        const next = uniqueValues(values);
        cacheRef.current.set(cacheKey, next);
        setRemoteSuggestions(next);
      } catch {
        if (!cancelled) setRemoteSuggestions([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [client, cacheKey, categoryId, subcategoryId, fieldKey, brandForQuery, modelForQuery]);

  const suggestions = useMemo(
    () => uniqueValues(initialSuggestions, remoteSuggestions),
    [initialSuggestions, remoteSuggestions],
  );

  return (
    <>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="kumbu-input font-normal"
        placeholder={placeholder}
        required={required}
        list={suggestions.length > 0 ? datalistId : undefined}
        autoComplete="off"
      />
      {suggestions.length > 0 ? (
        <datalist id={datalistId}>
          {suggestions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
      ) : null}
    </>
  );
}
