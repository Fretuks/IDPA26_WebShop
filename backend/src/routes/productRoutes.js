const express = require('express');
const productController = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler = require('../utils/asyncHandler');
const { idParamValidator, productValidator } = require('../validators/commonValidators');
const { UserRole } = require('../models/enums');

const router = express.Router();

router.get('/', asyncHandler(productController.getAll));
router.get('/:id', idParamValidator, validateRequest, asyncHandler(productController.getById));
router.post('/', auth, role(UserRole.ADMIN), productValidator, validateRequest, asyncHandler(productController.create));
router.put('/:id', auth, role(UserRole.ADMIN), [...idParamValidator, ...productValidator], validateRequest, asyncHandler(productController.update));
router.delete('/:id', auth, role(UserRole.ADMIN), idParamValidator, validateRequest, asyncHandler(productController.remove));

module.exports = router;
