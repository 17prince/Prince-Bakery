const mongoose = require('mongoose');
const Products = require('./productModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
      maxlength: 200,
    },
    rating: {
      type: Number,
      default: 0,
      max: 5,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Products',
      required: [true, 'Review must belong to a product'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// index
// Preventing duplicate reviews and with same user on a product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// for populating user on reviews
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  }).sort('-rating');
  next();
});

// Calcutaing review for products
reviewSchema.statics.calAverageRatings = async function (productId) {
  const static = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (static.length > 0) {
    await Products.findByIdAndUpdate(productId, {
      ratingsQuantity: static[0].nRatings,
      averageRatings: static[0].avgRating,
    });
  } else {
    await Products.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // this referce to current document but, this.constructor referces to model
  this.constructor.calAverageRatings(this.product);
});

// But what if user delete its review
// findByAndDelete => findOneAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // here 'this' is query object by doing so we are adding r property to the query object
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calAverageRatings(this.r.product);
});
const Reviews = mongoose.model('Reviews', reviewSchema);

module.exports = Reviews;
