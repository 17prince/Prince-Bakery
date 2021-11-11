const Products = require('../models/productModel');
const Cart = require('../models/cartModel');
const AppError = require('../utiles/appError');
const catchAsync = require('../utiles/catchAsync');

exports.getHome = catchAsync(async (req, res, next) => {
  const aggregate = await Products.aggregate([
    {
      $match: { averageRatings: { $gt: 3.9 } },
    },
    {
      $sort: { averageRating: -1, price: 1 },
    },

    {
      $group: {
        _id: '$topCategory',
        totalProduct: { $sum: 1 },
        productList: {
          $push: {
            id: '$_id',
            Name: '$name',
            Price: '$price',
            Rating: '$averageRatings',
            quantity: '$ratingsQuantity',
            slug: '$slug',
            image: '$image',
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        totalProduct: 1,
        topProducts: { $slice: ['$productList', 5] },
      },
    },
  ]);
  const topRatedProducts = [
    ...aggregate[0].topProducts.slice(0, 4),
    ...aggregate[1].topProducts.slice(0, 2),
  ];
  res.render('index', { title: 'Home', data: topRatedProducts });
});

// Get all products
exports.getAllProducts = catchAsync(async (req, res) => {
  const allProducts = await Products.find().limit(10);
  const totDoc = await Products.estimatedDocumentCount();

  res.render('products', {
    title: 'All Products',
    items: allProducts,
    totalProduct: totDoc,
    outOfFound: allProducts.length,
  });
});

// Get a product
exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Products.findOne({ slug: req.params.productName }).populate({
    path: 'reviews',
    fields: 'user',
  });
  if (!product) return next(AppError('No Product Found ', 404));
  res.render('getproduct', { title: req.params.productName.split('-').join(' '), product });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res
    .set('Content-Security-Policy', 'self https://*apis.google.com/js/platform.js')
    .render('login', { title: 'Login' });
});

exports.showMyCart = catchAsync(async (req, res, next) => {
  const userId = req.params.userid;
  if (!userId)
    return next(
      new AppError('Something went wrong while getting you cart products. Please try later !', 404)
    );
  const cartList = await Cart.find({ user: userId });
  res.render('cart', { title: 'MyCart', carts: cartList });
});

exports.getMe = catchAsync(async (req, res, next) => {
  res.render('getme');
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  res.render('forgetPassword', { title: 'Forgot Password' });
});

exports.getResetPasswordForm = catchAsync(async (req, res, next) => {
  if (!req.params.token)
    return next(new AppError('Please provide token to reset your password', 401));
  const resetToken = req.params.token;

  res.render('resetPassword', { title: 'Reset Password', resetToken });
});

// Message to show whenever a route is in maintinace
exports.pageMaintinace = catchAsync(async (req, res, next) => {
  res.render('error', {
    title: 'Coming Soon',
    mssg: 'This URL is not implemented yet. This page is coming soon',
  });
});
