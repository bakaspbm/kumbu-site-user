import { BackHeader } from "@/components/layout/back-header";
import { DeliveryAddressForm } from "@/components/delivery/delivery-address-form";

export default function DeliveryAddressPage() {
  return (
    <>
      <BackHeader title="Morada de entrega" href="/conta/perfil" />
      <main className="kumbu-container max-w-2xl pb-10">
        <p className="mt-4 text-sm text-kumbu-muted">
          A morada é usada no checkout e sincroniza com a sua conta Kumbú.
        </p>
        <DeliveryAddressForm />
      </main>
    </>
  );
}
