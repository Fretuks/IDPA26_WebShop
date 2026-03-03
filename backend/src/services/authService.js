const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const userRepository = require('../repositories/userRepository');
const env = require('../config/env');
const { UserRole } = require('../models/enums');

module.exports = {
  async register(payload) {
    const existing = await userRepository.findByEmail(payload.email);
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await bcrypt.hash(payload.password, env.bcryptRounds);
    const user = await userRepository.create({
      firstname: payload.firstname,
      lastname: payload.lastname,
      email: payload.email,
      passwordHash,
      phone: payload.phone || null,
      role: UserRole.CUSTOMER
    });

    return user;
  },

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn
    });

    return {
      token,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role
      }
    };
  }
};
