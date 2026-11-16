import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { readCartToken } from "@/lib/cart-token";
import { getOrCreateCartByUser, getCartByGuestToken } from "@/server/repositories/cart.repo";
import { listDeliveryZones } from "@/server/repositories/delivery.repo";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";

export default async function CheckoutPage() {
  const session = await auth();
  let hasCart = false;

  if (session?.user?.id) {
    const cart = await getOrCreateCartByUser(session.user.id);
    hasCart = cart.items.length > 0;
  } else {
    const token = await readCartToken();
    if (token) {
      const cart = await getCartByGuestToken(token);
      hasCart = !!cart && cart.items.length > 0;
    }
  }

  if (!hasCart) redirect("/cart");

  const zones = await listDeliveryZones();

  return (
    <CheckoutFlow
      zones={zones}
      defaultEmail={session?.user?.email ?? ""}
      defaultName={session?.user?.name ?? ""}
    />
  );
}