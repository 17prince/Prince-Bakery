const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  products: {
    type: [mongoose.Schema.ObjectId],
    ref: 'Products',
    required: [true, 'Booking must belongs to a products'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    requried: [true, 'Booking must belongs to an user'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

// Query middleware for populating user and products
bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'products',
    select: 'name',
  });
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
