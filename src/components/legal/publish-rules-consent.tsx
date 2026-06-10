import Link from "next/link";

interface PublishRulesConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function PublishRulesConsent({ checked, onChange }: PublishRulesConsentProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-kumbu-border bg-kumbu-secondary/40 p-4 text-left text-xs leading-relaxed text-kumbu-muted">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded accent-kumbu-primary"
      />
      <span>
        Li e aceito as{" "}
        <Link href="/regras-publicacao" target="_blank" className="font-semibold text-kumbu-primary">
          Regras de Publicação
        </Link>
        . O anúncio é verdadeiro e lícito em Angola.
      </span>
    </label>
  );
}
