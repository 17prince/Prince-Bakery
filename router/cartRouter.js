const express = require('express');

const cartController = require('../controller/cartController');
const authController = require('../controller/authController');

const router = express.Router();

router.use(authController.protect);
router
  .route('/mycart/:userid')
  .get(authController.protect, authController.isLogged, cartController.getMyCart);

router.route('/').get(cartController.getAllCart).post(cartController.createCart);

router.route('/:id').get(cartController.getCart).delete(cartController.deleteCart);

module.exports = router;
