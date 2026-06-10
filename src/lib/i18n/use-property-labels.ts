"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  isLandPropertyType,
  PROPERTY_TYPES,
} from "@/lib/property/constants";
import type {
  PropertyListingIntent,
  PropertyMeta,
  PropertyRentPeriod,
  PropertyType,
} from "@/types/property";

export function usePropertyTypeLabel() {
  const t = useTranslations("property.types");
  return useCallback((type: PropertyType) => t(type), [t]);
}

export function usePropertyPublishLabels() {
  const t = useTranslations("property.publish");
  const tTypes = useTranslations("property.types");
  const tPlaceholders = useTranslations("property.placeholders");

  const titlePlaceholder = useCallback(
    (propertyType: PropertyType) => tPlaceholders(`title.${propertyType}`),
    [tPlaceholders],
  );

  const descriptionPlaceholder = useCallback(
    (propertyType: PropertyType) => {
      if (isLandPropertyType(propertyType)) return tPlaceholders("description.land");
      if (propertyType === "quarto" || propertyType === "hospedaria") {
        return tPlaceholders("description.room");
      }
      if (propertyType === "hotel") return tPlaceholders("description.hotel");
      return tPlaceholders("description.default");
    },
    [tPlaceholders],
  );

  const pricePlaceholder = useCallback(
    (
      propertyType: PropertyType,
      listingIntent: PropertyListingIntent,
      rentPeriod: PropertyRentPeriod | "",
    ) => {
      if (isLandPropertyType(propertyType) || listingIntent === "sale") {
        return tPlaceholders("price.sale");
      }
      if (rentPeriod === "daily") return tPlaceholders("price.daily");
      return tPlaceholders("price.monthly");
    },
    [tPlaceholders],
  );

  const rentalMessagePlaceholder = useCallback(
    (propertyType: PropertyType, rentPeriod: PropertyRentPeriod | "") => {
      if (rentPeriod === "daily") {
        if (propertyType === "quarto") return tPlaceholders("rentalMessage.dailyRoom");
        if (propertyType === "hotel" || propertyType === "hospedaria") {
          return tPlaceholders("rentalMessage.dailyHotel");
        }
        return tPlaceholders("rentalMessage.dailyDefault");
      }
      if (propertyType === "quarto") return tPlaceholders("rentalMessage.longRoom");
      if (propertyType === "hotel" || propertyType === "hospedaria") {
        return tPlaceholders("rentalMessage.longHotel");
      }
      return tPlaceholders("rentalMessage.longDefault");
    },
    [tPlaceholders],
  );

  const constructionStageLabel = useCallback(
    (stage: NonNullable<PropertyMeta["constructionStage"]>) =>
      t(`constructionStages.${stage}`),
    [t],
  );

  const zoningLabel = useCallback(
    (zoning: NonNullable<PropertyMeta["zoning"]>) => t(`zonings.${zoning}`),
    [t],
  );

  return {
    t,
    tTypes,
    propertyTypes: PROPERTY_TYPES,
    titlePlaceholder,
    descriptionPlaceholder,
    pricePlaceholder,
    rentalMessagePlaceholder,
    constructionStageLabel,
    zoningLabel,
  };
}

export function usePropertyValidation() {
  const t = useTranslations("property.validation");

  return useCallback(
    (state: {
      title: string;
      priceAmount: string;
      municipality: string;
      propertyType: PropertyType;
      listingIntent: PropertyListingIntent;
      rentPeriod: PropertyRentPeriod | "";
    }): string | null => {
      if (!state.title.trim()) return t("titleRequired");
      if (!state.priceAmount.trim()) return t("priceRequired");
      if (!state.municipality.trim()) return t("municipalityRequired");
      if (
        !isLandPropertyType(state.propertyType) &&
        state.listingIntent === "rent" &&
        !state.rentPeriod
      ) {
        return t("rentPeriodRequired");
      }
      return null;
    },
    [t],
  );
}
