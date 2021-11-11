const express = require('express');

// CONTROLLERS
const productController = require('../controller/productController');
const authController = require('../controller/authController');
const reviewRouter = require('./reviewRouter');

const router = express.Router();

// Router for reviwes
// POST: products/productId/review

router.use('/:productId/review', reviewRouter);

router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authController.protect,
    authController.restrictExcept('admin'),
    productController.createProduct
  );

router
  .route('/:id')
  .get(authController.protect, productController.getProduct)
  .patch(
    authController.protect,
    authController.restrictExcept('seller', 'admin'),
    productController.uploadPorductImages,
    productController.resizeProductImages,
    productController.updateProduct
  )
  .delete(
    authController.protect,
    authController.restrictExcept('seller', 'admin'),
    productController.deleteProduct
  );

module.exports = router;
