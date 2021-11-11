const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitizer = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
// const cors = require('cors');

// ROUTERS
const homeRouter = require('./router/homeRouter');
const productRouter = require('./router/productRouter');
const userRouter = require('./router/userRouter');
const viewRouter = require('./router/viewRouter');
const reviewRouter = require('./router/reviewRouter');
const cartRouter = require('./router/cartRouter');
const bookingRouter = require('./router/bookingRouter');
const globalErrorHandler = require('./controller/errorController');
const AppError = require('./utiles/appError');
const bookingController = require('./controller/bookingController');

const app = express();

// MIDDLEWARE
// set http secure header
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimiter({
  max: 100, // number of request
  windowMs: 60 * 60 * 1000, // timeframe
  message: 'To many request from this IP, please try again in an hour.',
});
app.use('/api', limiter);

// setting view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
// body-parser to read req.body
app.use(express.json({ limit: '10kb' }));

// for reading cookies
app.use(cookieParser());

// Data sanitize to protect against NoSql query injection
app.use(mongoSanitizer());

// To prevet form xss
app.use(xss());

// Preventing parameters pollution
app.use(
  hpp({
    whitelist: ['price', 'averagRating', 'weight', 'topCategory'],
  })
);

// Content Secutriy Policy
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'", 'js.stripe.com'],
      scriptSrc: ["'self'", 'apis.google.com', 'cdnjs.cloudflare.com', 'js.stripe.com'],
      imageSrc: ["'self'", 'https://lh3.googleusercontent.com'],
      upgradeInsecureRequests: [],
    },
  })
);

// Compressing files
app.use(compression());

// Webhook Checkout
// app.post(
//   '/webhook-checkout',
//   express.raw({
//     type: 'application/json',
//   }),
//   bookingController.webhooksCheckOut
// );

// ROUETES
app.use('/', viewRouter);
app.use('/api/v1/home', homeRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError('Can not found this url on this server.', 400));
});

// TO DIFINE GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
