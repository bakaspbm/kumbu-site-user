"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronLeft,
  MonitorSmartphone,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { KumbuLogo } from "@/components/brand/kumbu-logo";
import { cn } from "@/lib/utils";

const ONBOARDING_KEY = "kumbu_onboarding_done";

type Slide = {
  title: string;
  body: string;
  icon: LucideIcon;
};

export function OnboardingScreen() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const slides: Slide[] = useMemo(
    () => [
      {
        title: t("slide1Title"),
        body: t("slide1Body"),
        icon: ShoppingBag,
      },
      {
        title: t("slide2Title"),
        body: t("slide2Body"),
        icon: Sparkles,
      },
      {
        title: t("slide3Title"),
        body: t("slide3Body"),
        icon: MonitorSmartphone,
      },
    ],
    [t],
  );

  const slide = slides[index];
  const isLast = index === slides.length - 1;
  const Icon = slide.icon;

  function finish() {
    try {
      localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
    }
    router.replace("/");
  }

  function goTo(i: number) {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  }

  function goNext() {
    if (isLast) finish();
    else goTo(index + 1);
  }

  function goBack() {
    if (index > 0) goTo(index - 1);
  }

  return (
    <div className="relative flex h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#f8f9fb] lg:bg-white">
      <div
        className="pointer-events-none absolute inset-0 lg:hidden"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(214,40,40,0.09), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 50%, rgba(244,162,97,0.07), transparent 50%)",
        }}
      />

      <aside className="relative hidden w-[min(420px,38%)] shrink-0 overflow-hidden lg:flex lg:flex-col">
        <div className="absolute inset-0 kumbu-gradient-hero" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 70%, rgba(255,255,255,0.2), transparent 55%)",
          }}
        />
        <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-12">
          <KumbuLogo height={32} variant="onDark" href={undefined} />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
              {t("marketplaceAngola")}
            </p>
            <h2 className="mt-3 text-[1.75rem] font-extrabold leading-snug tracking-tight text-white">
              {t("heroTitle")}
            </h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/75">
              {t("heroBody")}
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo_kumbu.png"
            alt=""
            width={120}
            height={40}
            className="h-8 w-auto object-contain opacity-90 brightness-0 invert"
            suppressHydrationWarning
          />
        </div>
      </aside>

      <main className="relative flex min-h-0 flex-1 flex-col">
        <header className="z-10 flex shrink-0 items-center justify-between px-5 pt-5 sm:px-7">
          <KumbuLogo height={24} variant="image" href={undefined} className="lg:hidden" />
          <span className="hidden lg:block" />
          <button
            type="button"
            onClick={finish}
            className="text-[13px] font-medium text-kumbu-muted transition-colors hover:text-kumbu-primary"
          >
            {t("skip")}
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 sm:px-7">
          <div className="w-full max-w-[360px]">
            <div className="mb-8 flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={t("stepAria", { step: i + 1 })}
                  aria-current={i === index ? "step" : undefined}
                  onClick={() => goTo(i)}
                  className={cn(
                    "flex h-7 min-w-7 items-center justify-center rounded-lg text-[11px] font-bold tabular-nums transition-all duration-300",
                    i === index
                      ? "bg-kumbu-primary text-white shadow-[0_2px_8px_rgba(214,40,40,0.35)]"
                      : i < index
                        ? "bg-kumbu-primary/10 text-kumbu-primary"
                        : "bg-white text-kumbu-muted ring-1 ring-kumbu-border/80",
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <span className="ml-auto text-[11px] font-medium text-kumbu-muted">
                {index + 1}/{slides.length}
              </span>
            </div>

            <div
              key={index}
              className={cn(
                direction === 1 ? "kumbu-onboarding-enter" : "kumbu-onboarding-enter-back",
              )}
            >
              <div className="mb-6 inline-flex rounded-2xl bg-white p-3.5 shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04]">
                <Icon className="size-6 text-kumbu-primary" strokeWidth={1.8} />
              </div>

              <h1 className="text-[1.5rem] font-extrabold leading-[1.2] tracking-tight text-kumbu-foreground sm:text-[1.625rem]">
                {slide.title}
              </h1>
              <p className="mt-2.5 text-[0.875rem] leading-[1.55] text-kumbu-muted">
                {slide.body}
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 px-5 pb-[max(1.125rem,env(safe-area-inset-bottom))] pt-2 sm:px-7">
          <div className="mx-auto flex w-full max-w-[360px] items-center gap-2">
            {index > 0 ? (
              <button
                type="button"
                onClick={goBack}
                aria-label={t("previous")}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-kumbu-muted ring-1 ring-kumbu-border/90 transition-colors hover:text-kumbu-foreground hover:ring-kumbu-primary/20"
              >
                <ChevronLeft className="size-4" strokeWidth={2} />
              </button>
            ) : (
              <span className="size-9 shrink-0" aria-hidden />
            )}

            <button
              type="button"
              onClick={goNext}
              className="kumbu-gradient-brand group flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl text-[13px] font-semibold text-white shadow-[0_2px_10px_rgba(214,40,40,0.28)] transition-all duration-200 hover:brightness-[1.03] active:scale-[0.99]"
            >
              {isLast ? t("enterKumbu") : t("continue")}
              <ArrowRight
                className="size-3.5 opacity-90 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.5}
              />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
