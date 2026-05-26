export function formatCurrency(amount) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: amount % 1 ? 2 : 0,
  }).format(amount);
}
