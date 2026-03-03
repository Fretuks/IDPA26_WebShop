const AppError = require('../utils/AppError');
const addressRepository = require('../repositories/addressRepository');
const userRepository = require('../repositories/userRepository');

async function ensureAddressOwnership(userId, addressId) {
  const address = await addressRepository.findById(addressId);
  if (!address || address.user_id !== userId) {
    throw new AppError('Address not found', 404);
  }
  return address;
}

module.exports = {
  async getMyAddresses(userId) {
    const user = await userRepository.findById(userId);
    const addresses = await addressRepository.findByUserId(userId);
    return {
      defaultShippingAddressId: user.default_shipping_address_id,
      defaultBillingAddressId: user.default_billing_address_id,
      addresses
    };
  },

  async createAddress(userId, payload) {
    return addressRepository.create({ userId, ...payload });
  },

  async updateAddress(userId, addressId, payload) {
    await ensureAddressOwnership(userId, addressId);
    return addressRepository.update(addressId, payload);
  },

  async deleteAddress(userId, addressId) {
    await ensureAddressOwnership(userId, addressId);
    await userRepository.clearDefaultAddressReferences(addressId);
    await addressRepository.remove(addressId);
  },

  async setDefaultShippingAddress(userId, addressId) {
    await ensureAddressOwnership(userId, addressId);
    await userRepository.setDefaultShippingAddress(userId, addressId);
    return { defaultShippingAddressId: addressId };
  },

  async setDefaultBillingAddress(userId, addressId) {
    await ensureAddressOwnership(userId, addressId);
    await userRepository.setDefaultBillingAddress(userId, addressId);
    return { defaultBillingAddressId: addressId };
  }
};
