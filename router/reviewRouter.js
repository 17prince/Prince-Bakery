const express = require('express');

const reviewController = require('../controller/reviewController');
const authController = require('../controller/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get('/reviewaggregate', reviewController.reivewAggregate);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictExcept('user'),
    reviewController.setProductUserId,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authController.restrictExcept('user'), reviewController.updatedReview)
  .delete(authController.restrictExcept('user', 'admin'), reviewController.deleteReview);

module.exports = router;
