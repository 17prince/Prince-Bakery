/* eslint-disable no-undef */
const Reviews = require('../models/reviewModel');
const AppError = require('../utiles/appError');
const catchAsync = require('../utiles/catchAsync');
const factory = require('./factoryHandler');

const preventDupliReviews = async (productId, userId) => {
  const review = await Reviews.find({
    $and: [{ product: productId, user: userId }],
  });

  return review.length;
};

exports.setProductUserId = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.reivewAggregate = catchAsync(async (req, res, next) => {
  const aggregate = await Reviews.aggregate([
    {
      $match: { rating: { $gt: 0 } },
    },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: aggregate,
  });
});

exports.getAllReviews = factory.getAll(Reviews);

exports.createReview = catchAsync(async (req, res, next) => {
  if ((await preventDupliReviews(req.params.productId, req.user._id)) > 0)
    return next(new AppError('You have already reviewed for this product.', 404));

  const options = {
    rating: req.body.rating,
    review: req.body.review,
    product: req.body.product,
    user: req.body.user,
  };

  const newReview = await Reviews.create(options);

  res.status(201).json({
    status: 'success',
    data: {
      newReview,
    },
  });
});

exports.getReview = factory.getOne(Reviews);

exports.updatedReview = catchAsync(async (req, res, next) => {
  const reviewtoUpdate = await Reviews.findById(req.params.id);

  // check if the review exsit
  if (!reviewtoUpdate) return next(new AppError('No review found with this user.', 404));

  // check if the review is created and updated by the same user.
  if (JSON.stringify(reviewtoUpdate.user._id) !== JSON.stringify(req.user._id))
    return next(new AppError('User does not belongs with this review', 401));

  // finally update
  reviewtoUpdate.rating = req.body.rating;
  reviewtoUpdate.review = req.body.review;

  await reviewtoUpdate.save();

  res.status(201).json({
    status: 'success',
    data: {
      reviewtoUpdate,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Reviews.findById(req.params.id);

  if (JSON.stringify(review.user._id) !== JSON.stringify(req.user._id))
    return next(new AppError('User does not belongs with this review', 401));

  await Reviews.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    data: null,
  });
});
