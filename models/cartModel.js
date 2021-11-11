const mongoose = require('mongoose');

// Schema for cart db
const cartSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Products',
      required: [true, 'Cart must belong to product'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Cart must belong to a user'],
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

// Preventing duplicate products on cart.
cartSchema.index({ product: 1, user: 1 }, { unique: true });

// Populating product
cartSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'product',
    select: 'name price slug image',
  });
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
