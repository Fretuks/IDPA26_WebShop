export const SHIPPING_COST = 10;
export const FREE_SHIPPING_THRESHOLD = 100;

export function calculateShipping(subtotal) {
  return Number(subtotal || 0) >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

export function getFreeShippingRemaining(subtotal) {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - Number(subtotal || 0));
}
