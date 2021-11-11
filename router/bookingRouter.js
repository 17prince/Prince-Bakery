const express = require('express');

const bookingController = require('../controller/bookingController');
const authController = require('../controller/authController');

const route = express.Router();

route.use(authController.protect);

route.post('/checkout-session', bookingController.getCheckOutSession);

module.exports = route;
