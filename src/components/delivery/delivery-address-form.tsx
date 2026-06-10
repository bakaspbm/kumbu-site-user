"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/auth/require-auth";
import { useAuth } from "@/contexts/auth-context";
import { AngolaProvinceMunicipalityFields } from "@/components/geo/angola-province-municipality-fields";
import { updateStoreUser } from "@/lib/site-data";
import type { DeliveryAddress } from "@/types/store";

const empty: DeliveryAddress = {
  line1: "",
  line2: "",
  city: "",
  zip: "",
  country: "Angola",
};

export function DeliveryAddressForm() {
  const { storeUser, refresh } = useAuth();
  const router = useRouter();
  const t = useTranslations("account");
  const [form, setForm] = useState<DeliveryAddress>(empty);
  const [region, setRegion] = useState("Luanda");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!storeUser) return;
    setRegion(storeUser.region ?? "Luanda");
    if (storeUser.deliveryAddress) {
      setForm({
        line1: storeUser.deliveryAddress.line1,
        line2: storeUser.deliveryAddress.line2 ?? "",
        city: storeUser.deliveryAddress.city,
        zip: storeUser.deliveryAddress.zip ?? "",
        country: storeUser.deliveryAddress.country || "Angola",
      });
    } else if (storeUser.city) {
      setForm((prev) => ({ ...prev, city: storeUser.city ?? prev.city }));
    }
  }, [storeUser]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (!form.line1.trim() || !form.city.trim() || !form.country.trim() || !region.trim()) {
      setError(t("deliveryFillRequired"));
      return;
    }

    setSaving(true);
    try {
      await updateStoreUser(
        {
          city: form.city.trim(),
          region: region.trim(),
          country: form.country.trim(),
          deliveryAddress: {
            line1: form.line1.trim(),
            line2: form.line2?.trim() || null,
            city: form.city.trim(),
            zip: form.zip?.trim() || null,
            country: form.country.trim(),
          },
        },
      );
      await refresh();
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("deliverySaveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequireAuth>
      <form onSubmit={handleSubmit} className="kumbu-card mt-4 space-y-4 p-5">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          {t("deliveryLine1")}
          <input
            required
            value={form.line1}
            onChange={(e) => setForm({ ...form, line1: e.target.value })}
            className="kumbu-input font-normal"
            autoComplete="address-line1"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          {t("deliveryLine2")}
          <input
            value={form.line2 ?? ""}
            onChange={(e) => setForm({ ...form, line2: e.target.value })}
            className="kumbu-input font-normal"
            autoComplete="address-line2"
          />
        </label>
        <AngolaProvinceMunicipalityFields
          province={region}
          municipality={form.city}
          onProvinceChange={setRegion}
          onMunicipalityChange={(city) => setForm({ ...form, city })}
          municipalityLabel={t("municipality")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {t("deliveryPostalCode")}
            <input
              value={form.zip ?? ""}
              onChange={(e) => setForm({ ...form, zip: e.target.value })}
              className="kumbu-input font-normal"
              autoComplete="postal-code"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {t("country")}
            <input
              required
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="kumbu-input font-normal"
              autoComplete="country-name"
            />
          </label>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}
        {saved && (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            {t("deliverySaved")}
          </p>
        )}

        <Button type="submit" fullWidth disabled={saving} className="h-12">
          {saving ? t("saving") : t("deliverySave")}
        </Button>
      </form>
    </RequireAuth>
  );
}
