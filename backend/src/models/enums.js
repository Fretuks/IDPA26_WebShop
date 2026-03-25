const UserRole = Object.freeze({
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN'
});

function isUserRole(value) {
  return Object.values(UserRole).includes(value);
}

const PaymentMethod = Object.freeze({
  INVOICE: 'INVOICE',
  CREDIT_CARD: 'CREDIT_CARD',
  PAYPAL: 'PAYPAL'
});

const OrderStatus = Object.freeze({
  OPEN: 'OPEN',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED'
});

module.exports = {
  UserRole,
  isUserRole,
  PaymentMethod,
  OrderStatus
};
