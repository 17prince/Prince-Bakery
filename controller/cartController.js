const AppError = require('../utiles/appError');
const catchAsync = require('../utiles/catchAsync');
const Cart = require('../models/cartModel');
const factory = require('./factoryHandler');

exports.getAllCart = factory.getAll(Cart);

exports.createCart = catchAsync(async (req, res, next) => {
  if (!req.body) return next(new AppError('Please provide PRODUCT ID and USER ID.', 404));

  const cartInfo = { product: req.body.product, user: req.body.user };

  // Check if the current user id matches with provided user id
  if (cartInfo.user !== req.user.id) {
    return next(new AppError('User ID does not match with provided ID in cart.', 401));
  }

  // check if the product is already in the cart
  const validate = await Cart.findOne({
    $and: [{ product: cartInfo.product }, { user: cartInfo.user }],
  });
  if (validate) return next(new AppError('This product is already in your cart.', 400));

  // If not: Add product to the cart
  const newCart = await Cart.create(cartInfo);

  res.status(200).json({
    status: 'success',
    data: newCart,
  });
});

exports.getCart = factory.getOne(Cart, { path: 'product', select: 'name price' });

exports.deleteCart = catchAsync(async (req, res, next) => {
  const cartToDelete = await Cart.findOne({
    $and: [{ _id: req.params.id }, { user: req.user.id }],
  });

  if (!cartToDelete) return next(new AppError('No item found with this parameter', 404));

  await Cart.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMyCart = catchAsync(async (req, res, next) => {
  const userId = req.params.userid;
  if (userId) return next(new AppError('Please provide a valid User Id', 404));

  const allCarts = await Cart.find({ user: userId }).select('-__v');

  res.status(200).json({
    status: 'success',
    results: allCarts.length,
    data: allCarts,
  });
});
