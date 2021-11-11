const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
// const bcrypt = require('bcryptjs')
const { promisify } = require('util');

const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const AppError = require('../utiles/appError');
const catchAsync = require('../utiles/catchAsync');
const Email = require('../utiles/email');

// Google Auth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    algorithm: 'HS256', // default algorithm
    expiresIn: process.env.JWT_EXPIERS_IN,
  });

const createAndSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIERS_IN * 24 * 60 * 60 * 1000),
    httponly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  if (user.password) user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const url = `${req.protocol}://${req.get('host')}/products`;
  await new Email(newUser, url).sendWelcome();

  createAndSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. check if user and password exist not in the db
  if (!email || !password) return next(new AppError('Please provide email or password', 400));

  // 2. if email and password exist, then get the user from database through email
  const user = await User.findOne({ email }).select('+password');

  // 3. check if the password is correct or not
  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new AppError('Invalid email or password. Please use correct information', 401));

  createAndSendToken(user, 200, req, res);
});

// LogOut
exports.logout = catchAsync(async (req, res, next) => {
  // overwrite the cookie
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httponly: true,
  });

  res.status(200).json({ status: 'success' });
});

// Protecting routes( need authentication)
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1. Taking token and check if the user is there
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    // FOR APIS
    if (req.originalUrl.startsWith('/api'))
      return next(new AppError('You are not logged in, please login in first.'));

    // FOR WEBSITE
    return res.redirect('/login');
  }

  // 2. Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. check if the user is still exist
  const currentUser = await User.findById(decoded.id);

  if (!currentUser)
    return next(new AppError('The user belonging to this token dose no longer exist', 404));

  // 4. if the user changes the current password
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password,  please login again', 401));
  }
  // Grant access to the all protected routes
  req.user = currentUser;

  next();
});

// only for render page, is user logged in or not. no error should be return
exports.isLogged = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1. Token Verification
      const decode = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      // 2. Check if the user still exsit
      const freshUser = await User.findById(decode.id);

      if (!freshUser) {
        return next();
      }

      // 3. check if the user change the password and new token was issued
      if (freshUser.changedPasswordAfter(decode.iat)) {
        return next();
      }

      // For Couting number of cart items
      const numberOfCarts = await Cart.find({ user: freshUser.id });
      res.locals.cartItems = numberOfCarts.length;

      // Means there is logged user
      res.locals.user = freshUser;

      // console.log(res.locals.user);
      return next();
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
    } catch {
      return next();
    }
  }
  next();
};

// Adding roles and restrict according to their roles (user, seller, admin)
exports.restrictExcept =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You don not have premission to access this route.', 401));
    }
    next();
  };

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1. Get the user via it's email id
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new AppError('Please Provide a valid email address'));
  // 2. Generate a random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Send this token through the email
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/passwordreset/${resetToken}`;
    await new Email(user, resetURL).sendResetPassword();

    if (process.env.NODE_ENV === 'production')
      return res.status(200).json({
        status: 'success',
        message: 'Email sent to your email address',
      });
    res.status(200).json({
      status: 'success',
      message: 'Token send successfully.',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.resetTokenExpires = undefined;

    user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error occurred in sending email please try again in a few minutes',
        500
      )
    );
  }
});

// on forget password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get the user based on token
  const hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashToken,
    resetTokenExpires: { $gt: Date.now() },
  });
  // 2. check if the token has expired or not
  if (!user) {
    return next(new AppError('Your token has expired, please try again.', 400));
  }
  // 3. Finally updated the password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  // now send the jwt token
  createAndSendToken(user, 200, req, res);
});

// Update user current password
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get the user based on its id
  const user = await User.findById(req.user._id).select('+password');

  // 2. Veruify current password of user
  if (!(await user.checkPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password do not match, please try again.', 401));
  }

  // 3. If all good then update the password
  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  // 4. log user in and send jwt
  createAndSendToken(user, 201, req, res);

  next();
});

exports.authWithGoogle = catchAsync(async (req, res, next) => {
  const tokenId = req.params.token;

  if (!tokenId) return next(new AppError('Sign-In error please try again after some time.', 401));

  const ticket = await client.verifyIdToken({
    idToken: tokenId,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  let user = await User.findOne({ email: payload.email });

  if (user) return createAndSendToken(user, 201, req, res);

  user = await User.create(
    [
      {
        name: payload.name,
        email: payload.email,
        photo: payload.picture,
      },
    ],
    { validateBeforeSave: false }
  );

  createAndSendToken(user, 201, req, res);
});

exports.isLoggedWithGoogle = catchAsync(async (req, res, next) => {});
