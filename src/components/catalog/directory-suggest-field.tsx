"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  createDirectoryBrandManual,
  createDirectoryItemManual,
  suggestDirectory,
  type DirectorySuggestItem,
  type DirectorySuggestType,
} from "@/lib/kumbu-api/directory";

type Props = {
  type: DirectorySuggestType;
  categoryId: string;
  subcategoryId?: string;
  brand?: string;
  value: string;
  onChange: (value: string) => void;
  onSelectItem?: (item: DirectorySuggestItem) => void;
  placeholder?: string;
  required?: boolean;
};

export function DirectorySuggestField({
  type,
  categoryId,
  subcategoryId,
  brand,
  value,
  onChange,
  onSelectItem,
  placeholder,
  required,
}: Props) {
  const t = useTranslations("catalogFields.directory");
  const locale = useLocale();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<DirectorySuggestItem[]>([]);
  const [canCreate, setCanCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const skipNextFetch = useRef(false);

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    const q = value.trim();
    if (!open) return;

    let cancelled = false;
    const handle = window.setTimeout(() => {
      setLoading(true);
      void suggestDirectory({
        type,
        q,
        categoryId,
        brand,
        lang: locale.startsWith("fr") ? "fr" : locale.startsWith("en") ? "en" : "pt",
      })
        .then((res) => {
          if (cancelled) return;
          setItems(res.items);
          setCanCreate(res.canCreateManual);
        })
        .catch(() => {
          if (cancelled) return;
          setItems([]);
          setCanCreate(q.length >= 2);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [value, type, categoryId, brand, locale, open]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(item: DirectorySuggestItem) {
    skipNextFetch.current = true;
    onChange(item.name);
    onSelectItem?.(item);
    setOpen(false);
    setItems([]);
  }

  async function addManual() {
    const name = value.trim();
    if (name.length < 2 || saving) return;
    setSaving(true);
    try {
      const created =
        type === "brand"
          ? await createDirectoryBrandManual({ name, categoryId })
          : await createDirectoryItemManual({
              name,
              brand: brand || undefined,
              categoryId,
              subcategoryId,
            });
      skipNextFetch.current = true;
      onChange(created.name || name);
      onSelectItem?.(created);
      setOpen(false);
    } catch {
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  const showManual = canCreate && value.trim().length >= 2;

  return (
    <div ref={rootRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="kumbu-input font-normal"
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
      />
      {open ? (
        <div
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-kumbu-border bg-kumbu-surface py-1 shadow-lg"
        >
          {loading && items.length === 0 ? (
            <p className="px-3 py-2 text-xs font-normal text-kumbu-muted">{t("loading")}</p>
          ) : null}
          {items.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              role="option"
              className="flex w-full flex-col items-start px-3 py-2 text-left text-sm font-normal hover:bg-kumbu-secondary"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(item)}
            >
              <span>{item.name}</span>
              {item.brandName && type !== "brand" ? (
                <span className="text-xs text-kumbu-muted">{item.brandName}</span>
              ) : null}
            </button>
          ))}
          {!loading && items.length === 0 && !showManual ? (
            <p className="px-3 py-2 text-xs font-normal text-kumbu-muted">{t("empty")}</p>
          ) : null}
          {showManual ? (
            <button
              type="button"
              className="w-full border-t border-kumbu-border px-3 py-2 text-left text-sm font-semibold text-kumbu-foreground hover:bg-kumbu-secondary"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => void addManual()}
              disabled={saving}
            >
              {t("notFound")}
              <span className="mt-0.5 block text-xs font-normal text-kumbu-muted">
                {saving ? t("saving") : t("addManual")}
              </span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function applyDirectorySpecs(
  attributes: Record<string, string>,
  item: DirectorySuggestItem,
): Record<string, string> {
  const next = { ...attributes };
  if (item.brandName && !next.brand?.trim()) {
    next.brand = item.brandName;
  }
  for (const spec of item.specs ?? []) {
    const key = specKeyToField(spec.attributeKey);
    if (!key) continue;
    if (next[key]?.trim()) continue;
    next[key] = specValueForField(key, spec.value, spec.unit);
  }
  return next;
}

function specKeyToField(attributeKey: string): string | null {
  switch (attributeKey) {
    case "processor":
      return "processor";
    case "ram":
      return "ram";
    case "internal_storage":
    case "storage":
      return "storage";
    case "display_size":
    case "screen":
      return "screen";
    case "year":
      return "year";
    case "mileage":
      return "mileage";
    case "fuel":
      return "fuel";
    case "engine":
      return "engine";
    default:
      return null;
  }
}

function specValueForField(fieldKey: string, value: string, unit?: string | null): string {
  if (fieldKey === "storage" || fieldKey === "ram") {
    const num = value.match(/\d+/);
    if (num) return num[0];
  }
  if (unit && !value.includes(unit)) return `${value} ${unit}`.trim();
  return value;
}
