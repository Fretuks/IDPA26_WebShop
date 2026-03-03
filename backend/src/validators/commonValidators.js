const { body, param } = require('express-validator');
const { PaymentMethod } = require('../models/enums');

const idParamValidator = [param('id').isInt({ min: 1 }).withMessage('Invalid id')];
const addressIdParamValidator = [param('addressId').isInt({ min: 1 }).withMessage('Invalid addressId')];

const categoryValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string')
];

const productValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().isString(),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  body('stock').isInt({ min: 0 }).withMessage('Stock cannot be negative'),
  body('categoryId').isInt({ min: 1 }).withMessage('Valid categoryId is required'),
  body('active').optional().isBoolean().withMessage('Active must be boolean')
];

const addCartItemValidator = [
  body('productId').isInt({ min: 1 }).withMessage('Valid productId is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be >= 1')
];

const updateCartItemValidator = [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be >= 1')];

const checkoutValidator = [
  body('paymentMethod')
    .isIn(Object.values(PaymentMethod))
    .withMessage('Payment method must be INVOICE, CREDIT_CARD, or PAYPAL'),
  body('addressId').optional().isInt({ min: 1 }).withMessage('addressId must be a positive integer'),
  body('shippingAddressId').optional().isInt({ min: 1 }).withMessage('shippingAddressId must be a positive integer'),
  body('billingAddressId').optional().isInt({ min: 1 }).withMessage('billingAddressId must be a positive integer')
];

const addressValidator = [
  body('street').trim().notEmpty().withMessage('street is required'),
  body('houseNumber').trim().notEmpty().withMessage('houseNumber is required'),
  body('zip')
    .trim()
    .matches(/^[A-Za-z0-9\- ]{3,12}$/)
    .withMessage('zip has invalid format'),
  body('city').trim().notEmpty().withMessage('city is required'),
  body('country')
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('country must be ISO-2 code')
    .matches(/^[A-Za-z]{2}$/)
    .withMessage('country must contain letters only')
    .customSanitizer((value) => value.toUpperCase())
];

module.exports = {
  idParamValidator,
  addressIdParamValidator,
  categoryValidator,
  productValidator,
  addCartItemValidator,
  updateCartItemValidator,
  checkoutValidator,
  addressValidator
};
