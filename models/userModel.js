const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: [30, 'Maximum length of name can be 30'],
    minlength: [3, 'Minimum length of name should 5'],
    required: [true, 'Name can not be empty'],
  },

  email: {
    type: String,
    required: [true, 'Email can not be empty'],
    unique: [true, 'This email is in use, please try another valid email'],
    lowercase: true,
    validate: [validator.isEmail, 'Please use a valid email id'],
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'seller', 'admin'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'Password can not be empty'],
    maxlength: [20, 'Maximum length of password can be 20'],
    minlength: [8, 'Minimum length of password can be 8'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please Confirm Password'],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: 'Password do not match.',
    },
  },
  phone: {
    type: Number,
    default: 0,
  },
  primaryAddress: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
    address: {
      type: String,
      default: 'none',
    },
    description: {
      type: String,
      default: 'none',
    },
  },
  secondaryAddress: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
    address: {
      type: String,
      default: 'none',
    },
    description: {
      type: String,
      default: 'none',
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  createdAt: Date,
  passwordChangedAt: Date,
  resetTokenExpires: Date,
  passwordResetToken: String,
});

// Index for geolocation data
userSchema.index({ primaryAddress: '2dsphere' });

// if someone reset or change their password then we have make save time recorde
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.createAt = Date.now();
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

// Encrypting the password using pre middle ware hook
userSchema.pre('save', async function (next) {
  // runs if the password is changed
  if (!this.isModified('password')) return next();
  // hashing password
  this.password = await bcrypt.hash(this.password, 12);

  // undefining confirmpassword
  this.confirmPassword = undefined;
  next();
});

// show only active users
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// checking password during login
userSchema.methods.checkPassword = async function (proviededPassword, savedPassword) {
  return await bcrypt.compare(proviededPassword, savedPassword);
};

// if the user changes the password
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};

// Creating random token when user forget password and want to reset it
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // to expire the token
  this.resetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
