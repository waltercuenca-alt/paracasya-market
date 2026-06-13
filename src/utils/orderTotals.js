export const DELIVERY_FEE = 5;

export function calculateOrderTotals(items, settings = {}) {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const configuredFee = Number(settings.deliveryFee ?? settings.delivery_fee ?? DELIVERY_FEE);
  const deliveryActive = settings.deliveryActive ?? settings.delivery_active ?? true;
  const validFee =
    Number.isFinite(configuredFee) && configuredFee >= 0 ? configuredFee : DELIVERY_FEE;
  const deliveryFee = items.length && deliveryActive ? validFee : 0;

  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  };
}
