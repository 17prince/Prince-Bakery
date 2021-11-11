const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AppError = require('../utiles/appError');
const catchAsync = require('../utiles/catchAsync');
const factory = require('./factoryHandler');
const User = require('../models/userModel');
const Products = require('../models/productModel');
const Booking = require('../models/bookingModel');

async function getItems(itemIds) {
  const productsInfo = [];
  itemIds.forEach((ele) => {
    productsInfo.push(Products.findById(ele));
  });
  return productsInfo;
}

exports.getCheckOutSession = catchAsync(async (req, res, next) => {
  if (req.body.productIds.length === 0)
    return next(new AppError('Please provide product ID.', 404));
  // 1. Get currently ordered product
  const promiseArray = await getItems(req.body.productIds);
  const itemDetails = await Promise.all(promiseArray);
  const itemsToBuy = [];
  itemDetails.forEach((obj) => {
    const object = {
      name: obj.name,
      images: [`${req.protocol}://${req.get('host')}/${obj.image}`],
      amount: obj.price * 100,
      currency: 'inr',
      quantity: 1,
    };
    itemsToBuy.push(object);
  });
  // 2. Create check out session of Stripe
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: itemsToBuy,
    customer_email: req.user.email,
    client_reference_id: `${req.body.productIds.join(' ')}`,
    success_url: `${req.protocol}://${req.get('host')}?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/products/`,
  });

  // 3. Create checkout as session
  res.status(200).json({
    status: 'success',
    session,
  });
});

const createBookingCheckOut = async (session) => {
  const products = session.client_reference_id.split(' ');
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;
  await Booking.create({ products, user, price });
};

// Webhook checkout for database entry of order
const webhooksCheckOut = (req, res, next) => {};
