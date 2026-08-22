"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

const HERO_IMAGE = "/home/hero.webp";

export function HomeHeroBanner() {
  const t = useTranslations("home.hero");

  return (
    <section className="kumbu-container py-2 md:py-4" aria-label={t("aria")}>
      <div className="relative aspect-[16/10] min-h-[200px] overflow-hidden rounded-[var(--radius-kumbu-xl)] shadow-[var(--shadow-kumbu-md)] sm:aspect-[21/9] sm:min-h-[240px] md:min-h-[300px]">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1120px"
          className="object-cover object-[center_35%]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#1a1212]/88 via-[#1a1212]/55 to-[#d62828]/25"
          aria-hidden
        />
        <div className="relative z-10 flex h-full min-h-[inherit] flex-col justify-end p-5 sm:p-6 md:p-8 lg:p-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#f4a261]">
            Kumbú · {t("eyebrow")}
          </p>
          <h2 className="mt-2 max-w-xl text-2xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-3xl md:text-[2.15rem]">
            {t("title")}
          </h2>
          <p className="mt-2 max-w-lg text-sm text-white/80 sm:text-[15px]">
            {t("subtitle")}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/procurar"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-kumbu-primary shadow-[var(--shadow-kumbu-sm)] transition-transform hover:brightness-[1.02] active:scale-[0.99]"
            >
              {t("ctaExplore")}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/publicar"
              className="inline-flex h-11 items-center rounded-xl border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15"
            >
              {t("ctaSell")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
