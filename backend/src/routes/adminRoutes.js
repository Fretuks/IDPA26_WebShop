const express = require('express');
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { UserRole } = require('../models/enums');

const router = express.Router();

router.get('/orders', auth, role(UserRole.ADMIN), asyncHandler(orderController.getAllAdmin));

module.exports = router;
