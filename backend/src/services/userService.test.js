const test = require('node:test');
const assert = require('node:assert/strict');

const bcrypt = require('bcrypt');

const userService = require('./userService');
const userRepository = require('../repositories/userRepository');
const { UserRole } = require('../models/enums');

const originalBcrypt = {
  hash: bcrypt.hash,
  compare: bcrypt.compare
};

const originalUserRepository = {
  findAll: userRepository.findAll,
  findById: userRepository.findById,
  updateProfile: userRepository.updateProfile,
  findByEmail: userRepository.findByEmail,
  updatePasswordHash: userRepository.updatePasswordHash,
  updateRole: userRepository.updateRole
};

test.afterEach(() => {
  bcrypt.hash = originalBcrypt.hash;
  bcrypt.compare = originalBcrypt.compare;
  userRepository.findAll = originalUserRepository.findAll;
  userRepository.findById = originalUserRepository.findById;
  userRepository.updateProfile = originalUserRepository.updateProfile;
  userRepository.findByEmail = originalUserRepository.findByEmail;
  userRepository.updatePasswordHash = originalUserRepository.updatePasswordHash;
  userRepository.updateRole = originalUserRepository.updateRole;
});

test('updateProfile rejects unknown users', async () => {
  userRepository.findById = async () => null;

  await assert.rejects(
    () =>
      userService.updateProfile(3, {
        firstname: 'Ada',
        lastname: 'Lovelace',
        phone: '+41 44 555 55 55'
      }),
    {
      message: 'User not found',
      statusCode: 404
    }
  );
});

test('changePassword rejects an incorrect current password', async () => {
  userRepository.findById = async () => ({ id: 3, email: 'ada@example.com' });
  userRepository.findByEmail = async () => ({ id: 3, password_hash: 'stored-hash' });
  bcrypt.compare = async () => false;

  await assert.rejects(() => userService.changePassword(3, 'wrong', 'new-secret'), {
    message: 'Current password is incorrect',
    statusCode: 400
  });
});

test('changePassword hashes the new password and persists it', async () => {
  const operations = [];

  userRepository.findById = async () => ({ id: 3, email: 'ada@example.com' });
  userRepository.findByEmail = async () => ({ id: 3, password_hash: 'stored-hash' });
  bcrypt.compare = async () => true;
  bcrypt.hash = async (password, rounds) => {
    operations.push({ type: 'hash', password, rounds });
    return 'new-hash';
  };
  userRepository.updatePasswordHash = async (userId, passwordHash) => {
    operations.push({ type: 'updatePasswordHash', userId, passwordHash });
  };

  await userService.changePassword(3, 'old-secret', 'new-secret');

  assert.deepEqual(operations, [
    { type: 'hash', password: 'new-secret', rounds: 12 },
    { type: 'updatePasswordHash', userId: 3, passwordHash: 'new-hash' }
  ]);
});

test('updateRole prevents admins from removing their own admin role', async () => {
  userRepository.findById = async () => ({ id: 3, role: UserRole.ADMIN });

  await assert.rejects(() => userService.updateRole(3, UserRole.CUSTOMER, 3), {
    message: 'You cannot remove your own admin role',
    statusCode: 400
  });
});

test('updateRole returns the updated user for valid changes', async () => {
  userRepository.findById = async () => ({ id: 4, role: UserRole.CUSTOMER });
  userRepository.updateRole = async (userId, role) => ({ id: userId, role });

  const updated = await userService.updateRole(4, UserRole.ADMIN, 1);

  assert.deepEqual(updated, { id: 4, role: UserRole.ADMIN });
});
