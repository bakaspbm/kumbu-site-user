"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ProfileIncompleteBlock } from "@/components/account/profile-incomplete-block";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/auth/require-auth";
import { useAuth } from "@/contexts/auth-context";
import { formatAngolaLocation } from "@/lib/geo/angola-locations";
import { newProductId } from "@/lib/ids";
import {
  buildJobMeta,
  defaultJobPublishState,
  jobPriceLabelFromMeta,
  JobPublishSection,
  validateJobPublish,
  type JobPublishState,
} from "@/components/jobs/job-publish-section";
import { isJobCategory } from "@/lib/jobs/category";
import { isPropertyCategory } from "@/lib/property/category";
import {
  buildPropertyMetaFromState,
  defaultPropertyPublishState,
  formatPriceLabelFromState,
  PropertyPublishSection,
  validatePropertyPublishState,
  type PropertyPublishState,
} from "@/components/property/property-publish-section";
import {
  GeneralProductPublishSection,
  validateGeneralProductPublish,
} from "@/components/catalog/general-product-publish-section";
import { DEMO_SUBCATEGORIES } from "@/lib/catalog/demo-subcategories";
import { publishFallbackCategories } from "@/lib/catalog/publish-categories";
import { buildProductMeta } from "@/lib/catalog/product-fields";
import {
  localizeProductMetaEntries,
  localizeSubcategoryFieldLabel,
} from "@/lib/catalog/localize-product-fields";
import { listCatalogCategories, listCatalogSubcategories } from "@/lib/site-data";
import { ListingImagesUpload, type ListingImageItem } from "@/components/listings/listing-images-upload";
import { publishCatalogProductAction } from "@/app/actions/publish-catalog";
import { recordPublishConsentAction } from "@/app/actions/compliance";
import { attachListingImageUrlsToProductAction } from "@/app/actions/publish-listing-images";
import { uploadListingImagesFromBrowser } from "@/lib/listings/upload-images";
import { requestCatalogRefresh } from "@/lib/catalog-refresh";
import { PublishRulesConsent } from "@/components/legal/publish-rules-consent";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";
import {
  publishDebug,
  publishDebugFail,
  summarizeFiles,
} from "@/lib/publish/publish-debug";
import { defaultGeneralProductPublishState } from "@/types/product";
import type { GeneralProductPublishState } from "@/types/product";
import type { CatalogCategory, CatalogSubcategory } from "@/types/store";

export function PublishForm({
  initialCategories = [],
}: {
  initialCategories?: CatalogCategory[];
}) {
  const t = useTranslations("publish");
  const tCatalogFields = useTranslations("catalogFields");
  const tJobs = useTranslations("jobs.publish");
  const tCommon = useTranslations("common");
  const formatErrorMessage = useFormatErrorMessage();
  const router = useRouter();
  const { isProfileComplete, profileFields, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<CatalogCategory[]>(
    initialCategories.length > 0 ? initialCategories : [],
  );
  const [categoriesLoading, setCategoriesLoading] = useState(
    initialCategories.length === 0,
  );
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<CatalogSubcategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [generalState, setGeneralState] = useState<GeneralProductPublishState>(
    defaultGeneralProductPublishState,
  );
  const [imageItems, setImageItems] = useState<ListingImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [propertyState, setPropertyState] = useState<PropertyPublishState>(
    defaultPropertyPublishState,
  );
  const [jobState, setJobState] = useState<JobPublishState>(defaultJobPublishState);
  const [acceptPublishRules, setAcceptPublishRules] = useState(false);
  const publishingRef = useRef(false);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const isProperty = isPropertyCategory(selectedCategory);
  const isJob = isJobCategory(selectedCategory);

  const steps = useMemo(() => {
    if (isProperty) {
      return [
        t("steps.category"),
        t("steps.property"),
        t("steps.photos"),
        t("steps.review"),
      ];
    }
    if (isJob) {
      return [t("steps.category"), t("steps.job"), t("steps.photos"), t("steps.review")];
    }
    return [
      t("steps.category"),
      t("steps.details"),
      t("steps.photos"),
      t("steps.review"),
    ];
  }, [isJob, isProperty, t]);

  useEffect(() => {
    if (authLoading) return;

    const cached = initialCategories.length > 0 ? initialCategories : categories;

    void (async () => {
      if (cached.length === 0) setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const cats = await listCatalogCategories();
        if (cats.length > 0) {
          setCategories(cats);
        } else if (cached.length > 0) {
          setCategories(cached);
          setCategoriesError(t("categoriesCacheWarning"));
        } else {
          setCategories(publishFallbackCategories);
          setCategoriesError(t("categoriesMissing"));
        }
      } catch (err) {
        const msg = formatErrorMessage(err);
        setCategories(cached.length > 0 ? cached : publishFallbackCategories);
        setCategoriesError(msg);
      } finally {
        setCategoriesLoading(false);
      }
    })();
  }, [authLoading, categories, formatErrorMessage, initialCategories, t]);

  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    const cat = categories.find((c) => c.id === categoryId);
    if (cat && (isPropertyCategory(cat) || isJobCategory(cat))) {
      setSubcategories([]);
      setSubcategoryId("");
      return;
    }
    void (async () => {
      try {
        const subs = await listCatalogSubcategories(categoryId);
        if (subs.length > 0) {
          setSubcategories(subs);
        } else {
          const raw = DEMO_SUBCATEGORIES[categoryId] ?? [];
          setSubcategories(
            raw.map((s: { id: string; name: string }) => ({
              id: s.id,
              categoryId,
              name: s.name,
              sortOrder: 0,
            })),
          );
        }
        setSubcategoryId("");
      } catch {
        const raw = DEMO_SUBCATEGORIES[categoryId] ?? [];
        setSubcategories(
          raw.map((s: { id: string; name: string }) => ({
            id: s.id,
            categoryId,
            name: s.name,
            sortOrder: 0,
          })),
        );
        setSubcategoryId("");
      }
    })();
  }, [categoryId, categories]);

  const categoryName = categories.find((c) => c.id === categoryId)?.name ?? "—";
  const subcategoryName =
    subcategories.find((s) => s.id === subcategoryId)?.name ?? "";

  function canAdvance(): boolean {
    if (step === 0) {
      if (!categoryId) return false;
      if (!isProperty && !isJob && subcategories.length > 0 && !subcategoryId) {
        return false;
      }
      return true;
    }
    if (step === 1 && isProperty) {
      return !validatePropertyPublishState(propertyState);
    }
    if (step === 1 && isJob) {
      return !validateJobPublish(jobState, tJobs);
    }
    if (step === 1) {
      return (
        validateGeneralProductPublish(
          categoryId,
          subcategoryId,
          generalState,
          subcategories.length > 0,
          tCatalogFields,
        ) === null
      );
    }
    if (step === 2) {
      return imageItems.some((i) => i.file);
    }
    return true;
  }

  async function handlePublish() {
    if (publishingRef.current) return;
    setError(null);
    setStatus(null);
    if (!acceptPublishRules) {
      setError(t("acceptRules"));
      return;
    }
    if (!isProfileComplete) {
      setError(t("completeProfile"));
      return;
    }
    publishingRef.current = true;
    setLoading(true);
    try {
      const files = imageItems.map((i) => i.file).filter((f): f is File => Boolean(f));
      if (files.length === 0) {
        setError(t("addPhoto"));
        setLoading(false);
        return;
      }

      const propMeta = isProperty ? buildPropertyMetaFromState(propertyState) : null;
      const jobMeta = isJob ? buildJobMeta(jobState) : null;
      const loc = isProperty
        ? [propertyState.bairro, propertyState.municipality, propertyState.province]
            .filter(Boolean)
            .join(", ")
        : isJob
          ? [jobState.municipality, jobState.province].filter(Boolean).join(", ")
          : formatAngolaLocation(generalState.municipality, generalState.province);

      const productId = newProductId();
      publishDebug("P1_GRAVAR_ANUNCIO", "utilizador clicou Publicar", {
        productId,
        ...summarizeFiles(files),
      });

      setStatus(t("statusStep1"));

      const payload = {
        id: productId,
        categoryId,
        subcategoryId: subcategoryId || null,
        title: isProperty
          ? propertyState.title
          : isJob
            ? jobState.title
            : generalState.title,
        priceLabel: isProperty
          ? formatPriceLabelFromState(propertyState)
          : isJob
            ? jobPriceLabelFromMeta(jobMeta!)
            : generalState.priceLabel,
        deliveryText: loc,
        description: isProperty
          ? propertyState.description || null
          : isJob
            ? jobState.description || null
            : generalState.description || null,
        imageUrls: [],
        imageUrl: null,
        listingKind: (isProperty ? "property" : isJob ? "job" : "general") as
          | "general"
          | "property"
          | "job",
        propertyMeta: propMeta,
        jobMeta,
        jobListingStatus: isJob ? ("active" as const) : undefined,
        productMeta: !isProperty && !isJob ? buildProductMeta(generalState.attributes) : null,
      };

      const published = await publishCatalogProductAction(payload);
      if (!published.ok) {
        setStatus(null);
        publishDebugFail("P1_GRAVAR_ANUNCIO", published.error, undefined, { productId });
        setError(t("step1Error", { error: published.error }));
        if (published.needsLogin) {
          router.push("/login?next=/publicar");
        }
        return;
      }

      void recordPublishConsentAction();

      publishDebug("P1_GRAVAR_ANUNCIO", "OK no cliente", { productId: published.productId });

      setStatus(t("statusStep2", { count: files.length }));
      const uploaded = await uploadListingImagesFromBrowser(files);
      if (!uploaded.ok) {
        setStatus(null);
        publishDebugFail("P2B_UPLOAD_DIRECTO", uploaded.error, undefined, {
          productId: published.productId,
        });
        setError(
          t("step2Error", {
            error: uploaded.error,
            productId: published.productId,
          }),
        );
        return;
      }

      publishDebug("P2B_UPLOAD_DIRECTO", "OK no cliente", {
        productId: published.productId,
        urlCount: uploaded.urls.length,
      });

      setStatus(t("statusStep3"));
      const attached = await attachListingImageUrlsToProductAction(
        published.productId,
        uploaded.urls,
      );
      if (!attached.ok) {
        setStatus(null);
        publishDebugFail("P3_LIGAR_FOTOS", attached.error, undefined, {
          productId: published.productId,
          urls: uploaded.urls,
        });
        setError(t("step3Error", { error: attached.error }));
        return;
      }

      publishDebug("P3_LIGAR_FOTOS", "publicação completa", {
        productId: published.productId,
      });
      setStatus(t("statusDone"));
      requestCatalogRefresh();
      router.push("/");
      router.refresh();
    } catch (err) {
      setStatus(null);
      publishDebugFail("P1_GRAVAR_ANUNCIO", "excepção inesperada", err);
      setError(formatErrorMessage(err));
    } finally {
      publishingRef.current = false;
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <RequireAuth>
        <p className="mt-8 text-center text-sm text-kumbu-muted">{tCommon("loading")}</p>
      </RequireAuth>
    );
  }

  if (!isProfileComplete) {
    return (
      <RequireAuth>
        <ProfileIncompleteBlock fields={profileFields} />
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="mt-6">
        <div className="kumbu-card-elevated p-5 md:p-6">
          <div className="flex gap-1.5">
            {steps.map((label, i) => (
              <div
                key={label}
                className={`kumbu-step-dot ${
                  i <= step ? "bg-kumbu-primary shadow-sm" : "bg-kumbu-border"
                }`}
                title={label}
              />
            ))}
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-widest text-kumbu-muted">
            {t("stepOf", { current: step + 1, total: steps.length })}
          </p>
          <p className="mt-0.5 text-lg font-extrabold tracking-tight text-kumbu-foreground">
            {steps[step]}
          </p>
        </div>

        <div className="kumbu-card mt-4 space-y-4 p-5 md:p-6">
          {step === 0 && (
            <>
              {categoriesLoading && (
                <p className="text-sm text-kumbu-muted">{t("loadingCategories")}</p>
              )}
              {categoriesError && !categoriesLoading && (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900" role="alert">
                  {categoriesError}
                </p>
              )}
              {!categoriesLoading && categories.length === 0 && (
                <p className="text-sm text-red-600" role="alert">
                  {t("noCategories")}
                </p>
              )}
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                {t("categoryLabel")}
                <select
                  required
                  disabled={categoriesLoading || categories.length === 0}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="kumbu-input font-normal"
                >
                  <option value="">
                    {categoriesLoading ? tCommon("loading") : t("selectCategory")}
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              {isProperty && (
                <p className="rounded-xl bg-sky-50 px-3 py-2 text-xs text-sky-900">
                  {t("propertyHint")}
                </p>
              )}
              {isJob && (
                <p className="rounded-xl bg-sky-50 px-3 py-2 text-xs text-sky-900">
                  {t("jobHint")}
                </p>
              )}
              {subcategories.length > 0 && !isProperty && !isJob && (
                <label className="flex flex-col gap-1.5 text-sm font-semibold">
                  {localizeSubcategoryFieldLabel(categoryId, tCatalogFields)} *
                  <select
                    required
                    value={subcategoryId}
                    onChange={(e) => {
                      setSubcategoryId(e.target.value);
                      setGeneralState((s) => ({ ...s, attributes: {} }));
                    }}
                    className="kumbu-input font-normal"
                  >
                    <option value="">{t("selectSubcategory")}</option>
                    {subcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </>
          )}

          {step === 1 && isProperty && (
            <PropertyPublishSection
              state={propertyState}
              onChange={(patch) => setPropertyState((s) => ({ ...s, ...patch }))}
            />
          )}

          {step === 1 && isJob && (
            <JobPublishSection
              state={jobState}
              onChange={(patch) => setJobState((s) => ({ ...s, ...patch }))}
            />
          )}

          {step === 1 && !isProperty && !isJob && (
            <GeneralProductPublishSection
              categoryId={categoryId}
              subcategoryId={subcategoryId}
              subcategoryName={subcategoryName}
              state={generalState}
              onChange={(patch) => setGeneralState((s) => ({ ...s, ...patch }))}
            />
          )}

          {step === 2 && (
            <ListingImagesUpload items={imageItems} onChange={setImageItems} />
          )}

          {step === 3 && (
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-kumbu-muted">{t("reviewCategory")}</dt>
                <dd className="font-bold">
                  {categoryName}
                  {subcategoryName ? ` · ${subcategoryName}` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-kumbu-muted">{t("reviewTitle")}</dt>
                <dd className="font-bold">
                  {isProperty
                    ? propertyState.title
                    : isJob
                      ? jobState.title
                      : generalState.title}
                </dd>
              </div>
              <div>
                <dt className="text-kumbu-muted">{isJob ? t("reviewSalary") : t("reviewPrice")}</dt>
                <dd className="font-bold text-kumbu-primary">
                  {isProperty
                    ? formatPriceLabelFromState(propertyState)
                    : isJob
                      ? jobPriceLabelFromMeta(buildJobMeta(jobState))
                      : generalState.priceLabel}
                </dd>
              </div>
              <div>
                <dt className="text-kumbu-muted">{t("reviewLocation")}</dt>
                <dd className="font-bold">
                  {isProperty
                    ? [propertyState.bairro, propertyState.municipality, propertyState.province]
                        .filter(Boolean)
                        .join(", ")
                    : isJob
                      ? [jobState.municipality, jobState.province].filter(Boolean).join(", ")
                      : formatAngolaLocation(generalState.municipality, generalState.province)}
                </dd>
              </div>
              {!isProperty &&
                !isJob &&
                localizeProductMetaEntries(
                  buildProductMeta(generalState.attributes),
                  tCatalogFields,
                ).map((e) => (
                  <div key={e.label}>
                    <dt className="text-kumbu-muted">{e.label}</dt>
                    <dd>{e.value}</dd>
                  </div>
                ))}
              {(isProperty
                ? propertyState.description
                : isJob
                  ? jobState.description
                  : generalState.description) && (
                <div>
                  <dt className="text-kumbu-muted">{t("reviewDescription")}</dt>
                  <dd>
                    {isProperty
                      ? propertyState.description
                      : isJob
                        ? jobState.description
                        : generalState.description}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-kumbu-muted">{t("reviewPhotos")}</dt>
                <dd className="font-bold">{t("imagesCount", { count: imageItems.length })}</dd>
              </div>
            </dl>
          )}

          {step === 3 && (
            <PublishRulesConsent
              checked={acceptPublishRules}
              onChange={setAcceptPublishRules}
            />
          )}

          {status && (
            <p className="rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-800">{status}</p>
          )}
          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            {step > 0 && (
              <Button
                type="button"
                variant="secondary"
                className="h-11 flex-1"
                onClick={() => setStep((s) => s - 1)}
              >
                {t("back")}
              </Button>
            )}
            {step < 3 ? (
              <Button
                type="button"
                className="h-11 flex-1"
                disabled={!canAdvance()}
                onClick={() => setStep((s) => s + 1)}
              >
                {t("next")}
              </Button>
            ) : (
              <Button
                type="button"
                className="h-11 flex-1"
                disabled={loading || !acceptPublishRules}
                onClick={() => void handlePublish()}
              >
                {loading ? t("saving") : t("submit")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
