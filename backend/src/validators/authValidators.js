const { body } = require('express-validator');

const registerValidator = [
  body('firstname').trim().notEmpty().withMessage('Firstname is required'),
  body('lastname').trim().notEmpty().withMessage('Lastname is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').optional().isString().isLength({ min: 6, max: 40 }).withMessage('Phone has invalid format')
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

module.exports = { registerValidator, loginValidator };
