import { MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { icon: ShieldCheck, label: "Perfis verificados", color: "text-kumbu-verified" },
  { icon: MessageCircle, label: "Mensagens na app", color: "text-kumbu-primary" },
  { icon: Truck, label: "Entrega em Angola", color: "text-kumbu-accent" },
] as const;

export function TrustStrip() {
  return (
    <div className="kumbu-container py-2 md:py-3">
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
        {items.map(({ icon: Icon, label, color }) => (
          <div key={label} className="kumbu-trust-pill">
            <Icon className={cn("size-4 shrink-0", color)} aria-hidden />
            <span className="text-xs font-semibold text-kumbu-foreground sm:text-sm">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
