const express = require('express');
const rateLimiter = require('express-rate-limit');

const userController = require(`../controller/userController`);
const authController = require('../controller/authController');

const rateLimiterController = require('../controller/rateLimiterController');

const router = express.Router();

const signUpLimiter = rateLimiter({
  max: 5,
  windowMs: 24 * 60 * 60 * 1000,
  message: 'Too many account created with this IP. Try again after 24 hour',
});
router.use('/signup', signUpLimiter);

// geo-specital query
router.get('/user-at/:distance/center', userController.userWithIn);
// user-at/22.32534,75.342312/center

// finding user near the shop
router.get('/user-near-shop', userController.userNearShop);

router.get('/google/signin/:token', authController.authWithGoogle);
router.post('/signup', authController.signUp);
router.post('/login', rateLimiterController.routeRateLimit, authController.login);
router.get('/logout', authController.logout);

router.post('/forgotpassword', authController.forgetPassword);
router.patch('/resetpassword/:token', authController.resetPassword);

router.use(authController.protect);

// user acan get info about itself
router.get('/getme', userController.getme, userController.getUser);

router.patch('/updatemypassword', authController.updatePassword);

router.patch(
  '/updateme',
  userController.uploadUserPhoto,
  userController.resizeUserImage,
  userController.updateme
);
// delete user account by user itself
router.delete('/deleteme', userController.deleteMe);

router.use(authController.restrictExcept('admin'));

router.route('/').get(userController.getAllUsers).post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
