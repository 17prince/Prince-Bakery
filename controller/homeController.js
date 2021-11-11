const Products = require('../models/productModel');
const catchAsync = require('../utiles/catchAsync');

exports.getHomePage = catchAsync(async (req, res, next) => {
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
            Name: '$name',
            Price: '$price',
            Rating: '$averageRatings',
            quantity: '$ratingsQuantity',
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

  res.status(200).json({
    status: 'success',
    data: aggregate,
  });
});
