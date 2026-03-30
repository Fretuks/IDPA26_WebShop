const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');
const env = require('../config/env');
const userRepository = require('../repositories/userRepository');
const { UserRole } = require('../models/enums');

module.exports = {
  getAllAdmin() {
    return userRepository.findAll();
  },

  async getById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  },

  async updateProfile(userId, payload) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return userRepository.updateProfile(userId, {
      firstname: payload.firstname,
      lastname: payload.lastname,
      phone: payload.phone || null
    });
  },

  async changePassword(userId, currentPassword, newPassword) {
    const currentUser = await userRepository.findById(userId);
    if (!currentUser) {
      throw new AppError('User not found', 404);
    }

    const user = await userRepository.findByEmail(currentUser.email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const matches = await bcrypt.compare(currentPassword, user.password_hash);
    if (!matches) {
      throw new AppError('Current password is incorrect', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, env.bcryptRounds);
    await userRepository.updatePasswordHash(userId, passwordHash);
  },

  async updateRole(userId, role, actorUserId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (Number(actorUserId) === Number(userId) && role !== UserRole.ADMIN) {
      throw new AppError('You cannot remove your own admin role', 400);
    }

    const updatedUser = await userRepository.updateRole(userId, role);
    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }

    return updatedUser;
  }
};
