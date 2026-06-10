import Link from "next/link";
import { BackHeader } from "@/components/layout/back-header";
import type { LegalSection } from "@/lib/legal/content";

interface LegalDocumentProps {
  title: string;
  intro?: string;
  sections: LegalSection[];
  lastUpdated?: string;
  relatedLinks?: { href: string; label: string }[];
}

export function LegalDocument({
  title,
  intro,
  sections,
  lastUpdated,
  relatedLinks = [],
}: LegalDocumentProps) {
  return (
    <article>
      <BackHeader title={title} />
      <main className="kumbu-container max-w-2xl pb-12 pt-2">
        {lastUpdated && (
          <p className="text-xs font-semibold text-kumbu-muted">
            Última actualização: {lastUpdated}
          </p>
        )}
        {intro && (
          <p className="mt-4 text-sm leading-relaxed text-kumbu-muted">{intro}</p>
        )}
        <div className="mt-6 space-y-6">
          {sections.map((s) => (
            <section key={s.title} className="kumbu-card p-5">
              <h2 className="text-base font-extrabold text-kumbu-foreground">{s.title}</h2>
              <div className="mt-3 space-y-3">
                {s.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-kumbu-muted">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
        {relatedLinks.length > 0 && (
          <nav className="mt-8 flex flex-col gap-2 text-sm font-semibold">
            {relatedLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-kumbu-primary hover:underline"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
        <p className="mt-8 text-xs leading-relaxed text-kumbu-muted">
          Este texto é informativo e não constitui aconselhamento jurídico. Para conformidade
          plena em Angola, valide com um advogado local.
        </p>
      </main>
    </article>
  );
}
