const express = require('express');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler = require('../utils/asyncHandler');
const { idParamValidator, orderStatusValidator, userRoleValidator } = require('../validators/commonValidators');
const { UserRole } = require('../models/enums');

const router = express.Router();

router.use(auth, role(UserRole.ADMIN));
router.get('/orders', asyncHandler(adminController.getOrders));
router.get('/products', asyncHandler(adminController.getProducts));
router.get('/users', asyncHandler(adminController.getUsers));
router.patch('/orders/:id/status', [...idParamValidator, ...orderStatusValidator], validateRequest, asyncHandler(adminController.updateOrderStatus));
router.patch('/users/:id/role', [...idParamValidator, ...userRoleValidator], validateRequest, asyncHandler(adminController.updateUserRole));

module.exports = router;
