const test = require('node:test');
const assert = require('node:assert/strict');

const addressService = require('./addressService');
const addressRepository = require('../repositories/addressRepository');
const userRepository = require('../repositories/userRepository');

const originalAddressRepository = {
  findById: addressRepository.findById,
  findByUserId: addressRepository.findByUserId,
  create: addressRepository.create,
  update: addressRepository.update,
  remove: addressRepository.remove
};

const originalUserRepository = {
  findById: userRepository.findById,
  clearDefaultAddressReferences: userRepository.clearDefaultAddressReferences,
  setDefaultShippingAddress: userRepository.setDefaultShippingAddress,
  setDefaultBillingAddress: userRepository.setDefaultBillingAddress
};

test.afterEach(() => {
  addressRepository.findById = originalAddressRepository.findById;
  addressRepository.findByUserId = originalAddressRepository.findByUserId;
  addressRepository.create = originalAddressRepository.create;
  addressRepository.update = originalAddressRepository.update;
  addressRepository.remove = originalAddressRepository.remove;
  userRepository.findById = originalUserRepository.findById;
  userRepository.clearDefaultAddressReferences = originalUserRepository.clearDefaultAddressReferences;
  userRepository.setDefaultShippingAddress = originalUserRepository.setDefaultShippingAddress;
  userRepository.setDefaultBillingAddress = originalUserRepository.setDefaultBillingAddress;
});

test('getMyAddresses returns addresses together with both defaults', async () => {
  userRepository.findById = async () => ({
    default_shipping_address_id: 11,
    default_billing_address_id: 12
  });
  addressRepository.findByUserId = async () => [{ id: 11 }, { id: 12 }];

  const result = await addressService.getMyAddresses(5);

  assert.deepEqual(result, {
    defaultShippingAddressId: 11,
    defaultBillingAddressId: 12,
    addresses: [{ id: 11 }, { id: 12 }]
  });
});

test('createAddress forwards the user id into the repository payload', async () => {
  let receivedPayload;
  addressRepository.create = async (payload) => {
    receivedPayload = payload;
    return { id: 20, ...payload };
  };

  const result = await addressService.createAddress(5, {
    street: 'Main',
    houseNumber: '1',
    zip: '8000',
    city: 'Zurich',
    country: 'CH'
  });

  assert.deepEqual(receivedPayload, {
    userId: 5,
    street: 'Main',
    houseNumber: '1',
    zip: '8000',
    city: 'Zurich',
    country: 'CH'
  });
  assert.equal(result.id, 20);
});

test('updateAddress rejects addresses owned by another user before updating', async () => {
  let updateCalled = false;
  addressRepository.findById = async () => ({ id: 7, user_id: 99 });
  addressRepository.update = async () => {
    updateCalled = true;
  };

  await assert.rejects(() => addressService.updateAddress(5, 7, { city: 'Bern' }), {
    message: 'Address not found',
    statusCode: 404
  });

  assert.equal(updateCalled, false);
});

test('deleteAddress clears default references before removing the address', async () => {
  const operations = [];
  addressRepository.findById = async () => ({ id: 7, user_id: 5 });
  userRepository.clearDefaultAddressReferences = async (addressId) => {
    operations.push({ type: 'clearDefaults', addressId });
  };
  addressRepository.remove = async (addressId) => {
    operations.push({ type: 'remove', addressId });
  };

  await addressService.deleteAddress(5, 7);

  assert.deepEqual(operations, [
    { type: 'clearDefaults', addressId: 7 },
    { type: 'remove', addressId: 7 }
  ]);
});

test('setDefaultShippingAddress checks ownership and persists the selection', async () => {
  const operations = [];
  addressRepository.findById = async () => ({ id: 7, user_id: 5 });
  userRepository.setDefaultShippingAddress = async (userId, addressId) => {
    operations.push({ userId, addressId });
  };

  const result = await addressService.setDefaultShippingAddress(5, 7);

  assert.deepEqual(operations, [{ userId: 5, addressId: 7 }]);
  assert.deepEqual(result, { defaultShippingAddressId: 7 });
});

test('setDefaultBillingAddress rejects unknown addresses', async () => {
  let setCalled = false;
  addressRepository.findById = async () => null;
  userRepository.setDefaultBillingAddress = async () => {
    setCalled = true;
  };

  await assert.rejects(() => addressService.setDefaultBillingAddress(5, 7), {
    message: 'Address not found',
    statusCode: 404
  });

  assert.equal(setCalled, false);
});
