const { body } = require('express-validator');

const phoneRegex = /^[+()\d\s/-]{6,40}$/;

const registerValidator = [
  body('firstname').trim().notEmpty().withMessage('Firstname is required'),
  body('lastname').trim().notEmpty().withMessage('Lastname is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(phoneRegex)
    .withMessage('Phone has invalid format'),
  body('address.street').trim().notEmpty().withMessage('Street is required'),
  body('address.houseNumber').trim().notEmpty().withMessage('House number is required'),
  body('address.zip')
    .trim()
    .matches(/^[A-Za-z0-9\- ]{3,12}$/)
    .withMessage('Zip has invalid format'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('address.country')
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country must be ISO-2 code')
    .matches(/^[A-Za-z]{2}$/)
    .withMessage('Country must contain letters only')
    .customSanitizer((value) => value.toUpperCase())
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

const updateProfileValidator = [
  body('firstname').trim().notEmpty().withMessage('Firstname is required'),
  body('lastname').trim().notEmpty().withMessage('Lastname is required'),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(phoneRegex)
    .withMessage('Phone has invalid format')
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
];

module.exports = { registerValidator, loginValidator, updateProfileValidator, changePasswordValidator };
