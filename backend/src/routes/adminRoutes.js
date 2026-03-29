const express = require('express');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { UserRole } = require('../models/enums');

const router = express.Router();

router.use(auth, role(UserRole.ADMIN));
router.get('/orders', asyncHandler(adminController.getOrders));
router.get('/products', asyncHandler(adminController.getProducts));
router.get('/users', asyncHandler(adminController.getUsers));

module.exports = router;
