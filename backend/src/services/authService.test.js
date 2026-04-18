const test = require('node:test');
const assert = require('node:assert/strict');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authService = require('./authService');
const userRepository = require('../repositories/userRepository');
const addressRepository = require('../repositories/addressRepository');
const { UserRole } = require('../models/enums');

const originalBcrypt = {
  hash: bcrypt.hash,
  compare: bcrypt.compare
};

const originalJwt = {
  sign: jwt.sign
};

const originalUserRepository = {
  findByEmail: userRepository.findByEmail,
  create: userRepository.create,
  findById: userRepository.findById,
  setDefaultShippingAddress: userRepository.setDefaultShippingAddress,
  setDefaultBillingAddress: userRepository.setDefaultBillingAddress
};

const originalAddressRepository = {
  create: addressRepository.create
};

test.afterEach(() => {
  bcrypt.hash = originalBcrypt.hash;
  bcrypt.compare = originalBcrypt.compare;
  jwt.sign = originalJwt.sign;
  userRepository.findByEmail = originalUserRepository.findByEmail;
  userRepository.create = originalUserRepository.create;
  userRepository.findById = originalUserRepository.findById;
  userRepository.setDefaultShippingAddress = originalUserRepository.setDefaultShippingAddress;
  userRepository.setDefaultBillingAddress = originalUserRepository.setDefaultBillingAddress;
  addressRepository.create = originalAddressRepository.create;
});

test('register rejects duplicate emails before creating user data', async () => {
  userRepository.findByEmail = async () => ({ id: 1 });
  let createCalled = false;
  userRepository.create = async () => {
    createCalled = true;
  };

  await assert.rejects(
    () =>
      authService.register({
        firstname: 'Ada',
        lastname: 'Lovelace',
        email: 'ada@example.com',
        password: 'secret',
        address: {
          street: 'Main',
          houseNumber: '1',
          zip: '8000',
          city: 'Zurich',
          country: 'CH'
        }
      }),
    {
      message: 'Email already registered',
      statusCode: 409
    }
  );

  assert.equal(createCalled, false);
});

test('register creates user, address and default address links', async () => {
  const calls = [];

  userRepository.findByEmail = async () => null;
  bcrypt.hash = async (password, rounds) => {
    calls.push({ type: 'hash', password, rounds });
    return 'hashed-password';
  };
  userRepository.create = async (payload) => {
    calls.push({ type: 'createUser', payload });
    return { id: 42 };
  };
  addressRepository.create = async (payload) => {
    calls.push({ type: 'createAddress', payload });
    return { id: 99 };
  };
  userRepository.setDefaultShippingAddress = async (userId, addressId) => {
    calls.push({ type: 'setShipping', userId, addressId });
  };
  userRepository.setDefaultBillingAddress = async (userId, addressId) => {
    calls.push({ type: 'setBilling', userId, addressId });
  };
  userRepository.findById = async (userId) => ({
    id: userId,
    email: 'ada@example.com',
    role: UserRole.CUSTOMER
  });

  const user = await authService.register({
    firstname: 'Ada',
    lastname: 'Lovelace',
    email: 'ada@example.com',
    password: 'secret',
    phone: '+41 44 555 55 55',
    address: {
      street: 'Main',
      houseNumber: '1',
      zip: '8000',
      city: 'Zurich',
      country: 'CH'
    }
  });

  assert.deepEqual(user, {
    id: 42,
    email: 'ada@example.com',
    role: UserRole.CUSTOMER
  });
  assert.deepEqual(calls, [
    { type: 'hash', password: 'secret', rounds: 12 },
    {
      type: 'createUser',
      payload: {
        firstname: 'Ada',
        lastname: 'Lovelace',
        email: 'ada@example.com',
        passwordHash: 'hashed-password',
        phone: '+41 44 555 55 55',
        role: UserRole.CUSTOMER
      }
    },
    {
      type: 'createAddress',
      payload: {
        userId: 42,
        street: 'Main',
        houseNumber: '1',
        zip: '8000',
        city: 'Zurich',
        country: 'CH'
      }
    },
    { type: 'setShipping', userId: 42, addressId: 99 },
    { type: 'setBilling', userId: 42, addressId: 99 }
  ]);
});

test('login rejects invalid passwords', async () => {
  userRepository.findByEmail = async () => ({
    id: 7,
    email: 'ada@example.com',
    password_hash: 'stored-hash',
    role: UserRole.CUSTOMER
  });
  bcrypt.compare = async () => false;

  await assert.rejects(() => authService.login('ada@example.com', 'wrong-password'), {
    message: 'Invalid credentials',
    statusCode: 401
  });
});

test('login returns signed token and mapped user payload', async () => {
  userRepository.findByEmail = async () => ({
    id: 7,
    firstname: 'Ada',
    lastname: 'Lovelace',
    email: 'ada@example.com',
    phone: null,
    password_hash: 'stored-hash',
    role: UserRole.ADMIN,
    created_at: '2026-03-20T12:00:00.000Z',
    default_shipping_address_id: 10,
    default_billing_address_id: 11
  });
  bcrypt.compare = async () => true;
  jwt.sign = (payload, secret, options) => {
    assert.deepEqual(payload, { sub: 7, role: UserRole.ADMIN, email: 'ada@example.com' });
    assert.equal(secret, process.env.JWT_SECRET);
    assert.deepEqual(options, { expiresIn: process.env.JWT_EXPIRES_IN || '12h' });
    return 'signed-token';
  };

  const result = await authService.login('ada@example.com', 'secret');

  assert.deepEqual(result, {
    token: 'signed-token',
    user: {
      id: 7,
      firstname: 'Ada',
      lastname: 'Lovelace',
      email: 'ada@example.com',
      phone: null,
      role: UserRole.ADMIN,
      created_at: '2026-03-20T12:00:00.000Z',
      default_shipping_address_id: 10,
      default_billing_address_id: 11
    }
  });
});
