const express = require('express');
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler = require('../utils/asyncHandler');
const { idParamValidator, categoryValidator } = require('../validators/commonValidators');
const { UserRole } = require('../models/enums');

const router = express.Router();

router.get('/', asyncHandler(categoryController.getAll));
router.post('/', auth, role(UserRole.ADMIN), categoryValidator, validateRequest, asyncHandler(categoryController.create));
router.put('/:id', auth, role(UserRole.ADMIN), [...idParamValidator, ...categoryValidator], validateRequest, asyncHandler(categoryController.update));
router.delete('/:id', auth, role(UserRole.ADMIN), idParamValidator, validateRequest, asyncHandler(categoryController.remove));

module.exports = router;
