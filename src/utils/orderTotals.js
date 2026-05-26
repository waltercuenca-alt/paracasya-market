export const DELIVERY_FEE = 5;

export function calculateOrderTotals(items) {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryFee = items.length ? DELIVERY_FEE : 0;

  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  };
}
