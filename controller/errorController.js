const AppError = require('../utiles/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = (err) => {
  // const value = err.keyValue.email;
  const message = `Duplicate field value. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((ele) => ele.message);
  const msg = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(msg, 400);
};

const hadleJWTtokenError = () => new AppError('Invalid token, please login again', 401);

const handleJWTExpiredError = () => new AppError('Token expired, please login again', 401);

const sendDevError = (err, req, res) => {
  // 1. APIs
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // 2. RENDERED WEBSITE
  console.log('ERROR', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    mssg: err.message,
  });
};

const sendProdError = (err, req, res) => {
  // 1. APIs
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      // Operational, trusted error: send message to clinet
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // Programming error or other unknown error: don't show error to the clinet
    // 1) Log Error
    console.error('ERROR: ', err);

    //2) Send generic error
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }

  // 2. RENDERED WEBSITE
  if (err.isOperational) {
    // Operational, trusted error: send message to clinet
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong !!',
      msg: err.message,
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = err;

    // HANDLE CAST ERROR
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    // HADLEING DUPLICATED FIELD ERROR
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    // HANDLE VALIDATION ERROR
    if (error.name === 'ValidationError') error = handleValidationError(error);
    // JsonWebTokenError
    if (error.name === 'JsonWebTokenError') error = hadleJWTtokenError();
    // TokenExpiredError
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendProdError(error, req, res);
  }
};
