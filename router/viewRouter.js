const express = require('express');

const viewController = require('../controller/viewController');
const authController = require('../controller/authController');

const router = express.Router();

router.get('/login', authController.isLogged, viewController.getLoginForm);
router.get('/forgotpassword', viewController.forgotPassword);
router.get('/passwordreset/:token', viewController.getResetPasswordForm);
router.route('/').get(authController.isLogged, viewController.getHome);
router.route('/products').get(authController.isLogged, viewController.getAllProducts);

// router.use();
router.get(
  '/me',
  viewController.pageMaintinace,
  authController.protect,
  authController.isLogged,
  viewController.getMe
);

router
  .route('/getproduct/:productName')
  .get(authController.protect, authController.isLogged, viewController.getProduct);
router
  .route('/mycart/:userid')
  .get(authController.protect, authController.isLogged, viewController.showMyCart);

module.exports = router;
