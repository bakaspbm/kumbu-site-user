import Link from "next/link";

interface TermsConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export function TermsConsentCheckbox({
  checked,
  onChange,
  id = "terms-consent",
}: TermsConsentCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 text-left text-xs leading-relaxed text-kumbu-muted"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded border-kumbu-border accent-kumbu-primary"
      />
      <span>
        Confirmo que tenho 18 anos ou mais e aceito os{" "}
        <Link href="/termos" target="_blank" className="font-semibold text-kumbu-primary">
          Termos de Utilização
        </Link>{" "}
        e a{" "}
        <Link href="/privacidade" target="_blank" className="font-semibold text-kumbu-primary">
          Política de Privacidade
        </Link>
        .
      </span>
    </label>
  );
}
