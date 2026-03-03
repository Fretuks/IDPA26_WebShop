const express = require('express');
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/orders', auth, role('ADMIN'), asyncHandler(orderController.getAllAdmin));

module.exports = router;
